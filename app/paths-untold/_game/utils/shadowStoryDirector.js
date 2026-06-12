const DEFAULT_TRACE_LIMIT = 40;
const EXCERPT_LIMIT = 420;

export function createShadowDirectorRuntime({
  enabled = true,
  traceLimit = DEFAULT_TRACE_LIMIT,
  logger = console,
  moduleLoader = defaultModuleLoader
} = {}) {
  return {
    enabled,
    segmentKey: null,
    campaignDesign: null,
    directorState: null,
    pendingPlan: null,
    pendingContext: null,
    disabledReason: null,
    trace: [],
    traceLimit,
    logger,
    _modules: null,
    _moduleLoader: moduleLoader
  };
}

export async function initializeShadowSegment({ runtime, storyBlueprint }) {
  if (!runtime?.enabled) {
    return { ok: false, reason: 'shadow_disabled' };
  }

  if (!storyBlueprint || typeof storyBlueprint !== 'object') {
    runtime.disabledReason = 'missing_story_blueprint';
    return { ok: false, reason: runtime.disabledReason };
  }

  try {
    const modules = await ensureModules(runtime);
    const segmentKey = modules.getStoryBlueprintSegmentKey(storyBlueprint);

    if (!segmentKey) {
      const adapted = modules.adaptStoryBlueprintToCampaignDesign(storyBlueprint);
      runtime.disabledReason = adapted.reason || 'missing_current_blueprint_segment';
      runtime.segmentKey = null;
      runtime.campaignDesign = null;
      runtime.directorState = null;
      runtime.pendingPlan = null;
      runtime.pendingContext = null;
      return { ok: false, reason: runtime.disabledReason, errors: adapted.errors ?? [] };
    }

    if (runtime.segmentKey === segmentKey && runtime.campaignDesign && runtime.directorState) {
      return { ok: true, segmentKey, reused: true };
    }

    const adapted = modules.adaptStoryBlueprintToCampaignDesign(storyBlueprint);
    if (!adapted.ok) {
      runtime.disabledReason = adapted.reason;
      runtime.segmentKey = segmentKey;
      runtime.campaignDesign = null;
      runtime.directorState = null;
      runtime.pendingPlan = null;
      runtime.pendingContext = null;
      return { ok: false, reason: adapted.reason, errors: adapted.errors ?? [] };
    }

    runtime.segmentKey = adapted.segmentKey;
    runtime.campaignDesign = adapted.campaignDesign;
    runtime.directorState = modules.createInitialDirectorState(
      adapted.campaignDesign,
      seedForSegment(adapted.segmentKey)
    );
    runtime.pendingPlan = null;
    runtime.pendingContext = null;
    runtime.disabledReason = null;

    appendTrace(runtime, {
      type: 'segment-init',
      segmentKey: adapted.segmentKey,
      adapterQuality: adapted.adapterQuality,
      threadIds: adapted.campaignDesign.threads.map((thread) => thread.id)
    });

    return { ok: true, segmentKey: adapted.segmentKey, reused: false };
  } catch (error) {
    runtime.disabledReason = summarizeError(error);
    return { ok: false, reason: runtime.disabledReason };
  }
}

export async function planShadowScene({
  runtime,
  playerChoice = '',
  liveDirectionText = '',
  liveWaveRole = null,
  sceneIndex = 0
}) {
  if (!runtime?.enabled) {
    return { ok: false, reason: 'shadow_disabled' };
  }

  if (runtime.pendingPlan) {
    return {
      ok: true,
      reusedPending: true,
      plan: runtime.pendingPlan
    };
  }

  if (!runtime.campaignDesign || !runtime.directorState) {
    return { ok: false, reason: runtime.disabledReason || 'shadow_not_initialized' };
  }

  try {
    const modules = await ensureModules(runtime);
    const plan = modules.planNextScene(runtime.campaignDesign, runtime.directorState, {
      playerTargetThreadId: null
    });
    runtime.pendingPlan = plan;
    runtime.pendingContext = {
      segmentKey: runtime.segmentKey,
      sceneIndex,
      playerChoice,
      live: {
        blueprintWaveRole: liveWaveRole,
        directionText: liveDirectionText
      }
    };

    return { ok: true, plan };
  } catch (error) {
    runtime.disabledReason = summarizeError(error);
    runtime.pendingPlan = null;
    runtime.pendingContext = null;
    return { ok: false, reason: runtime.disabledReason };
  }
}

export function commitShadowScene({ runtime, generatedScene, sceneIndex }) {
  if (!runtime?.enabled || !runtime.pendingPlan) {
    return { ok: false, reason: 'no_pending_shadow_plan' };
  }

  try {
    const modules = runtime._modules;
    if (!modules) {
      throw new Error('shadow modules were not initialized');
    }

    const plan = runtime.pendingPlan;
    const context = runtime.pendingContext ?? {};
    const beforeState = plan.focusThreadId
      ? runtime.directorState?.threadStates?.[plan.focusThreadId]
      : null;
    const nextDirectorState = modules.commitScenePlan(
      runtime.campaignDesign,
      runtime.directorState,
      plan
    );
    runtime.directorState = nextDirectorState;
    runtime.pendingPlan = null;
    runtime.pendingContext = null;

    const entry = buildSceneTraceEntry({
      runtime,
      context,
      plan,
      beforeState,
      generatedScene,
      sceneIndex,
      generationSucceeded: true
    });
    appendTrace(runtime, entry);
    logCommittedScene(runtime, entry);

    return { ok: true, entry };
  } catch (error) {
    const reason = summarizeError(error);
    runtime.pendingPlan = null;
    runtime.pendingContext = null;
    runtime.disabledReason = reason;
    return { ok: false, reason };
  }
}

export function failShadowScene({ runtime, error, sceneIndex, terminal = true }) {
  if (!runtime?.enabled || !runtime.pendingPlan) {
    return { ok: false, reason: 'no_pending_shadow_plan' };
  }

  if (!terminal) {
    return {
      ok: true,
      pendingPreserved: true
    };
  }

  const plan = runtime.pendingPlan;
  const context = runtime.pendingContext ?? {};
  const beforeState = plan.focusThreadId
    ? runtime.directorState?.threadStates?.[plan.focusThreadId]
    : null;
  const entry = buildSceneTraceEntry({
    runtime,
    context,
    plan,
    beforeState,
    generatedScene: null,
    sceneIndex,
    generationSucceeded: false,
    errorSummary: summarizeError(error)
  });

  appendTrace(runtime, entry);
  runtime.pendingPlan = null;
  runtime.pendingContext = null;

  return { ok: true, entry };
}

export function getShadowTrace(runtime) {
  return Array.isArray(runtime?.trace) ? runtime.trace.slice() : [];
}

async function ensureModules(runtime) {
  if (runtime._modules) return runtime._modules;
  runtime._modules = await runtime._moduleLoader();
  return runtime._modules;
}

async function defaultModuleLoader() {
  const [adapterModule, directorModule] = await Promise.all([
    import('../director/storyBlueprintCampaignAdapter.js'),
    import('../director/storyDirector.js')
  ]);

  return {
    adaptStoryBlueprintToCampaignDesign: adapterModule.adaptStoryBlueprintToCampaignDesign,
    getStoryBlueprintSegmentKey: adapterModule.getStoryBlueprintSegmentKey,
    createInitialDirectorState: directorModule.createInitialDirectorState,
    planNextScene: directorModule.planNextScene,
    commitScenePlan: directorModule.commitScenePlan
  };
}

function buildSceneTraceEntry({
  runtime,
  context,
  plan,
  beforeState,
  generatedScene,
  sceneIndex,
  generationSucceeded,
  errorSummary
}) {
  return {
    type: generationSucceeded ? 'scene' : 'scene-failure',
    segmentKey: context.segmentKey ?? runtime.segmentKey,
    sceneIndex: context.sceneIndex ?? sceneIndex,
    playerChoice: context.playerChoice ?? '',
    live: {
      blueprintWaveRole: context.live?.blueprintWaveRole ?? null,
      directionText: context.live?.directionText ?? ''
    },
    shadow: {
      focusThreadId: plan.focusThreadId ?? null,
      beat: plan.beat ?? (plan.complete ? 'complete' : null),
      modifier: plan.modifier ?? null,
      directionText: plan.directionText ?? '',
      reasonCodes: Array.isArray(plan.reasonCodes) ? plan.reasonCodes.slice() : [],
      pressureBefore: beforeState?.pressure ?? null,
      pressureAfter: plan.nextPressure ?? beforeState?.pressure ?? null,
      progressBefore: beforeState?.progress ?? null,
      progressAfter: plan.nextProgress ?? beforeState?.progress ?? null,
      rngStateBefore: plan.rngStateBeforePlan ?? runtime.directorState?.rngState ?? null,
      rngStateAfter: plan.rngStateAfterPlan ?? runtime.directorState?.rngState ?? null
    },
    generatedSceneExcerpt: generationSucceeded ? excerptScene(generatedScene) : '',
    generationSucceeded,
    ...(generationSucceeded ? {} : { errorSummary })
  };
}

function appendTrace(runtime, entry) {
  runtime.trace = [...(runtime.trace ?? []), entry].slice(-runtime.traceLimit);
}

function excerptScene(generatedScene) {
  const prose = typeof generatedScene?.prose === 'string' ? generatedScene.prose : '';
  const summary = typeof generatedScene?.summary === 'string' ? generatedScene.summary : '';
  const text = (prose || summary || '').replace(/\s+/g, ' ').trim();
  return text.length > EXCERPT_LIMIT ? `${text.slice(0, EXCERPT_LIMIT - 3)}...` : text;
}

function logCommittedScene(runtime, entry) {
  const logger = runtime.logger;
  if (!logger?.groupCollapsed || !logger?.groupEnd || !logger?.log) return;

  logger.groupCollapsed(
    `[Paths Untold shadow] Scene ${entry.sceneIndex}: live=${entry.live.blueprintWaveRole ?? 'none'}, shadow=${entry.shadow.beat ?? 'none'}`
  );
  logger.log('player choice', entry.playerChoice || '(continue)');
  logger.log('live direction', entry.live.directionText || '(none)');
  logger.log('shadow direction', entry.shadow.directionText || '(none)');
  logger.log('focus thread', entry.shadow.focusThreadId || '(none)');
  logger.log('pressure/progress', {
    pressure: `${entry.shadow.pressureBefore ?? 'n/a'} -> ${entry.shadow.pressureAfter ?? 'n/a'}`,
    progress: `${entry.shadow.progressBefore ?? 'n/a'} -> ${entry.shadow.progressAfter ?? 'n/a'}`
  });
  logger.log('reason codes', entry.shadow.reasonCodes);
  logger.log('generated excerpt', entry.generatedSceneExcerpt || '(empty)');
  logger.groupEnd();
}

function seedForSegment(segmentKey) {
  let hash = 2166136261;
  for (const char of String(segmentKey)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function summarizeError(error) {
  if (!error) return 'unknown_shadow_error';
  if (typeof error === 'string') return error.slice(0, 160);
  return String(error.message || error).slice(0, 160);
}

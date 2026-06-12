import { describe, expect, it, vi } from 'vitest';
import {
  commitShadowScene,
  createShadowDirectorRuntime,
  failShadowScene,
  getShadowTrace,
  initializeShadowSegment,
  planShadowScene
} from './shadowStoryDirector.js';

describe('shadow story director runtime', () => {
  it('performs no imports or planning when disabled', async () => {
    const moduleLoader = vi.fn(async () => {
      throw new Error('should not import');
    });
    const runtime = createShadowDirectorRuntime({
      enabled: false,
      moduleLoader
    });

    expect(await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() })).toMatchObject({
      ok: false,
      reason: 'shadow_disabled'
    });
    expect(await planShadowScene({ runtime })).toMatchObject({
      ok: false,
      reason: 'shadow_disabled'
    });
    expect(moduleLoader).not.toHaveBeenCalled();
  });

  it('initializes director state for a valid segment', async () => {
    const runtime = createRuntime();
    const result = await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });

    expect(result.ok).toBe(true);
    expect(runtime.segmentKey).toBe('0:0');
    expect(runtime.campaignDesign.mainThreatId).toBe('shadow_arc_0');
    expect(runtime.directorState.threadStates.shadow_arc_0.status).toBe('active');
    expect(getShadowTrace(runtime)[0]).toMatchObject({
      type: 'segment-init',
      segmentKey: '0:0',
      adapterQuality: 'coarse'
    });
  });

  it('does not reset state when initializing the same segment twice', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const directorState = runtime.directorState;
    const second = await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });

    expect(second).toMatchObject({ ok: true, reused: true });
    expect(runtime.directorState).toBe(directorState);
  });

  it('reinitializes on segment change while preserving capped trace', async () => {
    const runtime = createRuntime({ traceLimit: 4 });
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    await initializeShadowSegment({
      runtime,
      storyBlueprint: makeBlueprint({ currentChapterIndex: 1 })
    });

    const trace = getShadowTrace(runtime);
    expect(runtime.segmentKey).toBe('0:1');
    expect(trace.map((entry) => entry.type)).toEqual(['segment-init', 'segment-init']);
  });

  it('planning does not commit state or advance RNG', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const beforeState = runtime.directorState;
    const beforeRng = beforeState.rngState;
    const result = await planShadowScene({
      runtime,
      playerChoice: 'Open the door',
      liveDirectionText: 'Live direction',
      liveWaveRole: 'build',
      sceneIndex: 3
    });

    expect(result.ok).toBe(true);
    expect(runtime.directorState).toBe(beforeState);
    expect(runtime.directorState.rngState).toBe(beforeRng);
    expect(runtime.pendingPlan).toBe(result.plan);
  });

  it('successful commit advances state and RNG exactly once', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const beforeTurn = runtime.directorState.turn;
    const planResult = await planShadowScene({
      runtime,
      playerChoice: 'Press the witness',
      liveDirectionText: 'Live direction',
      liveWaveRole: 'build',
      sceneIndex: 4
    });
    const rngAfterPlan = planResult.plan.rngStateAfterPlan;
    const commitResult = commitShadowScene({
      runtime,
      generatedScene: { prose: 'A short generated scene resolves nothing yet.' },
      sceneIndex: 4
    });

    expect(commitResult.ok).toBe(true);
    expect(runtime.directorState.turn).toBe(beforeTurn + 1);
    expect(runtime.directorState.rngState).toBe(rngAfterPlan);
    expect(runtime.pendingPlan).toBe(null);
  });

  it('terminal failure does not advance state or RNG', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const beforeState = runtime.directorState;
    const beforeRng = beforeState.rngState;
    await planShadowScene({ runtime, sceneIndex: 5 });

    const result = failShadowScene({
      runtime,
      error: new Error('parse failed'),
      sceneIndex: 5,
      terminal: true
    });

    expect(result.ok).toBe(true);
    expect(runtime.directorState).toBe(beforeState);
    expect(runtime.directorState.rngState).toBe(beforeRng);
    expect(runtime.pendingPlan).toBe(null);
    expect(getShadowTrace(runtime).at(-1)).toMatchObject({
      type: 'scene-failure',
      generationSucceeded: false
    });
  });

  it('repeated failure then manual replan reproduces the same plan', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const first = await planShadowScene({ runtime, sceneIndex: 6 });
    failShadowScene({ runtime, error: 'bad json', sceneIndex: 6, terminal: true });
    const second = await planShadowScene({ runtime, sceneIndex: 6 });

    expect(second.plan.focusThreadId).toBe(first.plan.focusThreadId);
    expect(second.plan.beat).toBe(first.plan.beat);
    expect(second.plan.rngStateAfterPlan).toBe(first.plan.rngStateAfterPlan);
  });

  it('reuses a pending plan rather than redrawing during retry', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    const first = await planShadowScene({ runtime, sceneIndex: 7 });
    const second = await planShadowScene({ runtime, sceneIndex: 7 });
    const retry = failShadowScene({ runtime, error: 'first parse failed', sceneIndex: 7, terminal: false });

    expect(second.reusedPending).toBe(true);
    expect(second.plan).toBe(first.plan);
    expect(retry.pendingPreserved).toBe(true);
    expect(runtime.pendingPlan).toBe(first.plan);
  });

  it('caps trace at 40 entries', async () => {
    const runtime = createRuntime({ traceLimit: 40 });
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });

    for (let i = 0; i < 45; i += 1) {
      await planShadowScene({ runtime, sceneIndex: i });
      commitShadowScene({
        runtime,
        generatedScene: { prose: `Scene ${i}` },
        sceneIndex: i
      });
    }

    expect(getShadowTrace(runtime)).toHaveLength(40);
  });

  it('trace contains live and shadow direction', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    await planShadowScene({
      runtime,
      playerChoice: 'Ask why',
      liveDirectionText: 'Keep building toward the current chapter.',
      liveWaveRole: 'build',
      sceneIndex: 8
    });
    commitShadowScene({
      runtime,
      generatedScene: { prose: 'The answer arrives with a cost.' },
      sceneIndex: 8
    });

    const entry = getShadowTrace(runtime).at(-1);
    expect(entry.live.directionText).toBe('Keep building toward the current chapter.');
    expect(entry.shadow.directionText).toContain('Focus this scene on');
  });

  it('truncates generated excerpts and does not retain full memory', async () => {
    const runtime = createRuntime();
    await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });
    await planShadowScene({ runtime, sceneIndex: 9 });
    commitShadowScene({
      runtime,
      generatedScene: {
        prose: 'x'.repeat(900),
        memory: { world: { secret: 'should not be stored' } }
      },
      sceneIndex: 9
    });

    const serialized = JSON.stringify(getShadowTrace(runtime).at(-1));
    expect(getShadowTrace(runtime).at(-1).generatedSceneExcerpt.length).toBeLessThanOrEqual(420);
    expect(serialized).not.toContain('should not be stored');
    expect(serialized).not.toContain('"memory"');
  });

  it('invalid adapter result disables only the shadow runtime', async () => {
    const runtime = createRuntime();
    const result = await initializeShadowSegment({
      runtime,
      storyBlueprint: makeBlueprint({ arcs: [] })
    });

    expect(result.ok).toBe(false);
    expect(runtime.disabledReason).toBe('missing_current_arc');
  });

  it('swallows shadow errors as structured failures', async () => {
    const runtime = createShadowDirectorRuntime({
      moduleLoader: async () => {
        throw new Error('loader failed');
      },
      logger: silentLogger()
    });

    const result = await initializeShadowSegment({ runtime, storyBlueprint: makeBlueprint() });

    expect(result).toMatchObject({
      ok: false,
      reason: 'loader failed'
    });
    expect(runtime.disabledReason).toBe('loader failed');
  });
});

function createRuntime(options = {}) {
  return createShadowDirectorRuntime({
    logger: silentLogger(),
    ...options
  });
}

function silentLogger() {
  return {
    groupCollapsed: vi.fn(),
    groupEnd: vi.fn(),
    log: vi.fn()
  };
}

function makeBlueprint({ currentChapterIndex = 0, ...overrides } = {}) {
  return {
    coreQuestion: 'Can the household keep its promise?',
    storyIdentity: 'A tense inheritance negotiation',
    currentArcIndex: 0,
    arcs: [
      {
        id: 'arc_0',
        purpose: 'Keep the inheritance talks honest',
        focusAxis: 'duty_vs_grief',
        currentChapterIndex,
        chapters: [
          {
            id: 'arc_0_ch_0',
            purpose: 'Name the first hidden obligation',
            mustResolve: 'Expose why the ledger is incomplete'
          },
          {
            id: 'arc_0_ch_1',
            purpose: 'Decide who carries the debt',
            mustResolve: 'Settle the disputed family debt'
          }
        ]
      }
    ],
    ...overrides
  };
}

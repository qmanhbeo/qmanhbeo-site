import { describe, expect, it } from 'vitest';
import {
  STAKES_CEILINGS,
  THREAD_STATUSES,
  VILLAGE_CURSE_CAMPAIGN,
  validateCampaignDesign
} from './campaignDesign.js';
import { createRngState, nextRandom, randomInt, weightedPick } from './seededRandom.js';
import {
  BEAT_WEIGHT_PROFILES,
  applyMomentum,
  canResolveThread,
  chooseFocusThread,
  commitScenePlan,
  createInitialDirectorState,
  drawBeat,
  planNextScene
} from './storyDirector.js';
import { runSimulation } from './storyDirectorSimulation.js';

function cloneDesign(overrides = {}) {
  return {
    ...structuredClone(VILLAGE_CURSE_CAMPAIGN),
    ...overrides
  };
}

function withThreadState(state, threadId, patch) {
  return {
    ...state,
    threadStates: {
      ...state.threadStates,
      [threadId]: {
        ...state.threadStates[threadId],
        ...patch
      }
    }
  };
}

function withThreadDesign(design, threadId, patch) {
  return {
    ...design,
    threads: design.threads.map((thread) =>
      thread.id === threadId ? { ...thread, ...patch } : thread
    )
  };
}

function findPlanMatching(mutator, predicate) {
  for (let seed = 1; seed < 20000; seed += 1) {
    const state = mutator(createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, seed));
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'missing_children'
    });

    if (predicate(plan)) {
      return { state, plan };
    }
  }

  throw new Error('Could not find deterministic seed for requested plan');
}

describe('campaign design validation', () => {
  it('accepts the valid fixture', () => {
    expect(validateCampaignDesign(VILLAGE_CURSE_CAMPAIGN)).toEqual({
      valid: true,
      errors: []
    });
  });

  it('rejects duplicate thread IDs', () => {
    const design = cloneDesign({
      threads: [
        ...VILLAGE_CURSE_CAMPAIGN.threads,
        { ...VILLAGE_CURSE_CAMPAIGN.threads[0] }
      ]
    });

    expect(validateCampaignDesign(design).errors).toContain('duplicate thread id: village_curse');
  });

  it('rejects missing mainThreatId', () => {
    const design = cloneDesign({ mainThreatId: 'not_real' });

    expect(validateCampaignDesign(design).errors).toContain('mainThreatId does not exist: not_real');
  });

  it('rejects cycles in the parent chain', () => {
    const design = withThreadDesign(
      withThreadDesign(cloneDesign(), 'village_curse', { parentId: 'missing_children' }),
      'missing_children',
      { parentId: 'village_curse' }
    );

    expect(validateCampaignDesign(design).errors).toContain('parent cycle detected at village_curse');
  });

  it('rejects unknown parentId', () => {
    const design = withThreadDesign(cloneDesign(), 'missing_children', { parentId: 'ghost' });

    expect(validateCampaignDesign(design).errors).toContain('unknown parentId for missing_children: ghost');
  });

  it('rejects missing requiredChildId', () => {
    const design = withThreadDesign(cloneDesign(), 'village_curse', {
      requiredChildIds: ['missing_children', 'ghost']
    });

    expect(validateCampaignDesign(design).errors).toContain('unknown requiredChildId for village_curse: ghost');
  });

  it('rejects pressure out of 0-100', () => {
    const design = withThreadDesign(cloneDesign(), 'old_mill_fire', { initialPressure: 101 });

    expect(validateCampaignDesign(design).errors).toContain('initialPressure must be 0-100 for old_mill_fire');
  });

  it('rejects scope exceeding the stakes ceiling', () => {
    const design = withThreadDesign(cloneDesign(), 'old_mill_fire', { scope: 'world' });

    expect(validateCampaignDesign(design).errors).toContain('scope exceeds stakes ceiling for old_mill_fire: world');
  });

  it('rejects zero or multiple main threats', () => {
    const zeroMain = withThreadDesign(cloneDesign(), 'village_curse', { role: 'sub' });
    const manyMain = withThreadDesign(cloneDesign(), 'old_mill_fire', { role: 'main' });

    expect(validateCampaignDesign(zeroMain).errors).toContain('expected exactly one main thread, found 0');
    expect(validateCampaignDesign(manyMain).errors).toContain('expected exactly one main thread, found 2');
  });

  it('rejects stronger schema errors added for v1', () => {
    const base = cloneDesign();
    const cases = [
      withThreadDesign(base, 'old_mill_fire', { parentId: 'old_mill_fire' }),
      withThreadDesign(base, 'village_curse', { requiredChildIds: ['village_curse'] }),
      withThreadDesign(base, 'village_curse', { requiredChildIds: ['missing_children', 'missing_children'] }),
      withThreadDesign(base, 'old_mill_fire', { initialStatus: 'paused' }),
      withThreadDesign(base, 'old_mill_fire', { role: 'sidequest' }),
      withThreadDesign(base, 'old_mill_fire', {
        initialStatus: THREAD_STATUSES.RESOLVED,
        initialPressure: 5,
        initialProgress: 99
      }),
      withThreadDesign(base, 'elara_secret', { initialProgress: 70 }),
      cloneDesign({ mainThreatId: 'missing_children' })
    ];

    expect(cases.map((design) => validateCampaignDesign(design).valid)).toEqual(
      cases.map(() => false)
    );
  });

  it('rejects required child IDs that are not descendants', () => {
    const design = withThreadDesign(cloneDesign(), 'missing_children', {
      requiredChildIds: ['old_mill_fire']
    });

    expect(validateCampaignDesign(design).errors).toContain(
      'requiredChildId must be a descendant of missing_children: old_mill_fire'
    );
  });

  it('keeps scope ordering explicit', () => {
    expect(STAKES_CEILINGS.indexOf('personal')).toBeLessThan(STAKES_CEILINGS.indexOf('world'));
  });

  it('requires campaign-level identity fields', () => {
    const design = cloneDesign({ premise: '' });

    expect(validateCampaignDesign(design).errors).toContain('premise is required');
  });

  it('validates top-level forbiddenReveals when present', () => {
    const design = cloneDesign({ forbiddenReveals: ['valid', ''] });

    expect(validateCampaignDesign(design).errors).toContain(
      'forbiddenReveals must be an array of non-empty strings'
    );
  });
});

describe('seeded RNG', () => {
  it('produces identical 1000-value sequences for the same seed', () => {
    let left = createRngState(1234);
    let right = createRngState(1234);

    for (let index = 0; index < 1000; index += 1) {
      const leftDraw = nextRandom(left);
      const rightDraw = nextRandom(right);
      expect(leftDraw.value).toBe(rightDraw.value);
      left = leftDraw.nextState;
      right = rightDraw.nextState;
    }
  });

  it('produces different sequences for different seeds', () => {
    let left = createRngState(1);
    let right = createRngState(2);
    const leftValues = [];
    const rightValues = [];

    for (let index = 0; index < 20; index += 1) {
      const leftDraw = nextRandom(left);
      const rightDraw = nextRandom(right);
      leftValues.push(leftDraw.value);
      rightValues.push(rightDraw.value);
      left = leftDraw.nextState;
      right = rightDraw.nextState;
    }

    expect(leftValues).not.toEqual(rightValues);
  });

  it('returns randomInt values within bounds', () => {
    let state = createRngState(88);

    for (let index = 0; index < 100; index += 1) {
      const draw = randomInt(-2, 3, state);
      expect(draw.value).toBeGreaterThanOrEqual(-2);
      expect(draw.value).toBeLessThanOrEqual(3);
      state = draw.nextState;
    }
  });

  it('returns a valid weightedPick index and rejects zero total weight', () => {
    expect(weightedPick([0, 10, 0], createRngState(9)).index).toBe(1);
    expect(() => weightedPick([0, 0], createRngState(9))).toThrow('positive total weight');
  });

  it('uses a plain number as RNG state', () => {
    expect(typeof createRngState(-1)).toBe('number');
    expect(Number.isInteger(createRngState(-1))).toBe(true);
  });
});

describe('focus thread selection', () => {
  it('returns a valid player override without consuming RNG', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 50);
    const result = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'missing_children'
    });

    expect(result.threadId).toBe('missing_children');
    expect(result.reasonCodes).toContain('player_target_override');
    expect(result.rngStateAfterFocus).toBe(state.rngState);
  });

  it('gracefully ignores a resolved player override', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 50),
      'missing_children',
      { status: THREAD_STATUSES.RESOLVED, pressure: 0, progress: 100 }
    );
    const result = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'missing_children'
    });

    expect(result.threadId).not.toBe('missing_children');
  });

  it('prefers pending aftermath unless superseded by a valid player target', () => {
    const state = {
      ...withThreadState(createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 10), 'old_mill_fire', {
        status: THREAD_STATUSES.RESOLVED,
        pressure: 0,
        progress: 100
      }),
      pendingAftermathThreadId: 'old_mill_fire'
    };

    expect(chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {}).threadId).toBe('old_mill_fire');
    expect(
      chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {
        playerTargetThreadId: 'missing_children'
      }).threadId
    ).toBe('missing_children');
  });

  it('keeps active threads eligible and resolved threads ineligible', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'old_mill_fire',
      { status: THREAD_STATUSES.RESOLVED, pressure: 0, progress: 100 }
    );
    const result = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {}, state.rngState);

    expect(result.candidateWeights.missing_children).toBeGreaterThan(0);
    expect(result.candidateWeights.old_mill_fire).toBe(0);
  });

  it('gives seeded children no weight when their parent is inactive', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'village_curse',
      { status: THREAD_STATUSES.RESOLVED, pressure: 0, progress: 100 }
    );
    const result = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {}, state.rngState);

    expect(result.candidateWeights.elara_secret).toBe(0);
  });

  it('reduces parent umbrella focus while preserving child opportunities', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    const result = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, state, {}, state.rngState);

    expect(result.candidateWeights.village_curse).toBeGreaterThan(0);
    expect(result.candidateWeights.missing_children).toBeGreaterThan(result.candidateWeights.village_curse);
    expect(result.candidateWeights.old_mill_fire).toBeGreaterThan(result.candidateWeights.village_curse);
  });
});

describe('beat selection and resolution gates', () => {
  it('forces seeded threads to introduce', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 3);
    const result = drawBeat(VILLAGE_CURSE_CAMPAIGN, state, 'elara_secret', state.rngState);

    expect(result.beat).toBe('introduce');
    expect(result.reasonCodes).toContain('seeded_must_introduce');
  });

  it('forces aftermath for a resolved thread and never returns undefined', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 3),
      'old_mill_fire',
      { status: THREAD_STATUSES.RESOLVED, pressure: 0, progress: 100 }
    );
    const result = drawBeat(VILLAGE_CURSE_CAMPAIGN, state, 'old_mill_fire', state.rngState);

    expect(result.beat).toBe('aftermath');
    expect(result.beat).toBeDefined();
  });

  it('sets escalate weight to zero after 3 consecutive escalations', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 3),
      'missing_children',
      { consecutiveEscalations: 3 }
    );
    const adjusted = applyMomentum(VILLAGE_CURSE_CAMPAIGN, state, 'missing_children', {
      introduce: 0,
      escalate: 35,
      hold: 25,
      partial_release: 25,
      resolve: 15,
      aftermath: 0
    });

    expect(adjusted.escalate).toBe(0);
  });

  it('adds quiet-momentum escalation pressure after two quiet beats', () => {
    const state = {
      ...createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 3),
      recentBeats: [
        { threadId: 'missing_children', beat: 'hold' },
        { threadId: 'missing_children', beat: 'partial_release' }
      ]
    };
    const adjusted = applyMomentum(VILLAGE_CURSE_CAMPAIGN, state, 'missing_children', {
      introduce: 0,
      escalate: 35,
      hold: 25,
      partial_release: 25,
      resolve: 15,
      aftermath: 0
    });

    expect(adjusted.escalate).toBe(50);
  });

  it('exposes original, previousPassive, and build-oriented currentTuned beat weight profiles', () => {
    expect(BEAT_WEIGHT_PROFILES.original[0].weights).toMatchObject({
      escalate: 45,
      hold: 20,
      partial_release: 5,
      resolve: 0
    });
    expect(BEAT_WEIGHT_PROFILES.previousPassive[0].weights).toMatchObject({
      escalate: 15,
      hold: 45,
      partial_release: 30,
      resolve: 10
    });
    expect(BEAT_WEIGHT_PROFILES.currentTuned[0].weights).toMatchObject({
      escalate: 50,
      hold: 35,
      partial_release: 15,
      resolve: 0
    });
  });

  it('blocks ineligible resolutions', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);

    expect(canResolveThread(VILLAGE_CURSE_CAMPAIGN, state, 'missing_children')).toBe(false);
    expect(canResolveThread(VILLAGE_CURSE_CAMPAIGN, state, 'village_curse')).toBe(false);
  });

  it('requires child gates before parent resolution', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'village_curse',
      { progress: 90 }
    );

    expect(canResolveThread(VILLAGE_CURSE_CAMPAIGN, state, 'village_curse')).toBe(false);
  });

  it('does not let an unresolved optional direct child block main-threat resolution', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    state = withThreadState(state, 'village_curse', { progress: 85 });
    state = withThreadState(state, 'missing_children', {
      status: THREAD_STATUSES.RESOLVED,
      pressure: 0,
      progress: 100
    });
    state = withThreadState(state, 'elara_secret', {
      status: THREAD_STATUSES.RESOLVED,
      pressure: 0,
      progress: 100
    });

    expect(state.threadStates.old_mill_fire.status).toBe(THREAD_STATUSES.ACTIVE);
    expect(canResolveThread(VILLAGE_CURSE_CAMPAIGN, state, 'village_curse')).toBe(true);
  });

  it('still blocks main-threat resolution when a required child is unresolved', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    state = withThreadState(state, 'village_curse', { progress: 85 });
    state = withThreadState(state, 'missing_children', {
      status: THREAD_STATUSES.RESOLVED,
      pressure: 0,
      progress: 100
    });

    expect(canResolveThread(VILLAGE_CURSE_CAMPAIGN, state, 'village_curse')).toBe(false);
  });

  it('downgrades an invalid resolve to partial_release when pressure is at least 30', () => {
    const { plan } = findPlanMatching(
      (state) =>
        withThreadState(state, 'missing_children', {
          pressure: 90,
          progress: 10
        }),
      (candidate) => candidate.reasonCodes.includes('resolve_downgraded_to_partial_release')
    );

    expect(plan.beat).toBe('partial_release');
    expect(plan.reasonCodes).toContain('resolution_progress_too_low');
  });

  it('downgrades an invalid resolve to hold when pressure is below 30', () => {
    const { plan } = findPlanMatching(
      (state) =>
        withThreadState(state, 'missing_children', {
          pressure: 25,
          progress: 10
        }),
      (candidate) => candidate.reasonCodes.includes('resolve_downgraded_to_hold')
    );

    expect(plan.beat).toBe('hold');
  });
});

describe('parent/child isolation, aftermath, and immutability', () => {
  it('does not change parent pressure, progress, or status when a child resolves', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'missing_children',
      { progress: 80, pressure: 70 }
    );
    const plan = {
      focusThreadId: 'missing_children',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    };
    const nextState = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);

    expect(nextState.threadStates.village_curse).toEqual(state.threadStates.village_curse);
  });

  it('resolving an optional child does not automatically affect the parent', () => {
    const state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'old_mill_fire',
      { progress: 80, pressure: 70 }
    );
    const parentBefore = state.threadStates.village_curse;
    const plan = {
      focusThreadId: 'old_mill_fire',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    };
    const nextState = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);

    expect(nextState.threadStates.village_curse).toEqual(parentBefore);
  });

  it('queues at most one aftermath and delivers it on the next non-overridden turn', () => {
    let state = withThreadState(
      createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1),
      'missing_children',
      { progress: 80, pressure: 70 }
    );
    const resolvePlan = {
      focusThreadId: 'missing_children',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    };

    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, resolvePlan);
    expect(state.pendingAftermathThreadId).toBe('missing_children');

    const overridePlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'old_mill_fire'
    });
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, overridePlan);
    expect(state.pendingAftermathThreadId).toBe('missing_children');

    const aftermathPlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    expect(aftermathPlan.focusThreadId).toBe('missing_children');
    expect(aftermathPlan.beat).toBe('aftermath');
    const before = state.threadStates.missing_children;
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, aftermathPlan);
    expect(state.pendingAftermathThreadId).toBe(null);
    expect(state.threadStates.missing_children.pressure).toBe(before.pressure);
    expect(state.threadStates.missing_children.progress).toBe(before.progress);
  });

  it('queues final aftermath when the main threat resolves before completing', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    const resolvePlan = {
      focusThreadId: 'village_curse',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    };

    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, resolvePlan);
    const nextPlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(state.pendingFinalAftermath).toBe(true);
    expect(nextPlan.complete).toBeUndefined();
    expect(nextPlan.focusThreadId).toBe('village_curse');
    expect(nextPlan.beat).toBe('aftermath');
  });

  it('lets valid player override defer final campaign aftermath without clearing it', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, {
      focusThreadId: 'village_curse',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    });
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'old_mill_fire'
    });

    expect(plan.focusThreadId).toBe('old_mill_fire');
    expect(plan.reasonCodes).toContain('player_target_override');
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);
    expect(state.pendingFinalAftermath).toBe(true);
    expect(state.pendingAftermathThreadId).toBe('village_curse');

    const aftermathPlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    expect(aftermathPlan.focusThreadId).toBe('village_curse');
    expect(aftermathPlan.beat).toBe('aftermath');
  });

  it('keeps queued final aftermath sticky when an overridden side thread resolves', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);

    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, {
      focusThreadId: 'village_curse',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    });

    expect(state.pendingFinalAftermath).toBe(true);
    expect(state.pendingAftermathThreadId).toBe('village_curse');

    state = withThreadState(state, 'old_mill_fire', {
      status: THREAD_STATUSES.ACTIVE,
      pressure: 50,
      progress: 90
    });
    const overridePlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'old_mill_fire'
    });

    expect(overridePlan.focusThreadId).toBe('old_mill_fire');
    expect(overridePlan.reasonCodes).toContain('player_target_override');

    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, {
      ...overridePlan,
      beat: 'resolve',
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED
    });

    expect(state.threadStates.old_mill_fire.status).toBe(THREAD_STATUSES.RESOLVED);
    expect(state.pendingFinalAftermath).toBe(true);
    expect(state.pendingAftermathThreadId).toBe('village_curse');

    const finalAftermathPlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    expect(finalAftermathPlan.focusThreadId).toBe('village_curse');
    expect(finalAftermathPlan.beat).toBe('aftermath');

    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, finalAftermathPlan);
    expect(state.pendingFinalAftermath).toBe(false);
    expect(state.pendingAftermathThreadId).toBe(null);

    const completePlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    expect(completePlan).toMatchObject({
      complete: true,
      reasonCodes: ['main_threat_resolved'],
      rngStateAfterPlan: state.rngState
    });

    const repeatCompletePlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    expect(repeatCompletePlan.complete).toBe(true);
    expect(repeatCompletePlan.beat).toBeUndefined();
  });

  it('delivers exactly one final aftermath, then completes without consuming RNG', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, {
      focusThreadId: 'village_curse',
      beat: 'resolve',
      modifier: null,
      pressureDelta: 0,
      progressDelta: 0,
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED,
      reasonCodes: [],
      rngStateAfterPlan: state.rngState
    });

    const aftermathPlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    state = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, aftermathPlan);
    const completePlan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(aftermathPlan.beat).toBe('aftermath');
    expect(state.pendingFinalAftermath).toBe(false);
    expect(completePlan).toMatchObject({
      complete: true,
      reasonCodes: ['main_threat_resolved'],
      rngStateAfterPlan: state.rngState
    });
  });

  it('stores lastFocusedTurn as the committed scene turn', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'missing_children'
    });
    const nextState = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);

    expect(nextState.turn).toBe(1);
    expect(nextState.threadStates.missing_children.lastFocusedTurn).toBe(1);
  });

  it('gives zero neglect bonus to a thread focused in the immediately previous scene', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 1);
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state, {
      playerTargetThreadId: 'missing_children'
    });
    const nextState = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);
    const focus = chooseFocusThread(VILLAGE_CURSE_CAMPAIGN, nextState, {}, nextState.rngState);
    const expectedWeight =
      nextState.threadStates.missing_children.pressure * 0.5 +
      20 +
      15;

    expect(focus.candidateWeights.missing_children).toBe(expectedWeight);
  });

  it('does not mutate campaignDesign or directorState during planning', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 9);
    const stateBefore = structuredClone(state);
    const designBefore = structuredClone(VILLAGE_CURSE_CAMPAIGN);

    planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(state).toEqual(stateBefore);
    expect(VILLAGE_CURSE_CAMPAIGN).toEqual(designBefore);
  });

  it('commit does not mutate inputs and returns a new object', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 9);
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);
    const stateBefore = structuredClone(state);
    const planBefore = structuredClone(plan);
    const nextState = commitScenePlan(VILLAGE_CURSE_CAMPAIGN, state, plan);

    expect(state).toEqual(stateBefore);
    expect(plan).toEqual(planBefore);
    expect(nextState).not.toBe(state);
    expect(nextState.threadStates).not.toBe(state.threadStates);
  });

  it('does not advance authoritative RNG state for uncommitted plans', () => {
    const state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 9);
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(state.rngState).toBe(plan.rngStateBeforePlan);
    expect(state.rngState).not.toBe(plan.rngStateAfterPlan);
  });
});

describe('simulation invariants', () => {
  it('holds core invariants across many seeds with a maximum-turn cap', () => {
    const result = runSimulation({
      campaignDesign: VILLAGE_CURSE_CAMPAIGN,
      seed: 200,
      turns: 180,
      runs: 48,
      print: false
    });

    expect(result.aggregates.boundsViolations).toBe(0);
    expect(result.aggregates.parentGateViolations).toBe(0);
    expect(result.aggregates.prematureMainResolutions).toBe(0);
    expect(result.aggregates.maxConsecutiveEscalations).toBeLessThanOrEqual(3);
    expect(result.aggregates.deterministicReplayPass).toBe(true);
    expect(result.aggregates.campaignCompletionRate).toBeGreaterThan(0);
  });

  it('completes when the main threat is resolved even if an optional side thread remains active', () => {
    const state = {
      ...createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 5),
      threadStates: {
        ...createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 5).threadStates,
        village_curse: {
          status: THREAD_STATUSES.RESOLVED,
          pressure: 0,
          progress: 100,
          lastFocusedTurn: 10,
          lastBeat: 'aftermath',
          consecutiveEscalations: 0
        }
      },
      pendingAftermathThreadId: null,
      pendingFinalAftermath: false
    };
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(state.threadStates.old_mill_fire.status).toBe(THREAD_STATUSES.ACTIVE);
    expect(plan).toMatchObject({
      complete: true,
      reasonCodes: ['main_threat_resolved'],
      rngStateAfterPlan: state.rngState
    });
  });

  it('does not complete when optional threads resolve but the main threat remains active', () => {
    let state = createInitialDirectorState(VILLAGE_CURSE_CAMPAIGN, 5);
    for (const threadId of ['missing_children', 'elara_secret', 'old_mill_fire']) {
      state = withThreadState(state, threadId, {
        status: THREAD_STATUSES.RESOLVED,
        pressure: 0,
        progress: 100
      });
    }
    const plan = planNextScene(VILLAGE_CURSE_CAMPAIGN, state);

    expect(plan.complete).toBeUndefined();
    expect(plan.focusThreadId).toBe('village_curse');
  });
});

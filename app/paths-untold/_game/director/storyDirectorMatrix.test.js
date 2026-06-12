import { describe, expect, it } from 'vitest';
import {
  BRANCHING_CITY_ELECTION_CAMPAIGN,
  CAMPAIGN_FIXTURES,
  DEEP_HARVEST_COVENANT_CAMPAIGN,
  RELATIONSHIP_INHERITANCE_CAMPAIGN,
  SINGLE_THREAD_MICRO_CAMPAIGN
} from './campaignFixtures.js';
import { THREAD_STATUSES, validateCampaignDesign } from './campaignDesign.js';
import {
  canResolveThread,
  commitScenePlan,
  createInitialDirectorState,
  planNextScene
} from './storyDirector.js';
import { runFixtureMatrix, runMatrixSimulation, runSingleFixture } from './storyDirectorMatrixSimulation.js';

const TEST_RUNS = 96;

function fixtureById(id) {
  return CAMPAIGN_FIXTURES.find((fixture) => fixture.id === id);
}

function makeFixture(campaignDesign, turnCap = 100) {
  return {
    id: campaignDesign.id,
    label: campaignDesign.label,
    campaignDesign,
    turnCap,
    pacing: {
      minAverageCompletionTurn: 1,
      maxAverageCompletionTurn: turnCap,
      minCompletionRate: 0
    }
  };
}

function forcePlan(state, focusThreadId, beat, nextStatus = state.threadStates[focusThreadId].status) {
  return {
    focusThreadId,
    beat,
    modifier: null,
    pressureDelta: 0,
    progressDelta: 0,
    nextPressure: beat === 'resolve' ? 0 : state.threadStates[focusThreadId].pressure,
    nextProgress: beat === 'resolve' ? 100 : state.threadStates[focusThreadId].progress,
    nextStatus,
    reasonCodes: [],
    rngStateAfterPlan: state.rngState
  };
}

describe('story director campaign matrix fixtures', () => {
  it('validates every fixture', () => {
    for (const fixture of CAMPAIGN_FIXTURES) {
      expect(validateCampaignDesign(fixture.campaignDesign), fixture.id).toEqual({
        valid: true,
        errors: []
      });
    }
  });

  it('passes matrix invariants across diverse fixtures and deterministic seeds', () => {
    const results = runMatrixSimulation({
      runs: TEST_RUNS,
      seed: 12000,
      print: false,
      includeSamples: false
    });

    for (const result of results) {
      const aggregates = result.aggregates;
      expect(result.validation.valid, result.fixtureId).toBe(true);
      expect(aggregates.deterministicReplayPass, result.fixtureId).toBe(true);
      expect(aggregates.boundsViolations, result.fixtureId).toBe(0);
      expect(aggregates.parentGateViolations, result.fixtureId).toBe(0);
      expect(aggregates.prematureMainResolutionViolations, result.fixtureId).toBe(0);
      expect(aggregates.resolvedBeatViolations, result.fixtureId).toBe(0);
      expect(aggregates.finalAftermathViolations, result.fixtureId).toBe(0);
      expect(aggregates.consecutiveEscalationViolations, result.fixtureId).toBe(0);
      expect(aggregates.childAutoParentViolations, result.fixtureId).toBe(0);
      expect(aggregates.maxConsecutiveEscalations, result.fixtureId).toBeLessThanOrEqual(3);
      expect(aggregates.p90ResolutionEligibleDelay, result.fixtureId).toBeLessThanOrEqual(18);
      expect(aggregates.maxUnresolvedRequiredThreadNeglectGap, result.fixtureId).toBeLessThanOrEqual(45);
    }
  });

  it('stays within broad pacing guardrails', () => {
    const results = runMatrixSimulation({
      runs: TEST_RUNS,
      seed: 13000,
      print: false,
      includeSamples: false
    });

    for (const result of results) {
      const { pacing } = fixtureById(result.fixtureId);
      const averageCompletion = result.aggregates.averageCampaignCompletionTurn;

      expect(result.aggregates.completionRate, result.fixtureId).toBeGreaterThanOrEqual(pacing.minCompletionRate);
      expect(averageCompletion, result.fixtureId).toBeGreaterThanOrEqual(pacing.minAverageCompletionTurn);
      expect(averageCompletion, result.fixtureId).toBeLessThanOrEqual(pacing.maxAverageCompletionTurn);
    }
  });

  it('runs a single-thread campaign without child assumptions', () => {
    const result = runFixtureMatrix({
      fixture: fixtureById('single-thread'),
      runs: TEST_RUNS,
      seed: 14000,
      includeSample: false
    });

    expect(result.requiredThreadCount).toBe(0);
    expect(result.aggregates.averageFirstChildResolutionTurn).toBe(null);
    expect(result.aggregates.completionRate).toBeGreaterThanOrEqual(0.99);
    expect(result.aggregates.finalAftermathViolations).toBe(0);
  });

  it('respects deep hierarchy resolution ordering', () => {
    const fixture = fixtureById('deep-hierarchy');

    for (let seed = 15000; seed < 15024; seed += 1) {
      const record = runSingleFixture({ fixture, seed });
      const turns = record.resolutionTurns;

      expect(turns.broken_covenant, `seed ${seed}`).toBeLessThan(turns.damaged_shrine);
      expect(turns.damaged_shrine, `seed ${seed}`).toBeLessThan(turns.poisoned_river);
      expect(turns.poisoned_river, `seed ${seed}`).toBeLessThan(turns.failing_harvest);
    }
  });

  it('proves optional unresolved threads do not block completion', () => {
    const state = {
      ...createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 5),
      pendingAftermathThreadId: null,
      pendingFinalAftermath: false,
      threadStates: {
        ...createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 5).threadStates,
        election_manipulation: {
          status: THREAD_STATUSES.RESOLVED,
          pressure: 0,
          progress: 100,
          lastFocusedTurn: 30,
          lastBeat: 'aftermath',
          consecutiveEscalations: 0
        },
        guild_bargain: {
          status: THREAD_STATUSES.ACTIVE,
          pressure: 50,
          progress: 20,
          lastFocusedTurn: null,
          lastBeat: null,
          consecutiveEscalations: 0
        }
      }
    };
    const plan = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state);

    expect(state.threadStates.guild_bargain.status).toBe(THREAD_STATUSES.ACTIVE);
    expect(plan.complete).toBe(true);
  });

  it('does not automatically resolve ancestors when a deep child resolves', () => {
    let state = createInitialDirectorState(DEEP_HARVEST_COVENANT_CAMPAIGN, 1);
    state = commitScenePlan(
      DEEP_HARVEST_COVENANT_CAMPAIGN,
      state,
      forcePlan(state, 'broken_covenant', 'resolve', THREAD_STATUSES.RESOLVED)
    );

    expect(state.threadStates.broken_covenant.status).toBe(THREAD_STATUSES.RESOLVED);
    expect(state.threadStates.damaged_shrine.status).toBe(THREAD_STATUSES.ACTIVE);
    expect(state.threadStates.poisoned_river.status).toBe(THREAD_STATUSES.ACTIVE);
    expect(state.threadStates.failing_harvest.status).toBe(THREAD_STATUSES.ACTIVE);
  });

  it('keeps planning and commit immutable across fixture types', () => {
    for (const fixture of CAMPAIGN_FIXTURES) {
      const state = createInitialDirectorState(fixture.campaignDesign, 77);
      const stateBeforePlan = structuredClone(state);
      const designBeforePlan = structuredClone(fixture.campaignDesign);
      const plan = planNextScene(fixture.campaignDesign, state);

      expect(state, fixture.id).toEqual(stateBeforePlan);
      expect(fixture.campaignDesign, fixture.id).toEqual(designBeforePlan);

      const planBeforeCommit = structuredClone(plan);
      const stateBeforeCommit = structuredClone(state);
      const nextState = commitScenePlan(fixture.campaignDesign, state, plan);

      expect(plan, fixture.id).toEqual(planBeforeCommit);
      expect(state, fixture.id).toEqual(stateBeforeCommit);
      expect(nextState, fixture.id).not.toBe(state);
    }
  });
});

describe('story director direction text quality', () => {
  it('includes focus, parent context, stakes, forbidden reveals, and beat-specific language without raw counters', () => {
    const fixture = fixtureById('linear-mystery');
    const record = runSingleFixture({ fixture, seed: 16000 });
    const directionEntries = record.timelineRecords.filter((entry) => entry.directionText);

    expect(directionEntries.length).toBeGreaterThan(0);
    expect(directionEntries.some((entry) => entry.directionText.includes('Focus this scene on'))).toBe(true);
    expect(directionEntries.some((entry) => entry.directionText.includes('within the larger'))).toBe(true);
    expect(directionEntries.some((entry) => entry.directionText.includes("local-scale stakes ceiling"))).toBe(true);
    expect(directionEntries.some((entry) => entry.directionText.includes('Do not reveal:'))).toBe(true);
    expect(directionEntries.some((entry) => entry.beat === 'partial_release' && entry.directionText.includes('partial relief'))).toBe(true);
    expect(directionEntries.some((entry) => entry.beat === 'aftermath' && entry.directionText.includes('queued aftermath'))).toBe(true);
    expect(directionEntries.every((entry) => !/\bP:\s*\d|\bG:\s*\d|pressure\s+\d|progress\s+\d/i.test(entry.directionText))).toBe(true);
  });

  it('keeps relationship direction text genre-neutral', () => {
    const fixture = makeFixture(RELATIONSHIP_INHERITANCE_CAMPAIGN, 100);
    const record = runSingleFixture({ fixture, seed: 17000 });
    const text = record.timelineRecords
      .map((entry) => entry.directionText ?? '')
      .join('\n')
      .toLowerCase();

    for (const forbidden of ['physical danger', 'monster', 'attack', 'battle', 'immediate threat', 'survive']) {
      expect(text.includes(forbidden), forbidden).toBe(false);
    }
    expect(text).toContain('emotional cost');
    expect(text).toContain('relationship change');
  });
});

describe('story director player override scenarios', () => {
  it('honors repeated valid side-thread overrides and then resumes weighted selection', () => {
    let state = createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 21);
    const untouchedBefore = structuredClone(state.threadStates.missing_witness);

    for (let index = 0; index < 4; index += 1) {
      const plan = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state, {
        playerTargetThreadId: 'guild_bargain'
      });

      expect(plan.focusThreadId).toBe('guild_bargain');
      expect(plan.reasonCodes).toContain('player_target_override');
      state = commitScenePlan(BRANCHING_CITY_ELECTION_CAMPAIGN, state, plan);
    }

    expect(state.threadStates.missing_witness).toEqual(untouchedBefore);

    const resumedPlan = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state);
    expect(resumedPlan.focusThreadId).toBeTruthy();
    expect(resumedPlan.reasonCodes).toContain('weighted_focus_selection');
  });

  it('ignores invalid targets without creating invalid thread state', () => {
    const state = createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 22);
    const planA = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state, {
      playerTargetThreadId: 'not_a_thread'
    });
    const planB = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state, {
      playerTargetThreadId: 'not_a_thread'
    });

    expect(planA).toEqual(planB);
    expect(planA.focusThreadId).not.toBe('not_a_thread');
    expect(state.threadStates.not_a_thread).toBeUndefined();
  });

  it('does not reopen resolved targets and still delivers pending aftermath', () => {
    let state = createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 23);
    state = commitScenePlan(
      BRANCHING_CITY_ELECTION_CAMPAIGN,
      state,
      forcePlan(state, 'guild_bargain', 'resolve', THREAD_STATUSES.RESOLVED)
    );
    const plan = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state, {
      playerTargetThreadId: 'guild_bargain'
    });

    expect(plan.focusThreadId).toBe('guild_bargain');
    expect(plan.beat).toBe('aftermath');
    expect(plan.reasonCodes).toContain('player_target_resolved_ignored');
    expect(state.threadStates.guild_bargain.status).toBe(THREAD_STATUSES.RESOLVED);
  });

  it('allows main-thread override pressure but prevents premature main resolution through required gates', () => {
    let state = createInitialDirectorState(BRANCHING_CITY_ELECTION_CAMPAIGN, 24);

    for (let index = 0; index < 8; index += 1) {
      const plan = planNextScene(BRANCHING_CITY_ELECTION_CAMPAIGN, state, {
        playerTargetThreadId: 'election_manipulation'
      });

      expect(plan.focusThreadId).toBe('election_manipulation');
      if (plan.reasonCodes.includes('unresolved_required_child')) {
        expect(plan.beat).not.toBe('resolve');
      }
      state = commitScenePlan(BRANCHING_CITY_ELECTION_CAMPAIGN, state, plan);
    }

    expect(canResolveThread(BRANCHING_CITY_ELECTION_CAMPAIGN, state, 'election_manipulation')).toBe(false);
    expect(state.threadStates.election_manipulation.status).toBe(THREAD_STATUSES.ACTIVE);
  });
});

describe('story director fixture smoke records', () => {
  it('single-thread fixture completes with one final aftermath', () => {
    const record = runSingleFixture({
      fixture: makeFixture(SINGLE_THREAD_MICRO_CAMPAIGN, 60),
      seed: 18000
    });
    const finalAftermaths = record.timelineRecords.filter(
      (entry) => entry.threadId === SINGLE_THREAD_MICRO_CAMPAIGN.mainThreatId && entry.beat === 'aftermath'
    );

    expect(record.completed).toBe(true);
    expect(finalAftermaths).toHaveLength(1);
  });
});

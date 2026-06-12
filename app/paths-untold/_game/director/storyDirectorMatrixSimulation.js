import { pathToFileURL } from 'node:url';
import { CAMPAIGN_FIXTURES } from './campaignFixtures.js';
import { THREAD_STATUSES, validateCampaignDesign } from './campaignDesign.js';
import {
  BEAT_TYPES,
  canResolveThread,
  commitScenePlan,
  createInitialDirectorState,
  planNextScene
} from './storyDirector.js';

const NORMAL_BEATS = new Set(['introduce', 'escalate', 'hold', 'partial_release', 'resolve']);

export function runMatrixSimulation(options = {}) {
  const {
    fixtures = CAMPAIGN_FIXTURES,
    runs = 500,
    seed = 9000,
    beatWeightProfile = 'currentTuned',
    print = true,
    includeSamples = true
  } = options;
  const results = fixtures.map((fixture, index) =>
    runFixtureMatrix({
      fixture,
      runs,
      seed: (seed + index * 100000) >>> 0,
      beatWeightProfile,
      includeSample: includeSamples
    })
  );

  if (print) {
    printMatrixResults(results);
  }

  return results;
}

export function runFixtureMatrix({ fixture, runs = 500, seed = 1, beatWeightProfile = 'currentTuned', includeSample = true }) {
  const validation = validateCampaignDesign(fixture.campaignDesign);
  const records = [];

  for (let index = 0; index < runs; index += 1) {
    records.push(
      runSingleFixture({
        fixture,
        seed: (seed + index) >>> 0,
        beatWeightProfile
      })
    );
  }

  const replayA = runSingleFixture({ fixture, seed, beatWeightProfile });
  const replayB = runSingleFixture({ fixture, seed, beatWeightProfile });
  const deterministicReplayPass = JSON.stringify(replayA.timelineRecords) === JSON.stringify(replayB.timelineRecords);
  const result = {
    fixtureId: fixture.id,
    label: fixture.label,
    threadCount: fixture.campaignDesign.threads.length,
    requiredThreadCount: getRequiredThreadIds(fixture.campaignDesign).length,
    turnCap: fixture.turnCap,
    validation,
    deterministicReplayPass,
    aggregates: aggregateFixture(fixture, records, deterministicReplayPass),
    sample: includeSample
      ? buildDirectionSample(
        runSingleFixture({
          fixture,
          seed,
          beatWeightProfile
        })
      )
      : []
  };

  return result;
}

export function runSingleFixture({ fixture, seed = 1, beatWeightProfile = 'currentTuned', playerTargets = [] }) {
  const { campaignDesign, turnCap } = fixture;
  let state = createInitialDirectorState(campaignDesign, seed);
  const timelineRecords = [];
  const focusCounts = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  const firstFocusTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, null]));
  const firstEligibleTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, null]));
  const resolutionTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, null]));
  const requiredThreadIds = getRequiredThreadIds(campaignDesign);
  const requiredLastFocus = Object.fromEntries(requiredThreadIds.map((threadId) => [threadId, 0]));
  const violations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutionViolations: 0,
    resolvedBeatViolations: 0,
    finalAftermathViolations: 0,
    consecutiveEscalationViolations: 0,
    childAutoParentViolations: 0
  };
  let maxConsecutiveEscalations = 0;
  let maxUnresolvedRequiredThreadNeglectGap = 0;
  let finalAftermathDeliveries = 0;
  let mainResolutionTurn = null;
  let completionTurn = null;
  let completed = false;

  for (let index = 0; index < turnCap; index += 1) {
    markEligibility(campaignDesign, state, firstEligibleTurns);

    const target = playerTargets.find((entry) => entry.turn === state.turn + 1);
    const beforeState = state;
    const plan = planNextScene(campaignDesign, state, {
      playerTargetThreadId: target?.threadId,
      beatWeightProfile
    });

    if (plan.complete) {
      completionTurn = state.turn;
      completed = true;
      timelineRecords.push({
        turn: state.turn + 1,
        complete: true,
        reasonCodes: plan.reasonCodes,
        rngState: state.rngState
      });
      break;
    }

    if (plan.blocked) {
      timelineRecords.push({
        turn: state.turn + 1,
        blocked: true,
        reasonCodes: plan.reasonCodes,
        rngState: state.rngState
      });
      break;
    }

    state = commitScenePlan(campaignDesign, state, plan);
    markEligibility(campaignDesign, state, firstEligibleTurns);

    focusCounts[plan.focusThreadId] += 1;
    if (firstFocusTurns[plan.focusThreadId] === null) {
      firstFocusTurns[plan.focusThreadId] = state.turn;
    }

    if (plan.beat === 'resolve') {
      resolutionTurns[plan.focusThreadId] = state.turn;
      if (plan.focusThreadId === campaignDesign.mainThreatId) {
        mainResolutionTurn = state.turn;
      }
    }

    if (plan.beat === 'aftermath' && plan.focusThreadId === campaignDesign.mainThreatId) {
      finalAftermathDeliveries += 1;
      if (finalAftermathDeliveries > 1) {
        violations.finalAftermathViolations += 1;
      }
    }

    updateRequiredNeglect({
      campaignDesign,
      state,
      focusedThreadId: plan.focusThreadId,
      requiredThreadIds,
      requiredLastFocus,
      onGap: (gap) => {
        maxUnresolvedRequiredThreadNeglectGap = Math.max(maxUnresolvedRequiredThreadNeglectGap, gap);
      }
    });

    const turnViolations = inspectTurn({ campaignDesign, beforeState, afterState: state, plan });
    for (const [key, value] of Object.entries(turnViolations)) {
      violations[key] += value;
    }

    for (const threadState of Object.values(state.threadStates)) {
      maxConsecutiveEscalations = Math.max(maxConsecutiveEscalations, threadState.consecutiveEscalations);
      if (threadState.consecutiveEscalations > 3) {
        violations.consecutiveEscalationViolations += 1;
      }
    }

    timelineRecords.push({
      turn: state.turn,
      threadId: plan.focusThreadId,
      beat: plan.beat,
      modifier: plan.modifier,
      reasonCodes: plan.reasonCodes,
      pressureBefore: beforeState.threadStates[plan.focusThreadId].pressure,
      pressureAfter: state.threadStates[plan.focusThreadId].pressure,
      progressBefore: beforeState.threadStates[plan.focusThreadId].progress,
      progressAfter: state.threadStates[plan.focusThreadId].progress,
      directionText: plan.directionText,
      rngState: state.rngState,
      threadStates: state.threadStates
    });
  }

  if (mainResolutionTurn !== null && finalAftermathDeliveries !== 1 && completed) {
    violations.finalAftermathViolations += 1;
  }

  for (const threadId of requiredThreadIds) {
    if (state.threadStates[threadId]?.status !== THREAD_STATUSES.RESOLVED) {
      maxUnresolvedRequiredThreadNeglectGap = Math.max(
        maxUnresolvedRequiredThreadNeglectGap,
        state.turn - requiredLastFocus[threadId]
      );
    }
  }

  return {
    seed,
    completed,
    completionTurn,
    mainResolutionTurn,
    committedTurns: state.turn,
    finalState: state,
    focusCounts,
    firstFocusTurns,
    firstEligibleTurns,
    resolutionTurns,
    maxConsecutiveEscalations,
    maxUnresolvedRequiredThreadNeglectGap,
    finalAftermathDeliveries,
    violations,
    timelineRecords
  };
}

function aggregateFixture(fixture, records, deterministicReplayPass) {
  const { campaignDesign } = fixture;
  const completionTurns = records.filter((record) => record.completed).map((record) => record.completionTurn);
  const firstResolutionTurns = records
    .map((record) => earliestTurn(Object.values(record.resolutionTurns)))
    .filter((turn) => turn !== null);
  const childResolutionTurns = records
    .map((record) =>
      earliestTurn(
        campaignDesign.threads
          .filter((thread) => thread.id !== campaignDesign.mainThreatId)
          .map((thread) => record.resolutionTurns[thread.id])
      )
    )
    .filter((turn) => turn !== null);
  const eligibleDelays = [];
  const totalFocusCounts = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  const totalCommittedTurns = records.reduce((sum, record) => sum + record.committedTurns, 0);
  const beatCounts = Object.fromEntries(BEAT_TYPES.map((beat) => [beat, 0]));
  const perThreadFocusTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, []]));
  const perThreadResolutionTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, []]));
  const violations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutionViolations: 0,
    resolvedBeatViolations: 0,
    finalAftermathViolations: 0,
    consecutiveEscalationViolations: 0,
    childAutoParentViolations: 0
  };
  let maxConsecutiveEscalations = 0;
  let maxUnresolvedRequiredThreadNeglectGap = 0;

  for (const record of records) {
    maxConsecutiveEscalations = Math.max(maxConsecutiveEscalations, record.maxConsecutiveEscalations);
    maxUnresolvedRequiredThreadNeglectGap = Math.max(
      maxUnresolvedRequiredThreadNeglectGap,
      record.maxUnresolvedRequiredThreadNeglectGap
    );

    for (const [key, value] of Object.entries(record.violations)) {
      violations[key] += value;
    }

    for (const [threadId, count] of Object.entries(record.focusCounts)) {
      totalFocusCounts[threadId] += count;
      if (record.firstFocusTurns[threadId] !== null) {
        perThreadFocusTurns[threadId].push(record.firstFocusTurns[threadId]);
      }
      if (record.resolutionTurns[threadId] !== null) {
        perThreadResolutionTurns[threadId].push(record.resolutionTurns[threadId]);
      }
      if (record.firstEligibleTurns[threadId] !== null && record.resolutionTurns[threadId] !== null) {
        eligibleDelays.push(record.resolutionTurns[threadId] - record.firstEligibleTurns[threadId]);
      }
    }

    for (const timelineRecord of record.timelineRecords) {
      if (timelineRecord.beat) {
        beatCounts[timelineRecord.beat] += 1;
      }
    }
  }

  return {
    totalRuns: records.length,
    completionRuns: completionTurns.length,
    completionRate: round(completionTurns.length / records.length),
    averageCampaignCompletionTurn: average(completionTurns),
    medianCampaignCompletionTurn: percentile(completionTurns, 50),
    p90CampaignCompletionTurn: percentile(completionTurns, 90),
    averageFirstResolutionTurn: average(firstResolutionTurns),
    averageFirstChildResolutionTurn: childResolutionTurns.length === 0 ? null : average(childResolutionTurns),
    averageResolutionEligibleDelay: average(eligibleDelays),
    p90ResolutionEligibleDelay: percentile(eligibleDelays, 90),
    beatFrequencies: normalizeCounts(beatCounts),
    focusShareByThread: Object.fromEntries(
      campaignDesign.threads.map((thread) => [
        thread.id,
        totalCommittedTurns === 0 ? 0 : round(totalFocusCounts[thread.id] / totalCommittedTurns)
      ])
    ),
    averageFirstFocusTurnByThread: Object.fromEntries(
      campaignDesign.threads.map((thread) => [thread.id, average(perThreadFocusTurns[thread.id])])
    ),
    resolutionRateByThread: Object.fromEntries(
      campaignDesign.threads.map((thread) => [
        thread.id,
        round(perThreadResolutionTurns[thread.id].length / records.length)
      ])
    ),
    averageResolutionTurnByThread: Object.fromEntries(
      campaignDesign.threads.map((thread) => [thread.id, average(perThreadResolutionTurns[thread.id])])
    ),
    maxConsecutiveEscalations,
    maxUnresolvedRequiredThreadNeglectGap,
    deterministicReplayPass,
    ...violations
  };
}

function inspectTurn({ campaignDesign, beforeState, afterState, plan }) {
  const violations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutionViolations: 0,
    resolvedBeatViolations: 0,
    finalAftermathViolations: 0,
    consecutiveEscalationViolations: 0,
    childAutoParentViolations: 0
  };
  const beforeThread = beforeState.threadStates[plan.focusThreadId];

  for (const threadState of Object.values(afterState.threadStates)) {
    if (threadState.pressure < 0 || threadState.pressure > 100 || threadState.progress < 0 || threadState.progress > 100) {
      violations.boundsViolations += 1;
    }
  }

  if (beforeThread.status === THREAD_STATUSES.RESOLVED && NORMAL_BEATS.has(plan.beat)) {
    violations.resolvedBeatViolations += 1;
  }

  if (plan.beat === 'resolve') {
    const thread = campaignDesign.threads.find((candidate) => candidate.id === plan.focusThreadId);
    const unresolvedRequired = (thread.requiredChildIds ?? []).some(
      (threadId) => beforeState.threadStates[threadId]?.status !== THREAD_STATUSES.RESOLVED
    );

    if (unresolvedRequired) {
      violations.parentGateViolations += 1;
    }

    if (thread.id === campaignDesign.mainThreatId && beforeThread.progress < 85) {
      violations.prematureMainResolutionViolations += 1;
    }
  }

  const focusedThread = campaignDesign.threads.find((thread) => thread.id === plan.focusThreadId);
  if (focusedThread?.parentId && plan.beat === 'resolve') {
    const parentBefore = beforeState.threadStates[focusedThread.parentId];
    const parentAfter = afterState.threadStates[focusedThread.parentId];
    if (parentBefore?.status !== THREAD_STATUSES.RESOLVED && parentAfter?.status === THREAD_STATUSES.RESOLVED) {
      violations.childAutoParentViolations += 1;
    }
  }

  return violations;
}

function markEligibility(campaignDesign, state, firstEligibleTurns) {
  for (const thread of campaignDesign.threads) {
    if (
      firstEligibleTurns[thread.id] === null &&
      state.threadStates[thread.id]?.status === THREAD_STATUSES.ACTIVE &&
      canResolveThread(campaignDesign, state, thread.id)
    ) {
      firstEligibleTurns[thread.id] = state.turn;
    }
  }
}

function updateRequiredNeglect({ campaignDesign, state, focusedThreadId, requiredThreadIds, requiredLastFocus, onGap }) {
  for (const threadId of requiredThreadIds) {
    if (state.threadStates[threadId]?.status === THREAD_STATUSES.RESOLVED) {
      continue;
    }

    if (threadId === focusedThreadId) {
      onGap(state.turn - requiredLastFocus[threadId]);
      requiredLastFocus[threadId] = state.turn;
    }
  }
}

function buildDirectionSample(record) {
  const selected = [];
  const wantedBeats = new Set(['introduce', 'escalate', 'hold', 'partial_release', 'resolve', 'aftermath']);

  for (const entry of record.timelineRecords) {
    if (!entry.beat || !wantedBeats.has(entry.beat)) {
      continue;
    }

    selected.push({
      turn: entry.turn,
      threadId: entry.threadId,
      beat: entry.beat,
      directionText: entry.directionText
    });
    wantedBeats.delete(entry.beat);

    if (selected.length >= 6) {
      break;
    }
  }

  return selected;
}

function getRequiredThreadIds(campaignDesign) {
  return [
    ...new Set(
      campaignDesign.threads.flatMap((thread) =>
        Array.isArray(thread.requiredChildIds) ? thread.requiredChildIds : []
      )
    )
  ];
}

function earliestTurn(turns) {
  const finiteTurns = turns.filter((turn) => turn !== null && turn !== undefined);
  return finiteTurns.length === 0 ? null : Math.min(...finiteTurns);
}

function average(values) {
  if (values.length === 0) {
    return null;
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percentile(values, percentileValue) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

function normalizeCounts(counts) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.fromEntries(
    Object.entries(counts).map(([key, count]) => [key, total === 0 ? 0 : round(count / total)])
  );
}

function countViolations(aggregates) {
  return [
    aggregates.boundsViolations,
    aggregates.parentGateViolations,
    aggregates.prematureMainResolutionViolations,
    aggregates.resolvedBeatViolations,
    aggregates.finalAftermathViolations,
    aggregates.consecutiveEscalationViolations,
    aggregates.childAutoParentViolations
  ].reduce((sum, count) => sum + count, 0);
}

function printMatrixResults(results) {
  console.log('Director matrix comparison');
  console.log('Fixture | Threads | Required | Avg first resolution | Avg completion | Completion rate | Violations');
  for (const result of results) {
    const aggregates = result.aggregates;
    console.log(
      [
        result.label,
        result.threadCount,
        result.requiredThreadCount,
        aggregates.averageFirstResolutionTurn,
        aggregates.averageCampaignCompletionTurn,
        aggregates.completionRate,
        countViolations(aggregates)
      ].join(' | ')
    );
  }

  for (const result of results) {
    console.log(`\n${result.label}`);
    console.log(JSON.stringify(result.aggregates, null, 2));
    console.log('Direction sample');
    for (const sample of result.sample) {
      console.log(`Turn ${sample.turn} | ${sample.threadId} | ${sample.beat}`);
      console.log(sample.directionText);
    }
  }
}

function round(value) {
  return Number(value.toFixed(4));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMatrixSimulation();
}

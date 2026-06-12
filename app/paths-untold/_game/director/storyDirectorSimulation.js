import { pathToFileURL } from 'node:url';
import { VILLAGE_CURSE_CAMPAIGN } from './campaignDesign.js';
import {
  BEAT_TYPES,
  BEAT_WEIGHT_PROFILES,
  commitScenePlan,
  createInitialDirectorState,
  planNextScene
} from './storyDirector.js';

export function runSimulation(options) {
  const {
    campaignDesign,
    seed = 1,
    turns = 100,
    runs = 1,
    playerTargets = [],
    beatWeightProfile = 'currentTuned',
    print = true
  } = options;
  const runRecords = [];

  for (let runIndex = 0; runIndex < runs; runIndex += 1) {
    runRecords.push(
      runSingleSimulation({
        campaignDesign,
        seed: (seed + runIndex) >>> 0,
        turns,
        playerTargets,
        beatWeightProfile
      })
    );
  }

  const deterministicReplayPass = checkDeterministicReplay({
    campaignDesign,
    seed,
    turns,
    playerTargets,
    beatWeightProfile
  });
  const result = {
    profile: beatWeightProfile,
    aggregates: aggregateRuns(campaignDesign, runRecords, deterministicReplayPass)
  };

  if (runs === 1) {
    result.timelines = runRecords[0].timelineLines;
    result.timelineRecords = runRecords[0].timelineRecords;
  }

  if (print) {
    printSimulationResult(result, runs);
  }

  return result;
}

function runSingleSimulation({ campaignDesign, seed, turns, playerTargets, beatWeightProfile }) {
  let state = createInitialDirectorState(campaignDesign, seed);
  const timelineLines = [];
  const timelineRecords = [];
  const invariantViolations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutions: 0,
    resolvedBeatViolations: 0
  };
  let firstResolutionTurn = null;
  let completionTurn = null;
  let completed = false;
  const firstFocusTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, null]));
  const resolutionTurns = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, null]));

  for (let index = 0; index < turns; index += 1) {
    const beforeState = state;
    const target = playerTargets.find((entry) => entry.turn === state.turn + 1);
    const plan = planNextScene(campaignDesign, state, {
      playerTargetThreadId: target?.threadId,
      beatWeightProfile
    });

    if (plan.complete) {
      completionTurn = state.turn;
      completed = true;
      timelineLines.push(`Turn ${state.turn + 1}  | complete: ${plan.reasonCodes.join(', ')}`);
      break;
    }

    if (plan.blocked) {
      timelineLines.push(`Turn ${state.turn + 1}  | blocked: ${plan.reasonCodes.join(', ')}`);
      break;
    }

    state = commitScenePlan(campaignDesign, state, plan);
    if (firstFocusTurns[plan.focusThreadId] === null) {
      firstFocusTurns[plan.focusThreadId] = state.turn;
    }

    if (plan.beat === 'resolve' && firstResolutionTurn === null) {
      firstResolutionTurn = state.turn;
    }

    if (plan.beat === 'resolve' && resolutionTurns[plan.focusThreadId] === null) {
      resolutionTurns[plan.focusThreadId] = state.turn;
    }

    const beforeThread = beforeState.threadStates[plan.focusThreadId];
    const afterThread = state.threadStates[plan.focusThreadId];
    const line =
      `Turn ${String(state.turn).padEnd(3)} | thread: ${plan.focusThreadId.padEnd(16)} | ` +
      `beat: ${plan.beat.padEnd(15)} | P: ${String(beforeThread.pressure).padStart(3)}->${String(afterThread.pressure).padEnd(3)} | ` +
      `G: ${String(beforeThread.progress).padStart(3)}->${String(afterThread.progress).padEnd(3)}`;

    timelineLines.push(line);
    timelineRecords.push({
      turn: state.turn,
      focusThreadId: plan.focusThreadId,
      beat: plan.beat,
      modifier: plan.modifier,
      pressureBefore: beforeThread.pressure,
      pressureAfter: afterThread.pressure,
      progressBefore: beforeThread.progress,
      progressAfter: afterThread.progress,
      statusAfter: afterThread.status,
      reasonCodes: plan.reasonCodes,
      rngState: state.rngState,
      threadStates: state.threadStates
    });

    const turnViolations = inspectInvariants(campaignDesign, beforeState, state, plan);
    for (const key of Object.keys(invariantViolations)) {
      invariantViolations[key] += turnViolations[key] ?? 0;
    }

  }

  return {
    seed,
    finalState: state,
    timelineLines,
    timelineRecords,
    firstResolutionTurn,
    completionTurn,
    completed,
    firstFocusTurns,
    resolutionTurns,
    invariantViolations
  };
}

function aggregateRuns(campaignDesign, runRecords, deterministicReplayPass) {
  const beatCounts = Object.fromEntries(BEAT_TYPES.map((beat) => [beat, 0]));
  const firstFocusTotals = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  const firstFocusCounts = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  const resolutionTotals = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  const resolutionCounts = Object.fromEntries(campaignDesign.threads.map((thread) => [thread.id, 0]));
  let totalBeats = 0;
  let totalResolutions = 0;
  let firstResolutionTurnTotal = 0;
  let firstResolutionRuns = 0;
  let firstChildResolutionTurnTotal = 0;
  let firstChildResolutionRuns = 0;
  let completionTurnTotal = 0;
  let completedRuns = 0;
  let maxConsecutiveEscalations = 0;
  const violations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutions: 0,
    resolvedBeatViolations: 0
  };

  for (const runRecord of runRecords) {
    for (const timelineRecord of runRecord.timelineRecords) {
      beatCounts[timelineRecord.beat] += 1;
      totalBeats += 1;

      if (timelineRecord.beat === 'resolve') {
        totalResolutions += 1;
      }

      for (const threadState of Object.values(timelineRecord.threadStates)) {
        maxConsecutiveEscalations = Math.max(
          maxConsecutiveEscalations,
          threadState.consecutiveEscalations
        );
      }
    }

    if (runRecord.firstResolutionTurn !== null) {
      firstResolutionTurnTotal += runRecord.firstResolutionTurn;
      firstResolutionRuns += 1;
    }

    const childResolutionTurns = campaignDesign.threads
      .filter((thread) => thread.id !== campaignDesign.mainThreatId)
      .map((thread) => runRecord.resolutionTurns[thread.id])
      .filter((turn) => turn !== null);

    if (childResolutionTurns.length > 0) {
      firstChildResolutionTurnTotal += Math.min(...childResolutionTurns);
      firstChildResolutionRuns += 1;
    }

    if (runRecord.completed) {
      completionTurnTotal += runRecord.completionTurn;
      completedRuns += 1;
    }

    for (const thread of campaignDesign.threads) {
      if (runRecord.firstFocusTurns[thread.id] !== null) {
        firstFocusTotals[thread.id] += runRecord.firstFocusTurns[thread.id];
        firstFocusCounts[thread.id] += 1;
      }

      if (runRecord.resolutionTurns[thread.id] !== null) {
        resolutionTotals[thread.id] += runRecord.resolutionTurns[thread.id];
        resolutionCounts[thread.id] += 1;
      }
    }

    violations.boundsViolations += runRecord.invariantViolations.boundsViolations;
    violations.parentGateViolations += runRecord.invariantViolations.parentGateViolations;
    violations.prematureMainResolutions += runRecord.invariantViolations.prematureMainResolutions;
    violations.resolvedBeatViolations += runRecord.invariantViolations.resolvedBeatViolations;
  }

  return {
    beatFrequencies: Object.fromEntries(
      Object.entries(beatCounts).map(([beat, count]) => [
        beat,
        totalBeats === 0 ? 0 : Number((count / totalBeats).toFixed(4))
      ])
    ),
    avgTurnsToFirstResolution:
      firstResolutionRuns === 0 ? null : Number((firstResolutionTurnTotal / firstResolutionRuns).toFixed(2)),
    avgTurnsToFirstChildResolution:
      firstChildResolutionRuns === 0
        ? null
        : Number((firstChildResolutionTurnTotal / firstChildResolutionRuns).toFixed(2)),
    totalResolutions,
    maxConsecutiveEscalations,
    prematureMainResolutions: violations.prematureMainResolutions,
    parentGateViolations: violations.parentGateViolations,
    boundsViolations: violations.boundsViolations,
    resolvedBeatViolations: violations.resolvedBeatViolations,
    deterministicReplayPass,
    completionRuns: completedRuns,
    totalRuns: runRecords.length,
    campaignCompletionRate: Number((completedRuns / runRecords.length).toFixed(4)),
    averageCampaignCompletionTurn:
      completedRuns === 0 ? null : Number((completionTurnTotal / completedRuns).toFixed(2)),
    perThread: Object.fromEntries(
      campaignDesign.threads.map((thread) => [
        thread.id,
        {
          avgFirstFocusTurn:
            firstFocusCounts[thread.id] === 0
              ? null
              : Number((firstFocusTotals[thread.id] / firstFocusCounts[thread.id]).toFixed(2)),
          avgResolutionTurn:
            resolutionCounts[thread.id] === 0
              ? null
              : Number((resolutionTotals[thread.id] / resolutionCounts[thread.id]).toFixed(2)),
          firstFocusRate: Number((firstFocusCounts[thread.id] / runRecords.length).toFixed(4)),
          resolutionRate: Number((resolutionCounts[thread.id] / runRecords.length).toFixed(4))
        }
      ])
    )
  };
}

function inspectInvariants(campaignDesign, beforeState, afterState, plan) {
  const violations = {
    boundsViolations: 0,
    parentGateViolations: 0,
    prematureMainResolutions: 0,
    resolvedBeatViolations: 0
  };

  for (const threadState of Object.values(afterState.threadStates)) {
    if (
      threadState.pressure < 0 ||
      threadState.pressure > 100 ||
      threadState.progress < 0 ||
      threadState.progress > 100
    ) {
      violations.boundsViolations += 1;
    }
  }

  const beforeThread = beforeState.threadStates[plan.focusThreadId];
  if (
    beforeThread.status === 'resolved' &&
    ['introduce', 'escalate', 'hold', 'partial_release', 'resolve'].includes(plan.beat)
  ) {
    violations.resolvedBeatViolations += 1;
  }

  if (plan.beat === 'resolve') {
    const thread = campaignDesign.threads.find((candidate) => candidate.id === plan.focusThreadId);
    const unresolvedRequired = (thread.requiredChildIds ?? []).some(
      (requiredChildId) => beforeState.threadStates[requiredChildId]?.status !== 'resolved'
    );

    if (unresolvedRequired) {
      violations.parentGateViolations += 1;
    }

    if (thread.id === campaignDesign.mainThreatId && beforeThread.progress < 85) {
      violations.prematureMainResolutions += 1;
    }
  }

  return violations;
}

function checkDeterministicReplay({ campaignDesign, seed, turns, playerTargets, beatWeightProfile }) {
  const firstRun = runSingleSimulation({ campaignDesign, seed, turns, playerTargets, beatWeightProfile });
  const secondRun = runSingleSimulation({ campaignDesign, seed, turns, playerTargets, beatWeightProfile });

  return JSON.stringify(firstRun.timelineRecords) === JSON.stringify(secondRun.timelineRecords);
}

function printSimulationResult(result, runs) {
  if (result.timelines) {
    console.log('Single-seed timeline');
    console.log(result.timelines.join('\n'));
    console.log('');
  }

  console.log(`Aggregate results for ${result.profile} across ${runs} run${runs === 1 ? '' : 's'}`);
  console.log(JSON.stringify(result.aggregates, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSimulation({
    campaignDesign: VILLAGE_CURSE_CAMPAIGN,
    seed: 42,
    turns: 140,
    runs: 1,
    beatWeightProfile: 'currentTuned'
  });

  console.log('');
  runSimulation({
    campaignDesign: VILLAGE_CURSE_CAMPAIGN,
    seed: 1000,
    turns: 140,
    runs: 64,
    beatWeightProfile: 'currentTuned'
  });

  console.log('');
  runSimulation({
    campaignDesign: VILLAGE_CURSE_CAMPAIGN,
    seed: 1000,
    turns: 140,
    runs: 500,
    beatWeightProfile: 'currentTuned'
  });

  console.log('');
  runSimulation({
    campaignDesign: VILLAGE_CURSE_CAMPAIGN,
    seed: 1000,
    turns: 140,
    runs: 500,
    beatWeightProfile: 'previousPassive'
  });
}

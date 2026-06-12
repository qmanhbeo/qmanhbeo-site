import { randomInt, weightedPick } from './seededRandom.js';
import { THREAD_STATUSES, validateCampaignDesign } from './campaignDesign.js';
import { translateSceneDirection } from './translateSceneDirection.js';

export const BEAT_TYPES = [
  'introduce',
  'escalate',
  'hold',
  'partial_release',
  'resolve',
  'aftermath'
];

export const MODIFIER_TYPES = [null, 'reveal', 'cost', 'twist'];

const QUIET_BEATS = new Set(['hold', 'partial_release', 'aftermath']);
const QUIET_MOMENTUM_ESCALATE_BONUS = 15;
const RECENT_BEAT_LIMIT = 50;

export const BEAT_WEIGHT_PROFILES = {
  original: [
    {
      min: 0,
      max: 20,
      weights: {
        introduce: 0,
        escalate: 45,
        hold: 20,
        partial_release: 5,
        resolve: 0,
        aftermath: 0
      }
    },
    {
      min: 21,
      max: 50,
      weights: {
        introduce: 0,
        escalate: 40,
        hold: 25,
        partial_release: 20,
        resolve: 5,
        aftermath: 0
      }
    },
    {
      min: 51,
      max: 75,
      weights: {
        introduce: 0,
        escalate: 25,
        hold: 20,
        partial_release: 35,
        resolve: 15,
        aftermath: 0
      }
    },
    {
      min: 76,
      max: 100,
      weights: {
        introduce: 0,
        escalate: 10,
        hold: 10,
        partial_release: 35,
        resolve: 35,
        aftermath: 0
      }
    }
  ],
  previousPassive: [
    {
      min: 0,
      max: 20,
      weights: {
        introduce: 0,
        escalate: 15,
        hold: 45,
        partial_release: 30,
        resolve: 10,
        aftermath: 0
      }
    },
    {
      min: 21,
      max: 50,
      weights: {
        introduce: 0,
        escalate: 35,
        hold: 25,
        partial_release: 25,
        resolve: 15,
        aftermath: 0
      }
    },
    {
      min: 51,
      max: 75,
      weights: {
        introduce: 0,
        escalate: 35,
        hold: 15,
        partial_release: 20,
        resolve: 30,
        aftermath: 0
      }
    },
    {
      min: 76,
      max: 100,
      weights: {
        introduce: 0,
        escalate: 25,
        hold: 10,
        partial_release: 20,
        resolve: 45,
        aftermath: 0
      }
    }
  ],
  currentTuned: [
    {
      min: 0,
      max: 20,
      weights: {
        introduce: 0,
        escalate: 50,
        hold: 35,
        partial_release: 15,
        resolve: 0,
        aftermath: 0
      }
    },
    {
      min: 21,
      max: 50,
      weights: {
        introduce: 0,
        escalate: 40,
        hold: 25,
        partial_release: 25,
        resolve: 10,
        aftermath: 0
      }
    },
    {
      min: 51,
      max: 75,
      weights: {
        introduce: 0,
        escalate: 25,
        hold: 20,
        partial_release: 35,
        resolve: 20,
        aftermath: 0
      }
    },
    {
      min: 76,
      max: 100,
      weights: {
        introduce: 0,
        escalate: 10,
        hold: 10,
        partial_release: 35,
        resolve: 45,
        aftermath: 0
      }
    }
  ]
};

export function createInitialDirectorState(campaignDesign, seed) {
  const validation = validateCampaignDesign(campaignDesign);
  if (!validation.valid) {
    throw new Error(`Invalid campaign design: ${validation.errors.join('; ')}`);
  }

  const threadStates = Object.fromEntries(
    campaignDesign.threads.map((thread) => [
      thread.id,
      {
        status: thread.initialStatus,
        pressure: thread.initialPressure,
        progress: thread.initialProgress,
        lastFocusedTurn: null,
        lastBeat: null,
        consecutiveEscalations: 0
      }
    ])
  );

  return {
    turn: 0,
    activeThreadId: campaignDesign.mainThreatId,
    pendingAftermathThreadId: null,
    pendingFinalAftermath: false,
    rngState: seed >>> 0,
    threadStates,
    recentBeats: []
  };
}

export function chooseFocusThread(campaignDesign, directorState, context = {}, rngState = directorState.rngState) {
  const playerTargetThreadId = context?.playerTargetThreadId;
  const playerTargetState = directorState.threadStates[playerTargetThreadId];

  if (playerTargetState && playerTargetState.status !== THREAD_STATUSES.RESOLVED) {
    return {
      threadId: playerTargetThreadId,
      reasonCodes: ['player_target_override'],
      candidateWeights: calculateFocusWeights(campaignDesign, directorState),
      rngStateAfterFocus: rngState
    };
  }

  if (playerTargetThreadId && playerTargetState?.status === THREAD_STATUSES.RESOLVED) {
    const pending = choosePendingAftermath(campaignDesign, directorState, rngState, [
      'player_target_resolved_ignored'
    ]);
    if (pending) {
      return pending;
    }
  }

  const pendingAftermath = choosePendingAftermath(campaignDesign, directorState, rngState);
  if (pendingAftermath) {
    return pendingAftermath;
  }

  if (isCampaignComplete(campaignDesign, directorState)) {
    return {
      complete: true,
      reasonCodes: ['main_threat_resolved'],
      candidateWeights: calculateFocusWeights(campaignDesign, directorState),
      rngStateAfterFocus: rngState
    };
  }

  const candidateWeights = calculateFocusWeights(campaignDesign, directorState);
  const candidates = Object.entries(candidateWeights);
  const totalWeight = candidates.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight <= 0) {
    if (isCampaignComplete(campaignDesign, directorState)) {
      return {
        complete: true,
        reasonCodes: ['main_threat_resolved'],
        candidateWeights,
        rngStateAfterFocus: rngState
      };
    }

    return {
      blocked: true,
      reasonCodes: ['no_eligible_focus_threads'],
      candidateWeights,
      rngStateAfterFocus: rngState
    };
  }

  const { index, nextState } = weightedPick(
    candidates.map(([, weight]) => weight),
    rngState
  );

  return {
    threadId: candidates[index][0],
    reasonCodes: ['weighted_focus_selection'],
    candidateWeights,
    rngStateAfterFocus: nextState
  };
}

export function drawBeat(campaignDesign, directorState, threadId, rngState, profileName = 'currentTuned') {
  const threadState = directorState.threadStates[threadId];
  const thread = campaignDesign.threads.find((candidate) => candidate.id === threadId);

  if (!thread || !threadState) {
    return {
      beat: 'hold',
      reasonCodes: ['unknown_thread_hold_fallback'],
      beatWeights: {},
      rngStateAfterBeat: rngState
    };
  }

  if (threadState.status === THREAD_STATUSES.SEEDED) {
    return {
      beat: 'introduce',
      reasonCodes: ['seeded_must_introduce'],
      beatWeights: { introduce: 1 },
      rngStateAfterBeat: rngState
    };
  }

  if (threadState.status === THREAD_STATUSES.RESOLVED) {
    return {
      beat: 'aftermath',
      reasonCodes: ['resolved_thread_aftermath_only'],
      beatWeights: { aftermath: 1 },
      rngStateAfterBeat: rngState
    };
  }

  const beatWeights = applyMomentum(
    campaignDesign,
    directorState,
    threadId,
    pressureBeatWeights(threadState.pressure, profileName)
  );
  const weightedBeats = BEAT_TYPES.filter((beat) => beat !== 'aftermath');
  const { index, nextState } = weightedPick(
    weightedBeats.map((beat) => beatWeights[beat] ?? 0),
    rngState
  );

  return {
    beat: weightedBeats[index],
    reasonCodes: ['pressure_weighted_beat'],
    beatWeights,
    rngStateAfterBeat: nextState
  };
}

export function applyMomentum(campaignDesign, directorState, threadId, beatWeights) {
  const threadState = directorState.threadStates[threadId];
  const adjustedWeights = { ...beatWeights };

  if (threadState.consecutiveEscalations >= 3) {
    adjustedWeights.partial_release += adjustedWeights.escalate;
    adjustedWeights.escalate = 0;
  } else if (threadState.consecutiveEscalations >= 2) {
    const reduction = adjustedWeights.escalate * 0.4;
    adjustedWeights.escalate -= reduction;
    adjustedWeights.partial_release += reduction;
  }

  const lastTwoForThread = directorState.recentBeats
    .filter((beat) => beat.threadId === threadId)
    .slice(-2);

  if (
    lastTwoForThread.length === 2 &&
    lastTwoForThread.every((entry) => QUIET_BEATS.has(entry.beat))
  ) {
    adjustedWeights.escalate += QUIET_MOMENTUM_ESCALATE_BONUS;
  }

  if (canResolveThread(campaignDesign, directorState, threadId)) {
    adjustedWeights.resolve += threadState.progress >= 90 ? 80 : 50;
  }

  return adjustedWeights;
}

export function canResolveThread(campaignDesign, directorState, threadId) {
  return getResolutionBlockReasons(campaignDesign, directorState, threadId).length === 0;
}

export function drawMagnitude(campaignDesign, directorState, threadId, beat, rngState) {
  const ranges = getDeltaRanges(beat);
  const pressure = drawFromRange(ranges.pressure, rngState);
  const progress = drawFromRange(ranges.progress, pressure.nextState);

  return {
    magnitude: Math.abs(pressure.value) + Math.abs(progress.value),
    pressureDelta: pressure.value,
    progressDelta: progress.value,
    nextState: progress.nextState
  };
}

export function drawModifier(campaignDesign, directorState, threadId, beat, rngState) {
  if (!['escalate', 'hold', 'partial_release'].includes(beat)) {
    return {
      modifier: null,
      nextState: rngState
    };
  }

  const chance = randomInt(1, 100, rngState);
  if (chance.value > 10) {
    return {
      modifier: null,
      nextState: chance.nextState
    };
  }

  const modifierPick = weightedPick([40, 35, 25], chance.nextState);
  return {
    modifier: ['reveal', 'cost', 'twist'][modifierPick.index],
    nextState: modifierPick.nextState
  };
}

export function planNextScene(campaignDesign, directorState, context = {}) {
  const beatWeightProfile = context?.beatWeightProfile ?? 'currentTuned';
  const focusResult = chooseFocusThread(
    campaignDesign,
    directorState,
    context,
    directorState.rngState
  );

  if (focusResult.complete) {
    return {
      complete: true,
      reasonCodes: focusResult.reasonCodes,
      candidateWeights: focusResult.candidateWeights,
      rngStateAfterPlan: directorState.rngState
    };
  }

  if (focusResult.blocked) {
    return {
      blocked: true,
      reasonCodes: focusResult.reasonCodes,
      candidateWeights: focusResult.candidateWeights,
      rngStateAfterPlan: directorState.rngState
    };
  }

  const focusThreadId = focusResult.threadId;
  const threadState = directorState.threadStates[focusThreadId];
  const beatResult = drawBeat(
    campaignDesign,
    directorState,
    focusThreadId,
    focusResult.rngStateAfterFocus,
    beatWeightProfile
  );
  const reasonCodes = [...focusResult.reasonCodes, ...beatResult.reasonCodes];
  let beat = beatResult.beat;

  if (beat === 'resolve' && !canResolveThread(campaignDesign, directorState, focusThreadId)) {
    const blockReasons = getResolutionBlockReasons(campaignDesign, directorState, focusThreadId);
    reasonCodes.push(...blockReasons);
    beat = threadState.pressure >= 30 ? 'partial_release' : 'hold';
    reasonCodes.push(beat === 'partial_release' ? 'resolve_downgraded_to_partial_release' : 'resolve_downgraded_to_hold');
  }

  const deltas = drawMagnitude(
    campaignDesign,
    directorState,
    focusThreadId,
    beat,
    beatResult.rngStateAfterBeat
  );
  const modifierResult = drawModifier(
    campaignDesign,
    directorState,
    focusThreadId,
    beat,
    deltas.nextState
  );
  const plannedTransition = planThreadTransition(threadState, beat, deltas);
  const plan = {
    focusThreadId,
    beat,
    modifier: modifierResult.modifier,
    pressureDelta: deltas.pressureDelta,
    progressDelta: deltas.progressDelta,
    magnitude: deltas.magnitude,
    nextPressure: plannedTransition.nextPressure,
    nextProgress: plannedTransition.nextProgress,
    nextStatus: plannedTransition.nextStatus,
    reasonCodes,
    beatWeightProfile,
    candidateWeights: focusResult.candidateWeights,
    beatWeights: beatResult.beatWeights,
    rngStateBeforePlan: directorState.rngState,
    rngStateAfterPlan: modifierResult.nextState
  };

  return {
    ...plan,
    directionText: translateSceneDirection(campaignDesign, directorState, plan)
  };
}

export function commitScenePlan(campaignDesign, directorState, plan) {
  if (plan.complete || plan.blocked) {
    return {
      ...directorState,
      rngState: plan.rngStateAfterPlan
    };
  }

  const currentThreadState = directorState.threadStates[plan.focusThreadId];
  const nextThreadState = {
    ...currentThreadState,
    pressure: plan.nextPressure,
    progress: plan.nextProgress,
    status: plan.nextStatus,
    lastFocusedTurn: directorState.turn + 1,
    lastBeat: plan.beat,
    consecutiveEscalations:
      plan.beat === 'escalate' ? currentThreadState.consecutiveEscalations + 1 : 0
  };
  let pendingAftermathThreadId = directorState.pendingAftermathThreadId;
  let pendingFinalAftermath = directorState.pendingFinalAftermath;

  if (plan.beat === 'resolve') {
    if (plan.focusThreadId === campaignDesign.mainThreatId) {
      pendingAftermathThreadId = campaignDesign.mainThreatId;
      pendingFinalAftermath = true;
    } else if (!pendingFinalAftermath) {
      pendingAftermathThreadId = plan.focusThreadId;
    }
  } else if (
    plan.beat === 'aftermath' &&
    directorState.pendingAftermathThreadId === plan.focusThreadId
  ) {
    pendingAftermathThreadId = null;
    if (plan.focusThreadId === campaignDesign.mainThreatId) {
      pendingFinalAftermath = false;
    }
  }

  return {
    ...directorState,
    turn: directorState.turn + 1,
    activeThreadId: plan.focusThreadId,
    pendingAftermathThreadId,
    pendingFinalAftermath,
    rngState: plan.rngStateAfterPlan,
    threadStates: {
      ...directorState.threadStates,
      [plan.focusThreadId]: nextThreadState
    },
    recentBeats: [
      ...directorState.recentBeats,
      {
        turn: directorState.turn + 1,
        threadId: plan.focusThreadId,
        beat: plan.beat,
        pressure: plan.nextPressure,
        progress: plan.nextProgress
      }
    ].slice(-RECENT_BEAT_LIMIT)
  };
}

function calculateFocusWeights(campaignDesign, directorState) {
  const weights = {};

  for (const thread of campaignDesign.threads) {
    const threadState = directorState.threadStates[thread.id];
    weights[thread.id] = getFocusWeight(campaignDesign, directorState, thread, threadState);
  }

  return weights;
}

function getFocusWeight(campaignDesign, directorState, thread, threadState) {
  if (!threadState || threadState.status === THREAD_STATUSES.RESOLVED) {
    return 0;
  }

  const parentState = thread.parentId ? directorState.threadStates[thread.parentId] : null;
  if (threadState.status === THREAD_STATUSES.SEEDED && parentState?.status !== THREAD_STATUSES.ACTIVE) {
    return 0;
  }

  if (threadState.status !== THREAD_STATUSES.ACTIVE && threadState.status !== THREAD_STATUSES.SEEDED) {
    return 0;
  }

  const isSeeded = threadState.status === THREAD_STATUSES.SEEDED;
  const turnsSinceFocus =
    threadState.lastFocusedTurn === null
      ? directorState.turn
      : Math.max(0, directorState.turn - threadState.lastFocusedTurn);
  const continuityBonus = thread.id === directorState.activeThreadId ? 20 : 0;
  const neglectBonus = Math.min(30, turnsSinceFocus * 5);
  let weight = isSeeded ? 10 : threadState.pressure * 0.5 + continuityBonus + neglectBonus;

  const unresolvedChildren = campaignDesign.threads.filter((candidate) => {
    const candidateState = directorState.threadStates[candidate.id];
    return candidate.parentId === thread.id && candidateState?.status !== THREAD_STATUSES.RESOLVED;
  });

  if (unresolvedChildren.length > 0) {
    weight *= 0.45;
  }

  if (thread.parentId && parentState?.status === THREAD_STATUSES.ACTIVE) {
    weight += 15;
  }

  if (canResolveThread(campaignDesign, directorState, thread.id)) {
    weight += threadState.progress >= 90 ? 50 : 35;
  }

  return Math.max(0, weight);
}

function choosePendingAftermath(campaignDesign, directorState, rngState, extraReasonCodes = []) {
  const pendingAftermathThreadId = directorState.pendingAftermathThreadId;
  const pendingThreadState = directorState.threadStates[pendingAftermathThreadId];

  if (!pendingAftermathThreadId || pendingThreadState?.status !== THREAD_STATUSES.RESOLVED) {
    return null;
  }

  return {
    threadId: pendingAftermathThreadId,
    reasonCodes: [...extraReasonCodes, 'pending_aftermath'],
    candidateWeights: calculateFocusWeights(campaignDesign, directorState),
    rngStateAfterFocus: rngState
  };
}

function pressureBeatWeights(pressure, profileName = 'currentTuned') {
  const profile = BEAT_WEIGHT_PROFILES[profileName] ?? BEAT_WEIGHT_PROFILES.currentTuned;
  const pressureBand = profile.find((band) => pressure >= band.min && pressure <= band.max);

  return { ...(pressureBand ?? profile[profile.length - 1]).weights };
}

function getResolutionBlockReasons(campaignDesign, directorState, threadId) {
  const thread = campaignDesign.threads.find((candidate) => candidate.id === threadId);
  const threadState = directorState.threadStates[threadId];
  const reasons = [];

  if (!thread || !threadState) {
    return ['unknown_thread'];
  }

  if (threadState.status !== THREAD_STATUSES.ACTIVE) {
    reasons.push('resolution_status_invalid');
  }

  const requiredChildIds = Array.isArray(thread.requiredChildIds) ? thread.requiredChildIds : [];
  const unresolvedRequiredChild = requiredChildIds.some(
    (requiredChildId) => directorState.threadStates[requiredChildId]?.status !== THREAD_STATUSES.RESOLVED
  );

  if (unresolvedRequiredChild) {
    reasons.push('unresolved_required_child');
  }

  if (thread.id === campaignDesign.mainThreatId && threadState.progress < 85) {
    reasons.push('main_threat_not_earned');
  } else if (thread.id !== campaignDesign.mainThreatId && threadState.progress < 70) {
    reasons.push('resolution_progress_too_low');
  }

  return [...new Set(reasons)];
}

function getDeltaRanges(beat) {
  switch (beat) {
    case 'introduce':
      return { pressure: [5, 10], progress: [2, 5] };
    case 'escalate':
      return { pressure: [4, 12], progress: [7, 12] };
    case 'hold':
      return { pressure: [-2, 2], progress: [3, 6] };
    case 'partial_release':
      return { pressure: [-12, -4], progress: [10, 18] };
    case 'resolve':
    case 'aftermath':
    default:
      return { pressure: [0, 0], progress: [0, 0] };
  }
}

function drawFromRange(range, rngState) {
  if (range[0] === range[1]) {
    return {
      value: range[0],
      nextState: rngState
    };
  }

  return randomInt(range[0], range[1], rngState);
}

function planThreadTransition(threadState, beat, deltas) {
  if (beat === 'resolve') {
    return {
      nextPressure: 0,
      nextProgress: 100,
      nextStatus: THREAD_STATUSES.RESOLVED
    };
  }

  if (beat === 'aftermath') {
    return {
      nextPressure: threadState.pressure,
      nextProgress: threadState.progress,
      nextStatus: threadState.status
    };
  }

  return {
    nextPressure: clampPercent(threadState.pressure + deltas.pressureDelta),
    nextProgress: clampPercent(threadState.progress + deltas.progressDelta),
    nextStatus: beat === 'introduce' ? THREAD_STATUSES.ACTIVE : threadState.status
  };
}

function hasPendingFinalAftermath(campaignDesign, directorState) {
  return (
    directorState.pendingFinalAftermath === true &&
    directorState.pendingAftermathThreadId === campaignDesign.mainThreatId &&
    directorState.threadStates[campaignDesign.mainThreatId]?.status === THREAD_STATUSES.RESOLVED
  );
}

function isCampaignComplete(campaignDesign, directorState) {
  return (
    directorState.threadStates[campaignDesign.mainThreatId]?.status === THREAD_STATUSES.RESOLVED &&
    !hasPendingFinalAftermath(campaignDesign, directorState)
  );
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

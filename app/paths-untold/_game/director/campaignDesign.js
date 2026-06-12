export const STAKES_CEILINGS = [
  'personal',
  'local',
  'community',
  'regional',
  'national',
  'civilizational',
  'world'
];

export const THREAD_SCOPES = [...STAKES_CEILINGS];

export const THREAD_STATUSES = {
  SEEDED: 'seeded',
  ACTIVE: 'active',
  RESOLVED: 'resolved'
};

export const THREAD_ROLES = {
  MAIN: 'main',
  SUB: 'sub'
};

export const VILLAGE_CURSE_CAMPAIGN = {
  version: '1.0.0',
  id: 'village_curse_campaign',
  label: 'The Village Curse',
  premise: 'A rural village is slipping under an old curse that expresses itself through disappearances, fires, secrets, and communal fear.',
  coreQuestion: 'Can the village face the truth behind the curse before fear turns neighbor against neighbor?',
  mainObjective: 'Break the curse while preserving enough trust for the village to survive afterward.',
  forbiddenReveals: [
    'the curse as a simple monster to defeat',
    'a single innocent villager as the entire cause of the curse'
  ],
  stakesCeiling: 'community',
  mainThreatId: 'village_curse',
  threads: [
    {
      id: 'village_curse',
      label: 'Village Curse',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'community',
      objective: 'Understand and break the curse tightening around the village.',
      requiredChildIds: ['missing_children', 'elara_secret'],
      resolutionConditions: [
        'The source of the curse is exposed.',
        'The village has a credible path to safety.'
      ],
      forbiddenReveals: ['the full identity of the curse-maker'],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 25,
      initialProgress: 0
    },
    {
      id: 'missing_children',
      label: 'Missing Children',
      parentId: 'village_curse',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Find the children who vanished near the bramble road.',
      requiredChildIds: [],
      resolutionConditions: ['The children are found or their fate is confirmed.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 35,
      initialProgress: 5
    },
    {
      id: 'elara_secret',
      label: "Elara's Secret",
      parentId: 'village_curse',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Learn what Elara is hiding without making her a simple villain.',
      requiredChildIds: [],
      resolutionConditions: ['Elara chooses whether to confess what she knows.'],
      forbiddenReveals: ['Elara knows the original binding words'],
      initialStatus: THREAD_STATUSES.SEEDED,
      initialPressure: 5,
      initialProgress: 0
    },
    {
      id: 'old_mill_fire',
      label: 'Old Mill Fire',
      parentId: 'village_curse',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Resolve the suspicious fire at the abandoned mill.',
      requiredChildIds: [],
      resolutionConditions: ['The fire is explained and its immediate danger ends.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 40,
      initialProgress: 10
    }
  ]
};

export function validateCampaignDesign(campaignDesign) {
  const errors = [];

  if (!campaignDesign || typeof campaignDesign !== 'object') {
    return { valid: false, errors: ['campaignDesign must be an object'] };
  }

  const threads = Array.isArray(campaignDesign.threads) ? campaignDesign.threads : [];
  const idCounts = new Map();
  const threadById = new Map();

  if (!campaignDesign.version) {
    errors.push('version is required');
  }

  for (const fieldName of ['premise', 'coreQuestion', 'mainObjective']) {
    if (typeof campaignDesign[fieldName] !== 'string' || campaignDesign[fieldName].trim() === '') {
      errors.push(`${fieldName} is required`);
    }
  }

  if (
    campaignDesign.forbiddenReveals !== undefined &&
    (!Array.isArray(campaignDesign.forbiddenReveals) ||
      campaignDesign.forbiddenReveals.some(
        (reveal) => typeof reveal !== 'string' || reveal.trim() === ''
      ))
  ) {
    errors.push('forbiddenReveals must be an array of non-empty strings');
  }

  if (!STAKES_CEILINGS.includes(campaignDesign.stakesCeiling)) {
    errors.push(`unknown stakesCeiling: ${campaignDesign.stakesCeiling}`);
  }

  for (const thread of threads) {
    if (!thread?.id) {
      errors.push('thread id is required');
      continue;
    }

    idCounts.set(thread.id, (idCounts.get(thread.id) ?? 0) + 1);
    if (!threadById.has(thread.id)) {
      threadById.set(thread.id, thread);
    }
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      errors.push(`duplicate thread id: ${id}`);
    }
  }

  const mainThreads = threads.filter((thread) => thread.role === THREAD_ROLES.MAIN);
  if (mainThreads.length !== 1) {
    errors.push(`expected exactly one main thread, found ${mainThreads.length}`);
  }

  if (!threadById.has(campaignDesign.mainThreatId)) {
    errors.push(`mainThreatId does not exist: ${campaignDesign.mainThreatId}`);
  } else if (mainThreads.length === 1 && mainThreads[0].id !== campaignDesign.mainThreatId) {
    errors.push('mainThreatId must equal the id of the single main thread');
  }

  for (const thread of threads) {
    validateThread(thread, campaignDesign, threadById, errors);
  }

  validateParentCycles(threads, threadById, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateThread(thread, campaignDesign, threadById, errors) {
  if (!thread?.id) {
    return;
  }

  if (!Object.values(THREAD_ROLES).includes(thread.role)) {
    errors.push(`invalid role for ${thread.id}: ${thread.role}`);
  }

  if (!Object.values(THREAD_STATUSES).includes(thread.initialStatus)) {
    errors.push(`invalid initialStatus for ${thread.id}: ${thread.initialStatus}`);
  }

  if (thread.parentId) {
    if (thread.parentId === thread.id) {
      errors.push(`thread cannot be its own parent: ${thread.id}`);
    }

    if (!threadById.has(thread.parentId)) {
      errors.push(`unknown parentId for ${thread.id}: ${thread.parentId}`);
    }
  }

  if (!THREAD_SCOPES.includes(thread.scope)) {
    errors.push(`invalid scope for ${thread.id}: ${thread.scope}`);
  } else if (
    STAKES_CEILINGS.includes(campaignDesign.stakesCeiling) &&
    THREAD_SCOPES.indexOf(thread.scope) > STAKES_CEILINGS.indexOf(campaignDesign.stakesCeiling)
  ) {
    errors.push(`scope exceeds stakes ceiling for ${thread.id}: ${thread.scope}`);
  }

  if (!isPercent(thread.initialPressure)) {
    errors.push(`initialPressure must be 0-100 for ${thread.id}`);
  }

  if (!isPercent(thread.initialProgress)) {
    errors.push(`initialProgress must be 0-100 for ${thread.id}`);
  }

  if (
    thread.initialStatus === THREAD_STATUSES.RESOLVED &&
    (thread.initialPressure !== 0 || thread.initialProgress !== 100)
  ) {
    errors.push(`resolved initial thread must start at pressure 0 and progress 100: ${thread.id}`);
  }

  if (
    thread.initialStatus === THREAD_STATUSES.SEEDED &&
    Number.isFinite(thread.initialProgress) &&
    thread.initialProgress >= 70
  ) {
    errors.push(`seeded initial thread should not begin at resolution-level progress: ${thread.id}`);
  }

  const requiredChildIds = Array.isArray(thread.requiredChildIds) ? thread.requiredChildIds : [];
  const seenRequired = new Set();

  for (const requiredChildId of requiredChildIds) {
    if (requiredChildId === thread.id) {
      errors.push(`thread cannot require itself: ${thread.id}`);
    }

    if (seenRequired.has(requiredChildId)) {
      errors.push(`duplicate requiredChildId for ${thread.id}: ${requiredChildId}`);
    }
    seenRequired.add(requiredChildId);

    if (!threadById.has(requiredChildId)) {
      errors.push(`unknown requiredChildId for ${thread.id}: ${requiredChildId}`);
      continue;
    }

    if (!isDescendantOf(requiredChildId, thread.id, threadById)) {
      errors.push(`requiredChildId must be a descendant of ${thread.id}: ${requiredChildId}`);
    }
  }
}

function validateParentCycles(threads, threadById, errors) {
  const visiting = new Set();
  const visited = new Set();

  function visit(thread) {
    if (!thread?.id || visited.has(thread.id)) {
      return;
    }

    if (visiting.has(thread.id)) {
      errors.push(`parent cycle detected at ${thread.id}`);
      return;
    }

    visiting.add(thread.id);
    if (thread.parentId && threadById.has(thread.parentId)) {
      visit(threadById.get(thread.parentId));
    }
    visiting.delete(thread.id);
    visited.add(thread.id);
  }

  for (const thread of threads) {
    visit(thread);
  }
}

function isDescendantOf(candidateId, ancestorId, threadById) {
  let current = threadById.get(candidateId);
  const seen = new Set();

  while (current?.parentId) {
    if (seen.has(current.id)) {
      return false;
    }

    if (current.parentId === ancestorId) {
      return true;
    }

    seen.add(current.id);
    current = threadById.get(current.parentId);
  }

  return false;
}

function isPercent(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

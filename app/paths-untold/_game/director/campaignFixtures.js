import { THREAD_ROLES, THREAD_STATUSES, VILLAGE_CURSE_CAMPAIGN } from './campaignDesign.js';

export const SINGLE_THREAD_MICRO_CAMPAIGN = {
  version: '1.0.0',
  id: 'traveller_lie_micro_campaign',
  label: "The Traveller's Lie",
  premise: 'A traveller prepares to leave town after a useful lie harmed someone who trusted them.',
  coreQuestion: 'Will the traveller confess before departure or preserve comfort at another person\'s cost?',
  mainObjective: 'Face the truth of the lie and decide what repair is still possible.',
  forbiddenReveals: ['the confession as effortless absolution'],
  stakesCeiling: 'personal',
  mainThreatId: 'confession_before_departure',
  threads: [
    {
      id: 'confession_before_departure',
      label: 'Confession Before Departure',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'personal',
      objective: 'Decide whether to confess a damaging lie before leaving town.',
      requiredChildIds: [],
      resolutionConditions: ['The traveller either confesses, repairs the harm, or knowingly leaves the lie behind.'],
      forbiddenReveals: ['a consequence-free confession'],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 45,
      initialProgress: 20
    }
  ]
};

export const LINEAR_LIGHTHOUSE_MYSTERY_CAMPAIGN = {
  version: '1.0.0',
  id: 'lighthouse_mystery_campaign',
  label: 'The Dark Lighthouse',
  premise: 'A coastal lighthouse has gone dark during a storm season, and the village receives contradictory signs from the missing keepers.',
  coreQuestion: 'What truly happened at the lighthouse, and who benefits from the confusion?',
  mainObjective: 'Resolve the lighthouse mystery by reconciling both missing keepers and the false evidence around them.',
  forbiddenReveals: ['the sea itself as a villain'],
  stakesCeiling: 'local',
  mainThreatId: 'dark_lighthouse',
  threads: [
    {
      id: 'dark_lighthouse',
      label: 'Dark Lighthouse',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'local',
      objective: 'Determine why the lighthouse went dark and restore a trustworthy account.',
      requiredChildIds: ['missing_keeper_mara', 'contradictory_logbook'],
      resolutionConditions: ['Both the missing keeper and the contradictory records are explained.'],
      forbiddenReveals: ['the full solution before both clue threads resolve'],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 30,
      initialProgress: 8
    },
    {
      id: 'missing_keeper_mara',
      label: 'Missing Keeper Mara',
      parentId: 'dark_lighthouse',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Find what happened to Mara after the last lamp inspection.',
      requiredChildIds: [],
      resolutionConditions: ['Mara is found or her route is confirmed.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 45,
      initialProgress: 15
    },
    {
      id: 'contradictory_logbook',
      label: 'Contradictory Logbook',
      parentId: 'dark_lighthouse',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Resolve why the lighthouse log contradicts the harbor bell records.',
      requiredChildIds: [],
      resolutionConditions: ['The false or mistaken entry is identified.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 35,
      initialProgress: 10
    }
  ]
};

export const DEEP_HARVEST_COVENANT_CAMPAIGN = {
  version: '1.0.0',
  id: 'harvest_covenant_campaign',
  label: 'The Broken Harvest Covenant',
  premise: 'A kingdom faces a failing harvest that traces through a poisoned river, a damaged shrine, and an old covenant nobody fully remembers.',
  coreQuestion: 'Can the kingdom repair the covenant without hiding the neglect that broke it?',
  mainObjective: 'Restore the harvest by following the chain from fields to river to shrine to covenant.',
  forbiddenReveals: ['the covenant as simple superstition'],
  stakesCeiling: 'regional',
  mainThreatId: 'failing_harvest',
  threads: [
    {
      id: 'failing_harvest',
      label: 'Failing Harvest',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'regional',
      objective: 'Understand why the harvest is failing and restore a viable season.',
      requiredChildIds: ['poisoned_river'],
      resolutionConditions: ['The river, shrine, and covenant chain is repaired.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 35,
      initialProgress: 5
    },
    {
      id: 'poisoned_river',
      label: 'Poisoned River',
      parentId: 'failing_harvest',
      role: THREAD_ROLES.SUB,
      scope: 'regional',
      objective: 'Trace the poison feeding the irrigation channels.',
      requiredChildIds: ['damaged_shrine'],
      resolutionConditions: ['The river source is identified and can be treated.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 42,
      initialProgress: 8
    },
    {
      id: 'damaged_shrine',
      label: 'Damaged Shrine',
      parentId: 'poisoned_river',
      role: THREAD_ROLES.SUB,
      scope: 'community',
      objective: 'Learn why the river shrine failed to protect the water.',
      requiredChildIds: ['broken_covenant'],
      resolutionConditions: ['The shrine damage and its meaning are understood.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 40,
      initialProgress: 10
    },
    {
      id: 'broken_covenant',
      label: 'Broken Covenant',
      parentId: 'damaged_shrine',
      role: THREAD_ROLES.SUB,
      scope: 'community',
      objective: 'Recover the broken terms that tied the shrine to river stewardship.',
      requiredChildIds: [],
      resolutionConditions: ['The neglected covenant term is recovered and acknowledged.'],
      forbiddenReveals: ['a single scapegoat as the whole cause'],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 45,
      initialProgress: 14
    }
  ]
};

export const BRANCHING_CITY_ELECTION_CAMPAIGN = {
  version: '1.0.0',
  id: 'city_election_campaign',
  label: 'The Bent City Election',
  premise: 'A city election is being manipulated while factions, friendships, and local crises compete for attention.',
  coreQuestion: 'Can the election be made honest without letting factional panic decide the city first?',
  mainObjective: 'Expose the manipulation and preserve enough public trust for the result to matter.',
  forbiddenReveals: ['one faction as purely virtuous'],
  stakesCeiling: 'community',
  mainThreatId: 'election_manipulation',
  threads: [
    {
      id: 'election_manipulation',
      label: 'Election Manipulation',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'community',
      objective: 'Identify how the election is being bent and restore a credible vote.',
      requiredChildIds: ['ballot_house_pressure', 'missing_witness'],
      resolutionConditions: ['The pressure operation and missing witness are resolved.'],
      forbiddenReveals: ['the manipulator before the required threads resolve'],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 38,
      initialProgress: 7
    },
    {
      id: 'ballot_house_pressure',
      label: 'Ballot House Pressure',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'community',
      objective: 'Stop the pressure placed on ballot-house workers.',
      requiredChildIds: [],
      resolutionConditions: ['Workers can speak and ballots can be guarded.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 50,
      initialProgress: 12
    },
    {
      id: 'missing_witness',
      label: 'Missing Witness',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Find the clerk who saw the ledger switch.',
      requiredChildIds: [],
      resolutionConditions: ['The witness is found or their evidence is recovered.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 45,
      initialProgress: 10
    },
    {
      id: 'guild_bargain',
      label: 'Guild Bargain',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'community',
      objective: 'Understand the guild bargain shaping endorsements.',
      requiredChildIds: [],
      resolutionConditions: ['The bargain is exposed or contained.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 28,
      initialProgress: 8
    },
    {
      id: 'old_friend_rivalry',
      label: 'Old Friend Rivalry',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Navigate an old friendship strained by opposing campaign loyalties.',
      requiredChildIds: [],
      resolutionConditions: ['The friendship either adapts or breaks honestly.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.SEEDED,
      initialPressure: 10,
      initialProgress: 0
    },
    {
      id: 'market_fire_response',
      label: 'Market Fire Response',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Keep the market fire from becoming faction propaganda.',
      requiredChildIds: [],
      resolutionConditions: ['The market crisis is stabilized and understood.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 42,
      initialProgress: 15
    },
    {
      id: 'newspaper_blackmail',
      label: 'Newspaper Blackmail',
      parentId: 'election_manipulation',
      role: THREAD_ROLES.SUB,
      scope: 'local',
      objective: 'Uncover why the newspaper changed its endorsements overnight.',
      requiredChildIds: [],
      resolutionConditions: ['The blackmail is revealed or disarmed.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 32,
      initialProgress: 9
    }
  ]
};

export const RELATIONSHIP_INHERITANCE_CAMPAIGN = {
  version: '1.0.0',
  id: 'inheritance_reconciliation_campaign',
  label: 'Inheritance of Two Friends',
  premise: 'Two old friends reunite to settle a family inheritance while resentment, loyalty, grief, and duty divide them.',
  coreQuestion: 'Can they divide what was left behind without losing what still matters between them?',
  mainObjective: 'Reach an honest settlement that acknowledges the relationship beneath the inheritance dispute.',
  forbiddenReveals: ['a will clause that solves the emotional conflict by itself'],
  stakesCeiling: 'personal',
  mainThreatId: 'inheritance_reconciliation',
  threads: [
    {
      id: 'inheritance_reconciliation',
      label: 'Inheritance Reconciliation',
      parentId: null,
      role: THREAD_ROLES.MAIN,
      scope: 'personal',
      objective: 'Settle the inheritance while facing what the friendship has become.',
      requiredChildIds: ['unspoken_resentment', 'loyalty_to_parent'],
      resolutionConditions: ['Both friends choose a settlement with emotional clarity.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 34,
      initialProgress: 10
    },
    {
      id: 'unspoken_resentment',
      label: 'Unspoken Resentment',
      parentId: 'inheritance_reconciliation',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Bring years of avoided resentment into the open.',
      requiredChildIds: [],
      resolutionConditions: ['The resentment is named without being reduced to blame.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 45,
      initialProgress: 12
    },
    {
      id: 'loyalty_to_parent',
      label: 'Loyalty to a Parent',
      parentId: 'inheritance_reconciliation',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Separate loyalty to the dead parent from duty to the living friend.',
      requiredChildIds: [],
      resolutionConditions: ['Loyalty is reframed as a choice rather than an accusation.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 38,
      initialProgress: 10
    },
    {
      id: 'jealous_old_success',
      label: 'Jealous Old Success',
      parentId: 'inheritance_reconciliation',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Recognize how old comparisons shaped the inheritance argument.',
      requiredChildIds: [],
      resolutionConditions: ['The comparison loses its power or is honestly accepted.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.SEEDED,
      initialPressure: 8,
      initialProgress: 0
    },
    {
      id: 'grief_avoidance',
      label: 'Grief Avoidance',
      parentId: 'inheritance_reconciliation',
      role: THREAD_ROLES.SUB,
      scope: 'personal',
      objective: 'Stop using logistics to avoid shared grief.',
      requiredChildIds: [],
      resolutionConditions: ['Grief is acknowledged as part of the settlement.'],
      forbiddenReveals: [],
      initialStatus: THREAD_STATUSES.ACTIVE,
      initialPressure: 30,
      initialProgress: 8
    }
  ]
};

export const CAMPAIGN_FIXTURES = [
  {
    id: 'single-thread',
    label: 'Single Thread Micro',
    campaignDesign: SINGLE_THREAD_MICRO_CAMPAIGN,
    turnCap: 60,
    pacing: {
      minAverageCompletionTurn: 5,
      maxAverageCompletionTurn: 30,
      minCompletionRate: 0.99
    }
  },
  {
    id: 'linear-mystery',
    label: 'Linear Mystery',
    campaignDesign: LINEAR_LIGHTHOUSE_MYSTERY_CAMPAIGN,
    turnCap: 100,
    pacing: {
      minAverageCompletionTurn: 20,
      maxAverageCompletionTurn: 80,
      minCompletionRate: 0.98
    }
  },
  {
    id: 'deep-hierarchy',
    label: 'Deep Hierarchy',
    campaignDesign: DEEP_HARVEST_COVENANT_CAMPAIGN,
    turnCap: 140,
    pacing: {
      minAverageCompletionTurn: 25,
      maxAverageCompletionTurn: 110,
      minCompletionRate: 0.97
    }
  },
  {
    id: 'branching-optional',
    label: 'Branching Optional',
    campaignDesign: BRANCHING_CITY_ELECTION_CAMPAIGN,
    turnCap: 160,
    pacing: {
      minAverageCompletionTurn: 25,
      maxAverageCompletionTurn: 130,
      minCompletionRate: 0.95
    }
  },
  {
    id: 'relationship',
    label: 'Personal Relationship',
    campaignDesign: RELATIONSHIP_INHERITANCE_CAMPAIGN,
    turnCap: 100,
    pacing: {
      minAverageCompletionTurn: 15,
      maxAverageCompletionTurn: 80,
      minCompletionRate: 0.98
    }
  },
  {
    id: 'village-curse',
    label: 'Village Curse',
    campaignDesign: VILLAGE_CURSE_CAMPAIGN,
    turnCap: 140,
    pacing: {
      minAverageCompletionTurn: 35,
      maxAverageCompletionTurn: 65,
      minCompletionRate: 0.98
    }
  }
];

import {
  THREAD_ROLES,
  THREAD_STATUSES,
  validateCampaignDesign
} from './campaignDesign.js';

const DEFAULT_STAKES_CEILING = 'community';
const DEFAULT_MAIN_PRESSURE = 30;
const DEFAULT_CHILD_PRESSURE = 35;

export function getStoryBlueprintSegmentKey(storyBlueprint) {
  const position = getCurrentBlueprintPosition(storyBlueprint);
  if (!position.ok) return null;
  return `${position.arcIndex}:${position.chapterIndex}`;
}

export function adaptStoryBlueprintToCampaignDesign(storyBlueprint) {
  const position = getCurrentBlueprintPosition(storyBlueprint);
  if (!position.ok) {
    return fail(position.reason);
  }

  const {
    arcIndex,
    chapterIndex,
    currentArc,
    currentChapter
  } = position;

  const coreQuestion = textOrEmpty(storyBlueprint.coreQuestion);
  const storyIdentity = textOrEmpty(storyBlueprint.storyIdentity?.premise || storyBlueprint.storyIdentity);
  const premise = storyIdentity || coreQuestion;
  const mainObjective = textOrEmpty(currentArc.purpose || currentArc.focusAxis || coreQuestion);
  const chapterObjective = textOrEmpty(currentChapter.mustResolve || currentChapter.purpose);

  if (!premise) return fail('missing_premise');
  if (!coreQuestion) return fail('missing_core_question');
  if (!mainObjective) return fail('missing_current_arc_objective');
  if (!chapterObjective) return fail('missing_current_chapter_objective');

  const mainThreadId = `shadow_arc_${arcIndex}`;
  const childThreadId = `shadow_chapter_${arcIndex}_${chapterIndex}`;
  const campaignDesign = {
    version: 'shadow-adapter-v1',
    id: `shadow_arc_${arcIndex}_chapter_${chapterIndex}`,
    label: 'Blueprint Shadow Campaign',
    premise,
    coreQuestion,
    mainObjective,
    stakesCeiling: DEFAULT_STAKES_CEILING,
    mainThreatId: mainThreadId,
    forbiddenReveals: [],
    threads: [
      {
        id: mainThreadId,
        label: mainObjective,
        parentId: null,
        role: THREAD_ROLES.MAIN,
        scope: 'community',
        objective: mainObjective,
        requiredChildIds: [childThreadId],
        resolutionConditions: [],
        forbiddenReveals: [],
        initialStatus: THREAD_STATUSES.ACTIVE,
        initialPressure: DEFAULT_MAIN_PRESSURE,
        initialProgress: 0
      },
      {
        id: childThreadId,
        label: chapterObjective,
        parentId: mainThreadId,
        role: THREAD_ROLES.SUB,
        scope: 'local',
        objective: chapterObjective,
        requiredChildIds: [],
        resolutionConditions: [],
        forbiddenReveals: [],
        initialStatus: THREAD_STATUSES.ACTIVE,
        initialPressure: DEFAULT_CHILD_PRESSURE,
        initialProgress: 0
      }
    ],
    shadowAdapter: {
      quality: 'coarse',
      sourceArcIndex: arcIndex,
      sourceChapterIndex: chapterIndex
    }
  };

  const validation = validateCampaignDesign(campaignDesign);
  if (!validation.valid) {
    return fail('invalid_campaign_design', validation.errors);
  }

  return {
    ok: true,
    campaignDesign,
    segmentKey: `${arcIndex}:${chapterIndex}`,
    adapterQuality: 'coarse'
  };
}

function getCurrentBlueprintPosition(storyBlueprint) {
  if (!storyBlueprint || typeof storyBlueprint !== 'object') {
    return { ok: false, reason: 'missing_story_blueprint' };
  }

  const arcs = Array.isArray(storyBlueprint.arcs) ? storyBlueprint.arcs : [];
  const arcIndex = Number.isInteger(storyBlueprint.currentArcIndex)
    ? storyBlueprint.currentArcIndex
    : 0;
  const currentArc = arcs[arcIndex];
  if (!currentArc || typeof currentArc !== 'object') {
    return { ok: false, reason: 'missing_current_arc' };
  }

  const chapters = Array.isArray(currentArc.chapters) ? currentArc.chapters : [];
  const chapterIndex = Number.isInteger(currentArc.currentChapterIndex)
    ? currentArc.currentChapterIndex
    : 0;
  const currentChapter = chapters[chapterIndex];
  if (!currentChapter || typeof currentChapter !== 'object') {
    return { ok: false, reason: 'missing_current_chapter' };
  }

  return {
    ok: true,
    arcIndex,
    chapterIndex,
    currentArc,
    currentChapter
  };
}

function fail(reason, errors = []) {
  return {
    ok: false,
    reason,
    errors
  };
}

function textOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}

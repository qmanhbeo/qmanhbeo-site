import { describe, expect, it } from 'vitest';
import { validateCampaignDesign } from './campaignDesign.js';
import {
  adaptStoryBlueprintToCampaignDesign,
  getStoryBlueprintSegmentKey
} from './storyBlueprintCampaignAdapter.js';

describe('story blueprint campaign adapter', () => {
  it('creates a valid campaign design from the current arc and chapter', () => {
    const result = adaptStoryBlueprintToCampaignDesign(makeBlueprint());

    expect(result.ok).toBe(true);
    expect(result.segmentKey).toBe('1:1');
    expect(validateCampaignDesign(result.campaignDesign).valid).toBe(true);
  });

  it('uses stable index-based ids across repeated calls', () => {
    const blueprint = makeBlueprint();
    const first = adaptStoryBlueprintToCampaignDesign(blueprint);
    const second = adaptStoryBlueprintToCampaignDesign(blueprint);

    expect(first.campaignDesign.id).toBe(second.campaignDesign.id);
    expect(first.campaignDesign.threads.map((thread) => thread.id)).toEqual([
      'shadow_arc_1',
      'shadow_chapter_1_1'
    ]);
  });

  it('includes only the current arc and current chapter', () => {
    const result = adaptStoryBlueprintToCampaignDesign(makeBlueprint());
    const serialized = JSON.stringify(result.campaignDesign);

    expect(serialized).toContain('Recover the stolen bell');
    expect(serialized).toContain('Prove why the tower went silent');
    expect(serialized).not.toContain('Future arc purpose');
    expect(serialized).not.toContain('Future chapter purpose');
  });

  it('requires the current chapter before the current arc can resolve', () => {
    const result = adaptStoryBlueprintToCampaignDesign(makeBlueprint());
    const [mainThread, childThread] = result.campaignDesign.threads;

    expect(mainThread.requiredChildIds).toEqual([childThread.id]);
    expect(childThread.parentId).toBe(mainThread.id);
  });

  it('fails closed for a missing blueprint', () => {
    expect(adaptStoryBlueprintToCampaignDesign(null)).toMatchObject({
      ok: false,
      reason: 'missing_story_blueprint'
    });
  });

  it('fails closed when the current arc is missing', () => {
    const blueprint = makeBlueprint({ currentArcIndex: 99 });

    expect(adaptStoryBlueprintToCampaignDesign(blueprint)).toMatchObject({
      ok: false,
      reason: 'missing_current_arc'
    });
  });

  it('fails closed when the current chapter is missing', () => {
    const blueprint = makeBlueprint();
    blueprint.arcs[1].currentChapterIndex = 99;

    expect(adaptStoryBlueprintToCampaignDesign(blueprint)).toMatchObject({
      ok: false,
      reason: 'missing_current_chapter'
    });
  });

  it('fails closed when required current text fields are missing', () => {
    const blueprint = makeBlueprint({
      coreQuestion: '',
      storyIdentity: ''
    });

    expect(adaptStoryBlueprintToCampaignDesign(blueprint)).toMatchObject({
      ok: false,
      reason: 'missing_premise'
    });
  });

  it('returns the current segment key without mutating the blueprint', () => {
    const blueprint = makeBlueprint();
    const before = JSON.stringify(blueprint);

    expect(getStoryBlueprintSegmentKey(blueprint)).toBe('1:1');
    adaptStoryBlueprintToCampaignDesign(blueprint);
    expect(JSON.stringify(blueprint)).toBe(before);
  });
});

function makeBlueprint(overrides = {}) {
  return {
    coreQuestion: 'Can the town recover its voice?',
    storyIdentity: 'A civic mystery about silence and trust',
    currentArcIndex: 1,
    arcs: [
      {
        id: 'arc_0',
        purpose: 'Future arc purpose',
        focusAxis: 'future_axis',
        currentChapterIndex: 0,
        chapters: [
          {
            id: 'arc_0_ch_0',
            purpose: 'Future chapter purpose',
            mustResolve: 'Resolve a future chapter'
          }
        ]
      },
      {
        id: 'arc_1',
        purpose: 'Recover the stolen bell',
        focusAxis: 'trust_vs_control',
        currentChapterIndex: 1,
        chapters: [
          {
            id: 'arc_1_ch_0',
            purpose: 'Find the empty tower',
            mustResolve: 'Explain the first silence'
          },
          {
            id: 'arc_1_ch_1',
            purpose: 'Follow the bell rope',
            mustResolve: 'Prove why the tower went silent'
          },
          {
            id: 'arc_1_ch_2',
            purpose: 'Future chapter purpose',
            mustResolve: 'Resolve a later chapter'
          }
        ]
      },
      {
        id: 'arc_2',
        purpose: 'Future arc purpose',
        focusAxis: 'future_axis',
        currentChapterIndex: 0,
        chapters: [
          {
            id: 'arc_2_ch_0',
            purpose: 'Future chapter purpose',
            mustResolve: 'Resolve another future chapter'
          }
        ]
      }
    ],
    ...overrides
  };
}

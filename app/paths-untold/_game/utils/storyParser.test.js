import { describe, it, expect } from 'vitest';
import { extractAndNormalizeAiResponse, validateNormalizedScenePacket } from './storyParser';

function sceneJson(overrides = {}) {
  return JSON.stringify({
    prose: 'Scene text.',
    paths: ['Wait'],
    locationDelta: { name: 'Post Office' },
    objectsState: [],
    ...overrides
  });
}

describe('storyParser: scene/scene normalization', () => {
  it('parses scene field as prose', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: sceneJson({
            scene: 'You stand in a warehouse.',
            prose: undefined,
            paths: undefined,
            choices: ['A', 'B'],
            locationDelta: { name: 'Warehouse' }
          })
        }
      }]
    });
    expect(result.prose).toBe('You stand in a warehouse.');
    expect(result.paths).toHaveLength(2);
    expect(result.paths[0]).toBe('A');
    expect(validateNormalizedScenePacket(result).ok).toBe(true);
  });

  it('parses uppercase Scene field', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: JSON.stringify({
            Scene: 'Market square.',
            Choices: ['Look'],
            locationDelta: { name: 'Market Square' },
            objectsState: []
          })
        }
      }]
    });
    expect(result.prose).toBe('Market square.');
    expect(result.paths[0]).toBe('Look');
    expect(validateNormalizedScenePacket(result).ok).toBe(true);
  });

  it('prevents raw JSON as prose', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: '{"bad": "json without prose"}' } }]
    });
    expect(result.prose).toBe('');
  });

  it('still accepts prose field', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: sceneJson({ prose: 'Original field' }) } }]
    });
    expect(result.prose).toBe('Original field');
    expect(validateNormalizedScenePacket(result).ok).toBe(true);
  });

  it('still accepts story field', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: JSON.stringify({
            story: 'Legacy field',
            choices: ['Y'],
            locationDelta: { name: 'Road' },
            objectsState: []
          })
        }
      }]
    });
    expect(result.prose).toBe('Legacy field');
    expect(validateNormalizedScenePacket(result).ok).toBe(true);
  });

  it('preserves complete objectsState snapshots with placement', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: sceneJson({
            prose: 'You set the brass key down.',
            paths: ['Step back'],
            objectsState: [
              {
                id: 'brass_key',
                name: 'Brass Key',
                condition: 'intact',
                placement: { kind: 'placed', at: 'Post Office Desk' }
              }
            ]
          })
        }
      }]
    });

    expect(result.objectsState).toEqual([
      {
        id: 'brass_key',
        name: 'Brass Key',
        condition: 'intact',
        placement: { kind: 'placed', at: 'Post Office Desk' }
      }
    ]);
    expect(validateNormalizedScenePacket(result).ok).toBe(true);
  });

  it('rejects missing object placement', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: sceneJson({
            objectsState: [
              {
                id: 'brass_key',
                name: 'Brass Key',
                condition: 'intact'
              }
            ]
          })
        }
      }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'invalid_object_placement:brass_key'
    });
  });

  it('rejects legacy holder/location object placement fields', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{
        message: {
          content: sceneJson({
            objectsState: [
              {
                id: 'brass_key',
                name: 'Brass Key',
                condition: 'intact',
                placement: { kind: 'held', by: 'player' },
                holder: 'player'
              }
            ]
          })
        }
      }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'legacy_object_placement_fields:brass_key'
    });
  });

  it('fails scene validation when locationDelta is missing', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: JSON.stringify({ prose: 'No location.', paths: ['Wait'], objectsState: [] }) } }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'missing_location_delta_name'
    });
  });

  it('fails scene validation when locationDelta.name is empty', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: sceneJson({ locationDelta: { name: '' } }) } }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'missing_location_delta_name'
    });
  });

  it('fails scene validation when locationDelta.name is whitespace only', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: sceneJson({ locationDelta: { name: '   ' } }) } }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'missing_location_delta_name'
    });
  });

  it('fails scene validation when objectsState is missing', () => {
    const result = extractAndNormalizeAiResponse({
      choices: [{ message: { content: JSON.stringify({ prose: 'No objects.', paths: ['Wait'], locationDelta: { name: 'Post Office' } }) } }]
    });

    expect(validateNormalizedScenePacket(result)).toEqual({
      ok: false,
      reason: 'missing_objects_state'
    });
  });
});

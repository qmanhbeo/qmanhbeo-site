import { describe, expect, it } from 'vitest';
import { migrateMemory } from './migrateMemory';

describe('migrateMemory world preservation', () => {
  it('preserves legacy world fields when arc is absent', () => {
    const migrated = migrateMemory({
      story: ['The counter bell rings.'],
      choices: [''],
      currentScene: 2,
      world: {
        clock: { day: 3, time: 'dusk' },
        location: { name: 'Post Office', tags: ['indoors'] },
        flags: { key_seen: true },
        objectives: [{ id: 'mail', text: 'Deliver the letter', status: 'active' }],
        sceneTags: ['bureaucracy'],
        weather: 'rain'
      }
    });

    expect(migrated.prose).toEqual(['The counter bell rings.']);
    expect(migrated.paths).toEqual(['']);
    expect(migrated.sceneIndex).toBe(2);
    expect(migrated.world.location).toEqual({ name: 'Post Office', tags: ['indoors'] });
    expect(migrated.world.clock).toEqual({ day: 3, time: 'dusk' });
    expect(migrated.world.flags).toEqual({ key_seen: true });
    expect(migrated.world.objectives).toEqual([
      { id: 'mail', text: 'Deliver the letter', status: 'active' }
    ]);
    expect(migrated.world.sceneTags).toEqual(['bureaucracy']);
    expect(migrated.world.objects).toEqual([]);
    expect(migrated.world.weather).toBe('rain');
  });

  it('preserves current-format world objects', () => {
    const objects = [
      {
        id: 'brass_key',
        name: 'Brass Key',
        condition: 'destroyed',
        placement: { kind: 'placed', at: 'Post Office Desk' },
        lastUpdatedScene: 9
      }
    ];

    const migrated = migrateMemory({
      prose: ['Scene.'],
      paths: [''],
      sceneIndex: 1,
      world: {
        clock: { day: 1, time: 'day' },
        location: { name: 'Post Office', tags: [] },
        sceneTags: [],
        objectives: [],
        flags: {},
        objects
      },
      arc: { chapter: 1, beat: 0, tension: 3 }
    });

    expect(migrated.world.objects).toEqual(objects);
  });

  it('migrates legacy flat object placement fields', () => {
    const migrated = migrateMemory({
      prose: ['Scene.'],
      paths: [''],
      sceneIndex: 1,
      world: {
        objects: [
          {
            id: 'pizza',
            name: 'Carlos Pizza',
            condition: 'intact',
            holder: 'player',
            location: null,
            lastUpdatedScene: 1
          },
          {
            id: 'receipt',
            name: 'Receipt',
            condition: 'intact',
            holder: null,
            location: 'Aldi Checkout Counter',
            lastUpdatedScene: 2
          }
        ]
      }
    });

    expect(migrated.world.objects).toEqual([
      {
        id: 'pizza',
        name: 'Carlos Pizza',
        condition: 'intact',
        placement: { kind: 'held', by: 'player' },
        lastUpdatedScene: 1
      },
      {
        id: 'receipt',
        name: 'Receipt',
        condition: 'intact',
        placement: { kind: 'placed', at: 'Aldi Checkout Counter' },
        lastUpdatedScene: 2
      }
    ]);
  });

  it('uses safe world defaults when raw world is absent', () => {
    const migrated = migrateMemory({
      story: ['Old scene.'],
      choices: [''],
      currentScene: 0
    });

    expect(migrated.world).toMatchObject({
      clock: { day: 1, time: 'day' },
      location: { name: 'Unknown Place', tags: [] },
      sceneTags: [],
      objectives: [],
      flags: {},
      objects: []
    });
  });

  it('uses safe world defaults when raw world is malformed', () => {
    const migrated = migrateMemory({
      story: ['Old scene.'],
      choices: [''],
      currentScene: 0,
      world: 'Post Office'
    });

    expect(migrated.world).toMatchObject({
      clock: { day: 1, time: 'day' },
      location: { name: 'Unknown Place', tags: [] },
      sceneTags: [],
      objectives: [],
      flags: {},
      objects: []
    });
  });
});

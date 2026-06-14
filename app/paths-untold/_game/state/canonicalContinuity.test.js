import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildScenePrompt } from '../utils/buildUnifiedPrompt';
import { buildContinuityAfterTrace } from '../utils/continuityTrace';
import { loadGameFromSlot, saveGameToSlot } from '../utils/saveSystem';
import { buildSceneValidationRetryInstruction } from '../utils/storyParser';
import { migrateMemory } from './migrateMemory';
import { isPlayerHeldObject } from './narrativeObjects';
import { createMemorySnapshot } from './narrativeGraph';
import { updateFromAIPacket } from './updateFromAIPacket';

function baseMemory(overrides = {}) {
  const { world = {}, arc = {}, ...rest } = overrides;
  return {
    summary: [],
    paths: [],
    companions: [],
    prose: [],
    sceneLog: [],
    sceneIndex: 0,
    world: {
      clock: { day: 1, time: 'day' },
      location: { name: 'Post Office', tags: [] },
      sceneTags: [],
      objectives: [],
      flags: {},
      objects: [],
      ...world
    },
    arc: {
      chapter: 1,
      beat: 0,
      tension: 3,
      coreQuestion: '',
      activeThreads: [],
      arcPlan: null,
      chapterPlan: null,
      storyBlueprint: null,
      ...arc
    },
    ...rest
  };
}

function scenePacket(overrides = {}) {
  return {
    prose: 'The scene changes.',
    paths: ['Continue'],
    summary: 'A scene changes.',
    sceneRecord: {
      event: 'Something happened.',
      stateChange: 'The world state changed.',
      reveals: []
    },
    locationDelta: { name: 'Post Office' },
    objectsState: [],
    ...overrides
  };
}

const held = (by = 'player') => ({ kind: 'held', by });
const placed = (at) => ({ kind: 'placed', at });
const unlocated = () => ({ kind: 'unlocated' });

function key({
  placement = held('player'),
  condition = 'intact',
  description,
  lastUpdatedScene = 0
} = {}) {
  const object = {
    id: 'brass_key',
    name: 'Brass Key',
    condition,
    placement,
    lastUpdatedScene
  };
  if (description !== undefined) object.description = description;
  return object;
}

function jar({ placement = held('player'), lastUpdatedScene = 0 } = {}) {
  return {
    id: 'dried_lavender',
    name: 'Dried Lavender',
    condition: 'intact',
    placement,
    lastUpdatedScene
  };
}

function flower({ placement = held('player'), lastUpdatedScene = 0 } = {}) {
  return {
    id: 'blue_flower',
    name: 'Blue Flower',
    condition: 'intact',
    placement,
    lastUpdatedScene
  };
}

function stateObject(object) {
  const { lastUpdatedScene, ...state } = object;
  return state;
}

function objectById(memory, id) {
  return memory.world.objects.find((object) => object.id === id);
}

function makeLocalStorage() {
  const store = new Map();
  return {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    key: vi.fn((index) => Array.from(store.keys())[index] ?? null),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    }
  };
}

describe('canonical continuity objects', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorage());
  });

  it('accepts an opening scene with a valid end location and empty mandatory object snapshot', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({
        prose: 'You begin at the counter.',
        locationDelta: { name: 'Post Office' },
        objectsState: []
      })
    );

    expect(next.world.location.name).toBe('Post Office');
    expect(next.world.objects).toEqual([]);
    expect(next.prose).toEqual(['You begin at the counter.']);
  });

  it('accepts a follow-up scene with a valid end location and complete snapshot', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        sceneIndex: 0,
        world: {
          location: { name: 'Post Office', tags: [] },
          objects: [key({ lastUpdatedScene: 0 })]
        }
      }),
      scenePacket({
        prose: 'You step into the clock tower.',
        locationDelta: { name: 'Clock Tower' },
        objectsState: [stateObject(key())]
      })
    );

    expect(next.world.location.name).toBe('Clock Tower');
    expect(next.prose).toEqual(['Opening.', 'You step into the clock tower.']);
    expect(objectById(next, 'brass_key').lastUpdatedScene).toBe(0);
  });

  it('rejects a scene when objectsState is missing', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: undefined })
    )).toThrow('missing_objects_state');
  });

  it('rejects a scene when an existing object is omitted', () => {
    expect(() => updateFromAIPacket(
      baseMemory({ world: { objects: [key()] } }),
      scenePacket({ objectsState: [] })
    )).toThrow('missing_tracked_object:brass_key');
  });

  it('rejects a scene with duplicate object ids', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key()), stateObject(key())] })
    )).toThrow('duplicate_object_id:brass_key');
  });

  it('rejects invalid object conditions', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [{ ...stateObject(key()), condition: 'polished' }] })
    )).toThrow('invalid_object_condition:brass_key');
  });

  it('rejects invalid placement kinds', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({
        objectsState: [{ ...stateObject(key()), placement: { kind: 'nearby' } }]
      })
    )).toThrow('invalid_object_placement_kind:brass_key');
  });

  it('rejects held placement without by', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({
        objectsState: [{ ...stateObject(key()), placement: { kind: 'held' } }]
      })
    )).toThrow('missing_object_placement_by:brass_key');
  });

  it('rejects placed placement without at', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({
        objectsState: [{ ...stateObject(key()), placement: { kind: 'placed' } }]
      })
    )).toThrow('missing_object_placement_at:brass_key');
  });

  it('rejects prohibited mixed placement fields', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({
        objectsState: [{ ...stateObject(key()), placement: { kind: 'held', by: 'player', at: 'Post Office Desk' } }]
      })
    )).toThrow('mixed_object_placement:brass_key');
  });

  it('rejects legacy holder/location fields in generated object snapshots', () => {
    expect(() => updateFromAIPacket(
      baseMemory(),
      scenePacket({
        objectsState: [{ ...stateObject(key()), holder: 'player' }]
      })
    )).toThrow('legacy_object_placement_fields:brass_key');
  });

  it('accepts player-held objects', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key({ placement: held('player') }))] })
    );

    expect(objectById(next, 'brass_key').placement).toEqual(held('player'));
  });

  it('derives Items panel objects from player-held placement', () => {
    const objects = [
      key({ placement: held('player') }),
      jar({ placement: held('Ethan') }),
      flower({ placement: placed('Aldi Checkout Counter') })
    ];

    expect(objects.filter(isPlayerHeldObject).map((object) => object.id)).toEqual(['brass_key']);
  });

  it('accepts NPC-held objects', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key({ placement: held('Ethan') }))] })
    );

    expect(objectById(next, 'brass_key').placement).toEqual(held('Ethan'));
  });

  it('accepts objects placed on a counter', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key({ placement: placed('Aldi Checkout Counter') }))] })
    );

    expect(objectById(next, 'brass_key').placement).toEqual(placed('Aldi Checkout Counter'));
  });

  it('accepts unlocated objects', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key({ placement: unlocated() }))] })
    );

    expect(objectById(next, 'brass_key').placement).toEqual(unlocated());
  });

  it('preserves lastUpdatedScene for unchanged complete snapshots', () => {
    const next = updateFromAIPacket(
      baseMemory({ world: { objects: [key({ lastUpdatedScene: 7 })] } }),
      scenePacket({ objectsState: [stateObject(key())] })
    );

    expect(objectById(next, 'brass_key').lastUpdatedScene).toBe(7);
  });

  it('preserves an existing description when a snapshot omits description', () => {
    const next = updateFromAIPacket(
      baseMemory({
        world: {
          objects: [key({ description: 'A small brass key with a salt-stained bow.', lastUpdatedScene: 5 })]
        }
      }),
      scenePacket({ objectsState: [stateObject(key())] })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      description: 'A small brass key with a salt-stained bow.',
      lastUpdatedScene: 5
    });
  });

  it('replaces an existing description when a new non-empty description is supplied', () => {
    const next = updateFromAIPacket(
      baseMemory({
        world: {
          objects: [key({ description: 'A plain brass key.', lastUpdatedScene: 5 })]
        }
      }),
      scenePacket({
        objectsState: [stateObject(key({ description: 'A brass key marked with a black notch.' }))]
      })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      description: 'A brass key marked with a black notch.',
      lastUpdatedScene: 0
    });
  });

  it('allows a new object to omit description', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({ objectsState: [stateObject(key())] })
    );

    expect(objectById(next, 'brass_key')).not.toHaveProperty('description');
  });

  it('preserves an existing description when the snapshot supplies a blank description', () => {
    const next = updateFromAIPacket(
      baseMemory({
        world: {
          objects: [key({ description: 'A small brass key with a salt-stained bow.', lastUpdatedScene: 5 })]
        }
      }),
      scenePacket({ objectsState: [{ ...stateObject(key()), description: '   ' }] })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      description: 'A small brass key with a salt-stained bow.',
      lastUpdatedScene: 5
    });
  });

  it('transfers an object from player to cashier', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        world: { objects: [key({ lastUpdatedScene: 0 })] }
      }),
      scenePacket({
        objectsState: [stateObject(key({ placement: held('cashier') }))]
      })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      placement: held('cashier'),
      lastUpdatedScene: 1
    });
  });

  it('places an object from cashier possession onto a counter', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        world: { objects: [key({ placement: held('cashier'), lastUpdatedScene: 0 })] }
      }),
      scenePacket({
        objectsState: [stateObject(key({ placement: placed('Aldi Checkout Counter') }))]
      })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      placement: placed('Aldi Checkout Counter'),
      lastUpdatedScene: 1
    });
  });

  it('places an object from player possession onto a counter', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        world: { objects: [key({ lastUpdatedScene: 0 })] }
      }),
      scenePacket({
        objectsState: [stateObject(key({ placement: placed('Post Office Counter') }))]
      })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      placement: placed('Post Office Counter'),
      lastUpdatedScene: 1
    });
  });

  it('retrieves an object from a counter into player possession', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        world: { objects: [key({ placement: placed('Post Office Counter') })] }
      }),
      scenePacket({
        objectsState: [stateObject(key({ placement: held('player') }))]
      })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      placement: held('player'),
      lastUpdatedScene: 1
    });
  });

  it('introduces a second persistent object such as a flower', () => {
    const next = updateFromAIPacket(
      baseMemory({
        prose: ['Opening.'],
        world: { objects: [jar({ placement: placed('Reception Counter') })] }
      }),
      scenePacket({
        objectsState: [
          stateObject(jar({ placement: placed('Reception Counter') })),
          stateObject(flower())
        ]
      })
    );

    expect(objectById(next, 'dried_lavender').lastUpdatedScene).toBe(0);
    expect(objectById(next, 'blue_flower')).toMatchObject({
      placement: held('player'),
      lastUpdatedScene: 1
    });
  });

  it('records damaged and destroyed conditions', () => {
    const damaged = updateFromAIPacket(
      baseMemory({ world: { objects: [key()] } }),
      scenePacket({ objectsState: [stateObject(key({ condition: 'damaged' }))] })
    );
    const destroyed = updateFromAIPacket(
      damaged,
      scenePacket({ objectsState: [stateObject(key({ condition: 'destroyed' }))] })
    );

    expect(objectById(damaged, 'brass_key')).toMatchObject({
      condition: 'damaged',
      lastUpdatedScene: 0
    });
    expect(objectById(destroyed, 'brass_key')).toMatchObject({
      condition: 'destroyed',
      lastUpdatedScene: 1
    });
  });

  it('records destruction with remains still placed', () => {
    const next = updateFromAIPacket(
      baseMemory({ world: { objects: [key()] } }),
      scenePacket({ objectsState: [stateObject(key({ condition: 'destroyed', placement: placed('Aldi Checkout Counter') }))] })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      condition: 'destroyed',
      placement: placed('Aldi Checkout Counter')
    });
  });

  it('records complete destruction as unlocated', () => {
    const next = updateFromAIPacket(
      baseMemory({ world: { objects: [key()] } }),
      scenePacket({ objectsState: [stateObject(key({ condition: 'destroyed', placement: unlocated() }))] })
    );

    expect(objectById(next, 'brass_key')).toMatchObject({
      condition: 'destroyed',
      placement: unlocated()
    });
  });

  it('requires destroyed objects to remain in subsequent snapshots', () => {
    expect(() => updateFromAIPacket(
      baseMemory({ world: { objects: [key({ condition: 'destroyed' })] } }),
      scenePacket({ objectsState: [] })
    )).toThrow('missing_tracked_object:brass_key');
  });

  it('rejects silent stable id name changes', () => {
    expect(() => updateFromAIPacket(
      baseMemory({ world: { objects: [key()] } }),
      scenePacket({ objectsState: [{ ...stateObject(key()), name: 'Silver Key' }] })
    )).toThrow('renamed_object:brass_key');
  });

  it('does not update memory when location validation fails', () => {
    const memory = baseMemory({
      world: {
        location: { name: 'Post Office', tags: [] },
        objects: [key()]
      }
    });

    expect(() => updateFromAIPacket(
      memory,
      scenePacket({
        prose: 'You climb into the clock tower.',
        locationDelta: {},
        objectsState: [stateObject(key({ condition: 'destroyed', placement: unlocated() }))]
      })
    )).toThrow('missing_location_delta_name');
    expect(memory.world.location.name).toBe('Post Office');
    expect(memory.world.objects).toEqual([key()]);
    expect(memory.prose).toEqual([]);
  });

  it('does not commit prose, location, or objects when an object snapshot is rejected', () => {
    const memory = baseMemory({
      world: {
        location: { name: 'Post Office', tags: [] },
        objects: [key()]
      }
    });

    expect(() => updateFromAIPacket(
      memory,
      scenePacket({
        prose: 'You hand the key away.',
        locationDelta: { name: 'Lobby' },
        objectsState: [{ ...stateObject(key()), name: 'Renamed Key' }]
      })
    )).toThrow('renamed_object:brass_key');
    expect(memory.world.location.name).toBe('Post Office');
    expect(memory.world.objects).toEqual([key()]);
    expect(memory.prose).toEqual([]);
  });

  it('does not commit prose, location, or objects when placement validation fails', () => {
    const memory = baseMemory({
      world: {
        location: { name: 'Post Office', tags: [] },
        objects: [key()]
      }
    });

    expect(() => updateFromAIPacket(
      memory,
      scenePacket({
        prose: 'You hand the key away.',
        locationDelta: { name: 'Lobby' },
        objectsState: [{ ...stateObject(key()), placement: { kind: 'held', by: 'player', at: 'Lobby Counter' } }]
      })
    )).toThrow('mixed_object_placement:brass_key');
    expect(memory.world.location.name).toBe('Post Office');
    expect(memory.world.objects).toEqual([key()]);
    expect(memory.prose).toEqual([]);
  });

  it('includes canonical objects in the next-scene prompt', () => {
    const { user } = buildScenePrompt(
      baseMemory({
        prose: ['Opening.'],
        world: {
          objects: [key({ condition: 'destroyed', placement: placed('Post Office Desk') })]
        }
      }),
      'Continue'
    );

    expect(user).toContain('Canonical Objects (authoritative persistent state):');
    expect(user).toContain('- brass_key: Brass Key; condition=destroyed; placement=placed(Post Office Desk)');
  });

  it('propagates locationDelta into the next prompt location', () => {
    const next = updateFromAIPacket(
      baseMemory(),
      scenePacket({
        prose: 'You climb into the clock tower.',
        locationDelta: { name: 'Clock Tower' },
        objectsState: []
      })
    );
    const { user } = buildScenePrompt(next, 'Listen');

    expect(user).toContain('- Location: Clock Tower');
  });

  it('migrates old saves to an empty canonical objects collection', () => {
    const migrated = migrateMemory({
      story: ['Old scene.'],
      choices: [''],
      currentScene: 0,
      world: {
        clock: { day: 1, time: 'day' },
        location: { name: 'Post Office', tags: [] },
        sceneTags: [],
        objectives: [],
        flags: {}
      }
    });

    expect(migrated.world.objects).toEqual([]);
  });

  it('migrates legacy flat holder/location objects to placement', () => {
    const migrated = migrateMemory({
      story: ['Old scene.'],
      choices: [''],
      currentScene: 0,
      world: {
        objects: [
          { id: 'held_key', name: 'Held Key', condition: 'intact', holder: 'player', location: null, lastUpdatedScene: 2 },
          { id: 'placed_key', name: 'Placed Key', condition: 'intact', holder: null, location: 'Post Office Desk', lastUpdatedScene: 3 },
          { id: 'lost_key', name: 'Lost Key', condition: 'destroyed', holder: null, location: null, lastUpdatedScene: 4 }
        ]
      }
    });

    expect(migrated.world.objects).toEqual([
      { id: 'held_key', name: 'Held Key', condition: 'intact', placement: held('player'), lastUpdatedScene: 2 },
      { id: 'placed_key', name: 'Placed Key', condition: 'intact', placement: placed('Post Office Desk'), lastUpdatedScene: 3 },
      { id: 'lost_key', name: 'Lost Key', condition: 'destroyed', placement: unlocated(), lastUpdatedScene: 4 }
    ]);
  });

  it('preserves canonical objects through save/load', () => {
    const memory = baseMemory({
      world: {
        objects: [
          key({
            condition: 'damaged',
            description: 'A small brass key with a salt-stained bow.',
            lastUpdatedScene: 3
          })
        ]
      }
    });

    saveGameToSlot('slot1', {
      options: {},
      memory,
      ui: { displayedPaths: [] }
    });
    const loaded = loadGameFromSlot('slot1');

    expect(loaded.memory.world.objects).toEqual(memory.world.objects);
  });

  it('preserves canonical object placement through narrative graph snapshots', () => {
    const memory = baseMemory({
      world: {
        objects: [key({ placement: placed('Aldi Checkout Counter'), lastUpdatedScene: 4 })]
      }
    });

    expect(createMemorySnapshot(memory).world.objects).toEqual(memory.world.objects);
  });

  it('preserved descriptions appear in continuity after-commit traces', () => {
    const next = updateFromAIPacket(
      baseMemory({
        world: {
          objects: [key({ description: 'A small brass key with a salt-stained bow.', lastUpdatedScene: 5 })]
        }
      }),
      scenePacket({ objectsState: [stateObject(key())] })
    );
    const trace = buildContinuityAfterTrace({
      sceneIndex: next.sceneIndex,
      attempt: 'initial',
      beforeObjects: [],
      committedLocation: next.world.location,
      committedObjects: next.world.objects
    });

    expect(trace.committedCanonicalObjects[0]).toMatchObject({
      id: 'brass_key',
      description: 'A small brass key with a salt-stained bow.',
      lastUpdatedScene: 5
    });
  });

  it('regresses jar transfer, return to counter, and flower pickup through complete snapshots', () => {
    const tookJar = updateFromAIPacket(
      baseMemory(),
      scenePacket({
        prose: 'You take the jar of dried herbs.',
        objectsState: [stateObject(jar())]
      }),
      'Take the jar of dried herbs.'
    );
    const handedJar = updateFromAIPacket(
      tookJar,
      scenePacket({
        prose: 'You hand the jar to the receptionist.',
        objectsState: [stateObject(jar({ placement: held('receptionist') }))]
      }),
      'Hand the jar to the receptionist.'
    );
    const counterAndFlower = updateFromAIPacket(
      handedJar,
      scenePacket({
        prose: 'You put the jar back on the counter and pick up a flower.',
        objectsState: [
          stateObject(jar({ placement: placed('Reception Counter') })),
          stateObject(flower())
        ]
      }),
      'Put the jar on the counter and pick up a flower.'
    );

    expect(objectById(counterAndFlower, 'dried_lavender')).toMatchObject({
      placement: placed('Reception Counter'),
      lastUpdatedScene: 2
    });
    expect(objectById(counterAndFlower, 'blue_flower')).toMatchObject({
      placement: held('player'),
      lastUpdatedScene: 2
    });
  });

  it('prompts for complete object snapshots rather than optional deltas', () => {
    const { system } = buildScenePrompt(baseMemory(), 'Continue');

    expect(system).toContain('Return objectsState as the complete end-of-scene state');
    expect(system).toContain('Repeat unchanged objects unchanged.');
    expect(system).toContain('"placement"');
    expect(system).toContain('{ "kind": "held", "by": "player or stable NPC/companion id/name" }');
    expect(system).toContain('For placed objects, use the most specific useful placement available');
    expect(system).toContain('"objectsState"');
    expect(system).not.toContain('objectsDelta');
    expect(system).not.toContain('"holder"');
    expect(system).not.toContain('"location": "physical location name | null"');
  });

  it('prompts that player input is an attempt and canonical state outranks player claims', () => {
    const { user } = buildScenePrompt(
      baseMemory({
        prose: ['You ate the pizza down to an empty box.'],
        world: {
          objects: [
            {
              id: 'carlos_pizza',
              name: 'Carlos Pizza',
              condition: 'destroyed',
              placement: placed('Aldi Checkout Counter'),
              lastUpdatedScene: 4
            }
          ]
        }
      }),
      'I take the intact pizza from my pocket and eat it again.'
    );

    expect(user).toContain('PLAYER INPUT IS AN ATTEMPT, NOT CANONICAL FACT.');
    expect(user).toContain("compare the player's attempted action with Canonical World and Canonical Objects");
    expect(user).toContain('If the action contradicts canonical reality');
    expect(user).toContain("The player's wording does not override canonical state.");
  });

  it('prompts that destroyed-object reuse and consumed-object reuse must be challenged', () => {
    const { user } = buildScenePrompt(baseMemory(), 'Continue');

    expect(user).toContain('A destroyed object cannot be used, eaten, opened, restored, or possessed normally.');
    expect(user).toContain('A consumed object cannot be consumed again.');
    expect(user).toContain('explicitly correct or challenge the contradiction as a game master or narrator');
  });

  it('prompts that remote possession must be challenged', () => {
    const { user } = buildScenePrompt(baseMemory(), 'Continue');

    expect(user).toContain('An object held by another character cannot be used by the player without first retrieving it.');
    expect(user).toContain("An object placed elsewhere cannot appear in the player's possession.");
  });

  it('prompts that replacement objects require new IDs', () => {
    const { user } = buildScenePrompt(baseMemory(), 'Continue');

    expect(user).toContain('A replacement object must be explicitly acquired and introduced with a new stable ID.');
  });

  it('prompts for a prose and objectsState consistency self-check', () => {
    const { system } = buildScenePrompt(baseMemory(), 'Continue');

    expect(system).toContain('FINAL SELF-CHECK: Before returning JSON, verify that the prose and objectsState agree with each other and with the supplied Canonical Objects.');
    expect(system).toContain('If the player attempted a contradiction, the prose must acknowledge it rather than comply with it.');
  });

  it('has no active two-pass feature flag, utility, logs, or imports', () => {
    const root = path.resolve(__dirname, '..');
    const files = [
      'components/GameScreen.jsx',
      'utils/storyParser.js',
      'utils/buildUnifiedPrompt.js'
    ];
    const source = files
      .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
      .join('\n');

    expect(fs.existsSync(path.join(root, 'utils/twoPassObjectScenes.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'utils/twoPassObjectScenes.test.js'))).toBe(false);
    expect(source).not.toContain('NEXT_PUBLIC_PATHS_UNTOLD_TWO_PASS_OBJECT_SCENES');
    expect(source).not.toContain('twoPassObjectScenes');
    expect(source).not.toContain('Paths Untold outcome');
    expect(source).not.toContain('Paths Untold realization');
  });

  it('builds a concise retry correction from validation reasons', () => {
    expect(buildSceneValidationRetryInstruction('mixed_object_placement:carlos_pizza')).toBe(
      [
        'Previous scene packet rejected:',
        'mixed_object_placement:carlos_pizza',
        'Return the full scene JSON again. Each object placement must be exactly one of:',
        '{ "kind": "held", "by": "..." }, { "kind": "placed", "at": "..." }, or { "kind": "unlocated" }.'
      ].join('\n')
    );
  });
});

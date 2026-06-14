import { describe, expect, it } from 'vitest';
import {
  buildContinuityAfterTrace,
  buildContinuityBeforeTrace,
  getObjectChangeSummary
} from './continuityTrace';

describe('continuityTrace helpers', () => {
  it('builds compact cloned before-commit snapshots', () => {
    const currentLocation = { name: 'Garden', tags: ['outside'] };
    const currentObjects = [
      {
        id: 'strange_key',
        name: 'Strange Key',
        description: 'Too verbose for continuity trace',
        condition: 'intact',
        placement: { kind: 'placed', at: 'Garden Box' },
        lastUpdatedScene: 2
      }
    ];
    const parsedObjectsState = [{
      id: 'strange_key',
      name: 'Strange Key',
      condition: 'intact',
      placement: { kind: 'held', by: 'player' }
    }];

    const trace = buildContinuityBeforeTrace({
      sceneIndex: 4,
      attempt: 'retry',
      playerChoice: 'Walk home',
      currentLocation,
      currentObjects,
      parsedLocationDelta: { name: 'Home' },
      parsedObjectsState
    });

    currentLocation.name = 'Mutated';
    currentObjects[0].placement = { kind: 'held', by: 'player' };
    parsedObjectsState[0].placement.by = 'Mara';

    expect(trace).toEqual({
      stage: 'beforeCommit',
      attempt: 'retry',
      sceneIndex: 4,
      playerChoice: 'Walk home',
      currentCanonicalLocation: { name: 'Garden', tags: ['outside'] },
      currentCanonicalObjects: [
        {
          id: 'strange_key',
          name: 'Strange Key',
          description: 'Too verbose for continuity trace',
          condition: 'intact',
          placement: { kind: 'placed', at: 'Garden Box' },
          lastUpdatedScene: 2
        }
      ],
      parsedLocationDelta: { name: 'Home' },
      parsedObjectsState: [{
        id: 'strange_key',
        name: 'Strange Key',
        condition: 'intact',
        placement: { kind: 'held', by: 'player' }
      }]
    });
  });

  it('reports added and changed object ids after commit', () => {
    const beforeObjects = [
      {
        id: 'strange_key',
        name: 'Strange Key',
        condition: 'intact',
        placement: { kind: 'placed', at: 'Garden Box' },
        lastUpdatedScene: 2
      }
    ];
    const afterObjects = [
      {
        id: 'strange_key',
        name: 'Strange Key',
        condition: 'destroyed',
        placement: { kind: 'placed', at: 'Garden Box' },
        lastUpdatedScene: 4
      },
      {
        id: 'wooden_box',
        name: 'Wooden Box',
        condition: 'intact',
        placement: { kind: 'placed', at: 'Garden' },
        lastUpdatedScene: 4
      }
    ];

    expect(getObjectChangeSummary(beforeObjects, afterObjects)).toEqual({
      addedObjectIds: ['wooden_box'],
      changedObjectIds: ['strange_key']
    });
  });

  it('builds after-commit snapshots with committed location and canonical objects', () => {
    const trace = buildContinuityAfterTrace({
      sceneIndex: 5,
      attempt: 'initial',
      beforeObjects: [],
      committedLocation: { name: 'Home', tags: ['inside'] },
      committedObjects: [
        {
          id: 'strange_key',
          name: 'Strange Key',
          condition: 'intact',
          placement: { kind: 'placed', at: 'Garden Box' },
          lastUpdatedScene: 2
        }
      ]
    });

    expect(trace).toEqual({
      stage: 'afterCommit',
      attempt: 'initial',
      sceneIndex: 5,
      committedLocation: { name: 'Home', tags: ['inside'] },
      committedCanonicalObjects: [
        {
          id: 'strange_key',
          name: 'Strange Key',
          condition: 'intact',
          placement: { kind: 'placed', at: 'Garden Box' },
          lastUpdatedScene: 2
        }
      ],
      addedObjectIds: ['strange_key'],
      changedObjectIds: []
    });
  });
});

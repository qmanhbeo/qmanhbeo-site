export const CONTINUITY_TRACE_PREFIX = '[Paths Untold continuity]';

function snapshotPlacement(placement) {
  if (placement?.kind === 'held') return { kind: 'held', by: String(placement.by ?? '') };
  if (placement?.kind === 'placed') return { kind: 'placed', at: String(placement.at ?? '') };
  return { kind: 'unlocated' };
}

export function isContinuityTraceEnabled() {
  return process.env.NODE_ENV === 'development';
}

export function snapshotLocation(location) {
  return {
    name: typeof location?.name === 'string' ? location.name : 'Unknown Place',
    tags: Array.isArray(location?.tags) ? location.tags.map(String) : []
  };
}

export function snapshotObjects(objects) {
  if (!Array.isArray(objects)) return [];
  return objects
    .filter((object) => object?.id)
    .map((object) => {
      const snapshot = {
        id: String(object.id),
        name: String(object.name ?? ''),
        condition: object.condition ?? 'intact',
        placement: snapshotPlacement(object.placement),
        lastUpdatedScene: Number.isFinite(object.lastUpdatedScene)
          ? object.lastUpdatedScene
          : null
      };
      if (typeof object.description === 'string' && object.description.trim()) {
        snapshot.description = object.description.trim();
      }
      return snapshot;
    });
}

export function snapshotDelta(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}

export function getObjectChangeSummary(beforeObjects, afterObjects) {
  const beforeById = new Map(snapshotObjects(beforeObjects).map((object) => [object.id, object]));
  const after = snapshotObjects(afterObjects);
  const addedObjectIds = [];
  const changedObjectIds = [];

  for (const object of after) {
    const before = beforeById.get(object.id);
    if (!before) {
      addedObjectIds.push(object.id);
    } else if (JSON.stringify(before) !== JSON.stringify(object)) {
      changedObjectIds.push(object.id);
    }
  }

  return { addedObjectIds, changedObjectIds };
}

export function buildContinuityBeforeTrace({
  sceneIndex,
  attempt,
  playerChoice,
  currentLocation,
  currentObjects,
  parsedLocationDelta,
  parsedObjectsState
}) {
  return {
    stage: 'beforeCommit',
    attempt,
    sceneIndex,
    playerChoice: playerChoice || '',
    currentCanonicalLocation: snapshotLocation(currentLocation),
    currentCanonicalObjects: snapshotObjects(currentObjects),
    parsedLocationDelta: snapshotDelta(parsedLocationDelta ?? null),
    parsedObjectsState: snapshotDelta(parsedObjectsState ?? null)
  };
}

export function buildContinuityAfterTrace({
  sceneIndex,
  attempt,
  beforeObjects,
  committedLocation,
  committedObjects
}) {
  const committedCanonicalObjects = snapshotObjects(committedObjects);
  return {
    stage: 'afterCommit',
    attempt,
    sceneIndex,
    committedLocation: snapshotLocation(committedLocation),
    committedCanonicalObjects,
    ...getObjectChangeSummary(beforeObjects, committedCanonicalObjects)
  };
}

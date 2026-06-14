const VALID_CONDITIONS = new Set(['intact', 'damaged', 'destroyed']);
const VALID_PLACEMENT_KINDS = new Set(['held', 'placed', 'unlocated']);

export function legacyPlacementForObject(object = {}) {
  if (object?.placement && typeof object.placement === 'object') {
    const kind = typeof object.placement.kind === 'string' ? object.placement.kind.trim() : '';
    if (kind === 'held') {
      const by = typeof object.placement.by === 'string' ? object.placement.by.trim() : '';
      if (by) return { kind: 'held', by };
    }
    if (kind === 'placed') {
      const at = typeof object.placement.at === 'string' ? object.placement.at.trim() : '';
      if (at) return { kind: 'placed', at };
    }
    if (kind === 'unlocated') return { kind: 'unlocated' };
  }

  const holder = object?.holder;
  if (holder !== null && holder !== undefined) {
    const by = typeof holder === 'string' ? holder.trim() : String(holder).trim();
    if (by) return { kind: 'held', by };
  }

  const location = object?.location;
  if (location !== null && location !== undefined) {
    const at = typeof location === 'string' ? location.trim() : String(location).trim();
    if (at) return { kind: 'placed', at };
  }

  return { kind: 'unlocated' };
}

export function normalizeNarrativeObject(object = {}) {
  const normalized = {
    id: String(object.id ?? '').trim(),
    name: String(object.name ?? '').trim(),
    condition: VALID_CONDITIONS.has(object.condition) ? object.condition : 'intact',
    placement: legacyPlacementForObject(object),
    lastUpdatedScene: Number.isFinite(object.lastUpdatedScene) ? object.lastUpdatedScene : 0
  };
  if (typeof object.description === 'string' && object.description.trim()) {
    normalized.description = object.description.trim();
  }
  return normalized;
}

export function normalizeNarrativeObjects(objects) {
  if (!Array.isArray(objects)) return [];
  return objects
    .filter((object) => object && typeof object === 'object' && object.id)
    .map(normalizeNarrativeObject);
}

export function validatePlacement(placement, id = 'object') {
  if (!placement || typeof placement !== 'object') {
    return { ok: false, reason: `invalid_object_placement:${id}` };
  }

  const kind = typeof placement.kind === 'string' ? placement.kind.trim() : '';
  if (!VALID_PLACEMENT_KINDS.has(kind)) {
    return { ok: false, reason: `invalid_object_placement_kind:${id}` };
  }

  if (kind === 'held') {
    if ('at' in placement) return { ok: false, reason: `mixed_object_placement:${id}` };
    const by = typeof placement.by === 'string' ? placement.by.trim() : '';
    if (!by) return { ok: false, reason: `missing_object_placement_by:${id}` };
    return { ok: true, placement: { kind: 'held', by } };
  }

  if (kind === 'placed') {
    if ('by' in placement) return { ok: false, reason: `mixed_object_placement:${id}` };
    const at = typeof placement.at === 'string' ? placement.at.trim() : '';
    if (!at) return { ok: false, reason: `missing_object_placement_at:${id}` };
    return { ok: true, placement: { kind: 'placed', at } };
  }

  if ('by' in placement || 'at' in placement) {
    return { ok: false, reason: `mixed_object_placement:${id}` };
  }
  return { ok: true, placement: { kind: 'unlocated' } };
}

export function placementsEqual(left, right) {
  if (left?.kind !== right?.kind) return false;
  if (left?.kind === 'held') return left.by === right.by;
  if (left?.kind === 'placed') return left.at === right.at;
  return left?.kind === 'unlocated';
}

export function isPlayerHeldObject(object) {
  return object?.placement?.kind === 'held' && object.placement.by === 'player';
}

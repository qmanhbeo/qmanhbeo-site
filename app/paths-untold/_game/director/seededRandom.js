const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 2 ** 32;

export function createRngState(seed) {
  return seed >>> 0;
}

export function nextRandom(rngState) {
  const nextState = (Math.imul(LCG_A, rngState >>> 0) + LCG_C) >>> 0;
  return {
    value: nextState / LCG_M,
    nextState
  };
}

export function randomInt(min, max, rngState) {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error('randomInt bounds must be integers');
  }

  if (max < min) {
    throw new Error('randomInt max must be greater than or equal to min');
  }

  const { value, nextState } = nextRandom(rngState);
  return {
    value: Math.floor(value * (max - min + 1)) + min,
    nextState
  };
}

export function weightedPick(weights, rngState) {
  if (!Array.isArray(weights) || weights.length === 0) {
    throw new Error('weightedPick requires at least one weight');
  }

  const total = weights.reduce((sum, weight) => {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new Error('weightedPick weights must be finite non-negative numbers');
    }

    return sum + weight;
  }, 0);

  if (total <= 0) {
    throw new Error('weightedPick requires a positive total weight');
  }

  const { value, nextState } = nextRandom(rngState);
  const threshold = value * total;
  let runningTotal = 0;

  for (let index = 0; index < weights.length; index += 1) {
    runningTotal += weights[index];
    if (threshold < runningTotal) {
      return { index, nextState };
    }
  }

  return { index: weights.length - 1, nextState };
}

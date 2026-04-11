import { drawFormatBits } from "./function-patterns.js";
import { applyMask, type MatrixState } from "./matrix.js";

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

/**
 * Applies all eight mask patterns and returns the one with the lowest penalty score.
 */
export function findBestMask(state: MatrixState): number {
  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    applyMask(state, mask);
    drawFormatBits(state, mask);

    const penalty = getPenaltyScore(state.modules);
    if (penalty < bestPenalty) {
      bestMask = mask;
      bestPenalty = penalty;
    }

    applyMask(state, mask);
  }

  return bestMask;
}

function getPenaltyScore(modules: readonly (readonly boolean[])[]): number {
  return (
    countRunPenalty(modules) +
    countBlockPenalty(modules) +
    countFinderLikePatterns(modules) * PENALTY_N3 +
    countBalancePenalty(modules)
  );
}

function countRunPenalty(modules: readonly (readonly boolean[])[]): number {
  let result = 0;

  for (const row of modules) {
    result += countLineRunPenalty(row);
  }

  for (let column = 0; column < modules.length; column++) {
    result += countLineRunPenalty(modules.map((row) => row[column]));
  }

  return result;
}

function countLineRunPenalty(line: readonly boolean[]): number {
  let result = 0;
  let runColor = false;
  let runLength = 0;

  for (const module of line) {
    if (module === runColor) {
      runLength++;
      if (runLength === 5) {
        result += PENALTY_N1;
      } else if (runLength > 5) {
        result++;
      }
    } else {
      runColor = module;
      runLength = 1;
    }
  }

  return result;
}

function countBlockPenalty(modules: readonly (readonly boolean[])[]): number {
  let result = 0;

  for (let y = 0; y < modules.length - 1; y++) {
    for (let x = 0; x < modules.length - 1; x++) {
      const color = modules[y][x];
      if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) {
        result += PENALTY_N2;
      }
    }
  }

  return result;
}

function countFinderLikePatterns(modules: readonly (readonly boolean[])[]): number {
  const size = modules.length;
  let result = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 10; x++) {
      if (hasFinderLikePattern((offset) => modules[y][x + offset])) {
        result++;
      }
    }
  }

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size - 10; y++) {
      if (hasFinderLikePattern((offset) => modules[y + offset][x])) {
        result++;
      }
    }
  }

  return result;
}

function hasFinderLikePattern(get: (offset: number) => boolean): boolean {
  // Penalize the 1:1:3:1:1 finder-like run with four light modules on either side.
  return (
    get(0) &&
    !get(1) &&
    get(2) &&
    get(3) &&
    get(4) &&
    !get(5) &&
    get(6) &&
    !get(7) &&
    !get(8) &&
    !get(9) &&
    !get(10)
  ) || (
    !get(0) &&
    !get(1) &&
    !get(2) &&
    !get(3) &&
    get(4) &&
    !get(5) &&
    get(6) &&
    get(7) &&
    get(8) &&
    !get(9) &&
    get(10)
  );
}

function countBalancePenalty(modules: readonly (readonly boolean[])[]): number {
  let dark = 0;

  for (const row of modules) {
    for (const module of row) {
      if (module) {
        dark++;
      }
    }
  }

  const total = modules.length * modules.length;
  const fivePercentSteps = Math.floor(Math.abs(dark * 20 - total * 10) / total);
  return fivePercentSteps * PENALTY_N4;
}

import { drawFormatBits } from "./function-patterns.js";
import { applyMask, type MatrixState } from "./matrix.js";
import { getPenaltyScore } from "./mask-scoring.js";

/**
 * Applies all eight mask patterns and returns the one with the lowest penalty score.
 */
export function findBestMask(state: MatrixState): number {
  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    const penalty = scoreMask(state, mask);
    if (penalty < bestPenalty) {
      bestMask = mask;
      bestPenalty = penalty;
    }
  }

  return bestMask;
}

function scoreMask(state: MatrixState, mask: number): number {
  applyMask(state, mask);
  drawFormatBits(state, mask);

  const penalty = getPenaltyScore(state.modules);

  applyMask(state, mask);
  return penalty;
}

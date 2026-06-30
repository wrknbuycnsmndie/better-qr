import { describe, expect, test } from "vitest";
import {
  countBalancePenalty,
  countBlockPenalty,
  countFinderLikePatternPenalty,
  countRunPenalty,
  getPenaltyScore
} from "../src/mask-scoring.ts";

describe("pure mask penalty scoring", () => {
  test("penalizes runs of five or more same-color modules", () => {
    expect(countRunPenalty([[true, true, true, true]])).toBe(0);
    expect(countRunPenalty([[true, true, true, true, true]])).toBe(3);
    expect(countRunPenalty([[true, true, true, true, true, true]])).toBe(4);
  });

  test("penalizes 2x2 same-color blocks", () => {
    expect(countBlockPenalty([
      [true, true],
      [true, true]
    ])).toBe(3);

    expect(countBlockPenalty([
      [true, false],
      [false, true]
    ])).toBe(0);
  });

  test("penalizes finder-like patterns horizontally and vertically", () => {
    const pattern = [true, false, true, true, true, false, true, false, false, false, false];
    const finderLikeRow = Array.from({ length: 11 }, (_, row) => row === 0 ? pattern : Array.from({ length: 11 }, () => false));
    const finderLikeColumn = Array.from({ length: 11 }, (_, row) =>
      Array.from({ length: 11 }, (_, column) => column === 0 ? pattern[row] : false)
    );

    expect(countFinderLikePatternPenalty(finderLikeRow)).toBe(40);
    expect(countFinderLikePatternPenalty(finderLikeColumn)).toBe(40);
  });

  test("penalizes dark/light imbalance", () => {
    expect(countBalancePenalty([
      [true, false],
      [true, false]
    ])).toBe(0);

    expect(countBalancePenalty([
      [true, true],
      [true, true]
    ])).toBe(100);
  });

  test("combines all penalty rules without mutating input", () => {
    const modules = [
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, false, false, false, false],
      [false, true, false, true, false],
      [false, true, false, true, false]
    ];
    const before = modules.map((row) => row.slice());

    expect(getPenaltyScore(modules)).toBeGreaterThan(0);
    expect(modules).toEqual(before);
  });
});

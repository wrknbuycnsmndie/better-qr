import { describe, expect, test } from "vitest";

import { drawFunctionPatterns } from "../src/function-patterns.ts";
import { createQrCode } from "../src/index.ts";
import { findBestMask } from "../src/mask.ts";
import { applyMask, createMatrixState } from "../src/matrix.ts";

describe("masking", () => {
  test("applies masks only to data modules", () => {
    const state = createMatrixState(1, "M");
    drawFunctionPatterns(state);

    const functionBefore = state.modules[0][0];
    const dataBefore = state.modules[20][20];

    applyMask(state, 0);

    expect(state.modules[0][0]).toBe(functionBefore);
    expect(state.modules[20][20]).toBe(!dataBefore);
  });

  test("applying the same mask twice restores data modules", () => {
    const state = createMatrixState(1, "M");
    drawFunctionPatterns(state);
    state.modules[20][20] = true;

    applyMask(state, 0);
    applyMask(state, 0);

    expect(state.modules[20][20]).toBe(true);
  });

  test("auto mask selection is stable for known fixtures", () => {
    expect(createQrCode("HELLO WORLD", { errorCorrectionLevel: "M" }).maskPattern).toBe(0);
    expect(createQrCode("https://example.com", { errorCorrectionLevel: "M" }).maskPattern).toBe(2);
  });

  test("findBestMask leaves data modules unmasked after scoring", () => {
    const state = createMatrixState(1, "M");
    drawFunctionPatterns(state);
    state.modules[20][20] = true;

    const before = state.modules[20][20];
    const mask = findBestMask(state);

    expect(mask).toBeGreaterThanOrEqual(0);
    expect(mask).toBeLessThanOrEqual(7);
    expect(state.modules[20][20]).toBe(before);
  });
});

import { describe, expect, test } from "vitest";

import { drawFunctionPatterns } from "../src/function-patterns.ts";
import { createQrCode } from "../src/index.ts";
import { createMatrixState, toQrCode } from "../src/matrix.ts";

describe("QR matrix", () => {
  test("sizes the matrix from the QR version", () => {
    expect(createMatrixState(1, "M").size).toBe(21);
    expect(createMatrixState(7, "M").size).toBe(45);
    expect(createMatrixState(40, "M").size).toBe(177);
  });

  test("draws finder and timing function patterns", () => {
    const state = createMatrixState(1, "M");
    drawFunctionPatterns(state);

    expect(state.modules[0][0]).toBe(true);
    expect(state.modules[3][3]).toBe(true);
    expect(state.modules[6][8]).toBe(true);
    expect(state.modules[8][6]).toBe(true);
    expect(state.isFunction[0][0]).toBe(true);
    expect(state.isFunction[6][8]).toBe(true);
  });

  test("draws alignment patterns for version 2 and version bits for version 7", () => {
    const version2 = createMatrixState(2, "M");
    drawFunctionPatterns(version2);
    expect(version2.isFunction[18][18]).toBe(true);

    const version7 = createMatrixState(7, "M");
    drawFunctionPatterns(version7);
    expect(version7.isFunction[0][34]).toBe(true);
    expect(version7.isFunction[34][0]).toBe(true);
  });

  test("freezes a public QR code with coordinate validation", () => {
    const state = createMatrixState(1, "M");
    state.modules[0][0] = true;
    const qr = toQrCode(state, 3);
    state.modules[0][0] = false;

    expect(qr.maskPattern).toBe(3);
    expect(qr.isDark(0, 0)).toBe(true);
    expect(() => qr.isDark(-1, 0)).toThrow(/coordinates/);
    expect(() => qr.isDark(0, 21)).toThrow(/coordinates/);
    expect(() => qr.isDark(0.5, 0)).toThrow(/coordinates/);
  });

  test("fixed mask pattern is preserved on generated QR codes", () => {
    const qr = createQrCode("HELLO WORLD", {
      version: 1,
      errorCorrectionLevel: "M",
      maskPattern: 4,
    });

    expect(qr.maskPattern).toBe(4);
    expect(qr.size).toBe(21);
  });
});

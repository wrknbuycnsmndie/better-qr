import { describe, expect, test } from "vitest";

import {
  canFitDataBits,
  getAlphanumericValue,
  getDataCapacityBits,
  getErrorCorrectionBlockLayout,
  getErrorCorrectionFormatBits,
  getNumDataCodewords,
  getNumRawDataModules,
  isAlphanumericChar,
} from "../src/tables.ts";

describe("QR spec tables", () => {
  test("answers format bits without exposing raw tables", () => {
    expect(getErrorCorrectionFormatBits("L")).toBe(1);
    expect(getErrorCorrectionFormatBits("M")).toBe(0);
    expect(getErrorCorrectionFormatBits("Q")).toBe(3);
    expect(getErrorCorrectionFormatBits("H")).toBe(2);
  });

  test("answers alphanumeric character values", () => {
    expect(isAlphanumericChar("A")).toBe(true);
    expect(isAlphanumericChar(" ")).toBe(true);
    expect(isAlphanumericChar(":")).toBe(true);
    expect(isAlphanumericChar("a")).toBe(false);
    expect(getAlphanumericValue("A")).toBe(10);
    expect(getAlphanumericValue(":")).toBe(44);
    expect(getAlphanumericValue("a")).toBe(-1);
  });

  test("answers capacity from one source of truth", () => {
    expect(getNumRawDataModules(1)).toBe(208);
    expect(getNumDataCodewords(1, "M")).toBe(16);
    expect(getDataCapacityBits(1, "M")).toBe(128);
    expect(canFitDataBits(128, 1, "M")).toBe(true);
    expect(canFitDataBits(129, 1, "M")).toBe(false);
  });

  test("answers Reed-Solomon block layout for interleaving", () => {
    expect(getErrorCorrectionBlockLayout(1, "M")).toEqual({
      rawCodewords: 26,
      numBlocks: 1,
      blockEccLength: 10,
      numShortBlocks: 1,
      shortDataBlockLength: 16,
    });

    expect(getErrorCorrectionBlockLayout(5, "Q")).toEqual({
      rawCodewords: 134,
      numBlocks: 4,
      blockEccLength: 18,
      numShortBlocks: 2,
      shortDataBlockLength: 15,
    });
  });

  test("rejects invalid table lookups", () => {
    expect(() => getErrorCorrectionBlockLayout(41, "M")).toThrow(/Invalid QR version/);
  });
});

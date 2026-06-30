import { describe, expect, test } from "vitest";
import {
  reedSolomonComputeDivisor,
  reedSolomonComputeRemainder,
  reedSolomonMultiply
} from "../src/reed-solomon.ts";

describe("Reed-Solomon error correction", () => {
  test("computes known QR generator divisor coefficients", () => {
    expect(reedSolomonComputeDivisor(7)).toEqual([127, 122, 154, 164, 11, 68, 117]);
  });

  test("computes a stable remainder for a data block", () => {
    const divisor = reedSolomonComputeDivisor(10);

    expect(reedSolomonComputeRemainder([32, 91, 11, 120, 209, 114, 220], divisor)).toEqual([
      250, 65, 36, 91, 41, 102, 76, 98, 187, 105
    ]);
  });

  test("multiplies bytes in the QR finite field", () => {
    expect(reedSolomonMultiply(0x53, 0xca)).toBe(0x8f);
    expect(reedSolomonMultiply(0, 0xca)).toBe(0);
    expect(reedSolomonMultiply(0x53, 0)).toBe(0);
  });

  test("rejects invalid polynomial parameters", () => {
    expect(() => reedSolomonComputeDivisor(0)).toThrow(/degree/);
    expect(() => reedSolomonComputeDivisor(256)).toThrow(/degree/);
    expect(() => reedSolomonMultiply(256, 1)).toThrow(/operands/);
    expect(() => reedSolomonMultiply(1, 256)).toThrow(/operands/);
  });
});

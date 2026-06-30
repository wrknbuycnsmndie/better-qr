import { describe, expect, test } from "vitest";
import { addErrorCorrectionAndInterleave, createDataCodewords } from "../src/codewords.ts";
import { getTotalBits, makeSegment } from "../src/segments.ts";
import { getNumDataCodewords, getNumRawDataModules } from "../src/tables.ts";

describe("QR codewords", () => {
  test("creates data codewords with terminator, byte alignment, and alternating pad bytes", () => {
    const segment = makeSegment("HELLO WORLD");
    const dataUsedBits = getTotalBits(segment, 1);
    const data = createDataCodewords(segment, 1, "M", dataUsedBits);

    expect(data).toHaveLength(getNumDataCodewords(1, "M"));
    expect(data.slice(0, 8)).toEqual([32, 91, 11, 120, 209, 114, 220, 77]);
    expect(data.slice(-4)).toEqual([0xec, 0x11, 0xec, 0x11]);
  });

  test("adds error correction and interleaves version 1 data", () => {
    const segment = makeSegment("HELLO WORLD");
    const data = createDataCodewords(segment, 1, "M", getTotalBits(segment, 1));
    const allCodewords = addErrorCorrectionAndInterleave(data, 1, "M");

    expect(allCodewords).toHaveLength(Math.floor(getNumRawDataModules(1) / 8));
    expect(allCodewords.slice(0, data.length)).toEqual(data);
    expect(allCodewords.slice(data.length)).toHaveLength(10);
  });

  test("interleaves multi-block symbols to the raw codeword length", () => {
    const version = 5;
    const errorCorrectionLevel = "Q";
    const dataLength = getNumDataCodewords(version, errorCorrectionLevel);
    const data = Array.from({ length: dataLength }, (_, index) => index & 0xff);

    const allCodewords = addErrorCorrectionAndInterleave(data, version, errorCorrectionLevel);

    expect(allCodewords).toHaveLength(Math.floor(getNumRawDataModules(version) / 8));
    expect(allCodewords.slice(0, 12)).not.toEqual(data.slice(0, 12));
  });

  test("rejects inconsistent data bit lengths", () => {
    const segment = makeSegment("HELLO");

    expect(() => createDataCodewords(segment, 1, "M", 1)).toThrow(/bit length/);
  });
});

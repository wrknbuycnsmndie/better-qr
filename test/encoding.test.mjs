import { describe, expect, test } from "vitest";

import { createBitBuffer } from "../src/bit-buffer.ts";
import { appendSegment, getTotalBits, makeSegment } from "../src/segments.ts";

describe("encoding", () => {
  test("auto mode chooses numeric, alphanumeric, or byte", () => {
    expect(makeSegment("012345").mode).toBe("numeric");
    expect(makeSegment("HELLO WORLD").mode).toBe("alphanumeric");
    expect(makeSegment("hello world").mode).toBe("byte");
  });

  test("explicit modes reject incompatible input", () => {
    expect(() => makeSegment("12A", "numeric")).toThrow(/Numeric QR mode/);
    expect(() => makeSegment("hello", "alphanumeric")).toThrow(/Alphanumeric QR mode/);
    expect(() => makeSegment(new Uint8Array([1, 2, 3]), "numeric")).toThrow(/Uint8Array input/);
  });

  test("byte segments defensively copy Uint8Array input", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const segment = makeSegment(bytes, "byte");
    bytes[0] = 9;

    const buffer = createBitBuffer();
    appendSegment(buffer, segment, 1);

    expect(buffer.toCodewords()).toEqual([0x40, 0x30, 0x10, 0x20, 0x30]);
  });

  test("total bits include mode and character count fields", () => {
    expect(getTotalBits(makeSegment("01234567"), 1)).toBe(41);
    expect(getTotalBits(makeSegment("HELLO"), 1)).toBe(41);
    expect(getTotalBits(makeSegment("é"), 1)).toBe(28);
  });

  test("bit buffer packs bits into codewords and validates bounds", () => {
    const buffer = createBitBuffer();
    buffer.append(0b101, 3);
    buffer.append(0b11110000, 8);

    expect(buffer.length).toBe(11);
    expect(buffer.toCodewords()).toEqual([0xbe, 0x00]);
    expect(() => buffer.append(4, 2)).toThrow(/does not fit/);
    expect(() => buffer.append(0, -1)).toThrow(/does not fit/);
  });
});

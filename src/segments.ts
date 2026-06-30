import type { BitBuffer } from "./bit-buffer.js";
import { getAlphanumericValue, isAlphanumericChar } from "./tables.js";
import type { EncodingMode, ResolvedMode } from "./types.js";

const MODE_INDICATORS: Record<ResolvedMode, number> = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100
};

const CHARACTER_COUNT_BITS: Record<ResolvedMode, readonly [number, number, number]> = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16]
};

const textEncoder = new TextEncoder();

/**
 * One contiguous QR segment. This implementation intentionally keeps v1 simple:
 * it creates one segment per input instead of doing mixed-mode optimization.
 */
export interface Segment {
  readonly mode: ResolvedMode;
  readonly characterCount: number;
  readonly dataBitLength: number;
  appendData(buffer: BitBuffer): void;
}

export function makeSegment(input: string | Uint8Array, requestedMode: EncodingMode = "auto"): Segment {
  if (input instanceof Uint8Array) {
    if (requestedMode !== "auto" && requestedMode !== "byte") {
      throw new TypeError("Uint8Array input can only be encoded in byte mode");
    }
    return makeByteSegment(input);
  }

  const mode = requestedMode === "auto" ? pickTextMode(input) : requestedMode;
  if (mode === "numeric") {
    return makeNumericSegment(input);
  }
  if (mode === "alphanumeric") {
    return makeAlphanumericSegment(input);
  }
  return makeByteSegment(textEncoder.encode(input));
}

export function getTotalBits(segment: Segment, version: number): number | undefined {
  const countBits = getCharacterCountBits(segment.mode, version);
  if (segment.characterCount >= 1 << countBits) {
    return undefined;
  }
  return 4 + countBits + segment.dataBitLength;
}

export function appendSegment(buffer: BitBuffer, segment: Segment, version: number): void {
  buffer.append(MODE_INDICATORS[segment.mode], 4);
  buffer.append(segment.characterCount, getCharacterCountBits(segment.mode, version));
  segment.appendData(buffer);
}

function pickTextMode(input: string): ResolvedMode {
  // Numeric and alphanumeric modes pack more characters into fewer bits than byte mode.
  if (/^[0-9]*$/.test(input)) {
    return "numeric";
  }
  if ([...input].every(isAlphanumericChar)) {
    return "alphanumeric";
  }
  return "byte";
}

function makeNumericSegment(input: string): Segment {
  if (!/^[0-9]*$/.test(input)) {
    throw new TypeError("Numeric QR mode only accepts digits 0-9");
  }

  return {
    mode: "numeric",
    characterCount: input.length,
    // Numeric mode stores groups of 3, 2, and 1 digits in 10, 7, and 4 bits.
    dataBitLength: Math.floor(input.length / 3) * 10 + (input.length % 3 === 1 ? 4 : input.length % 3 === 2 ? 7 : 0),
    appendData(buffer) {
      for (let i = 0; i < input.length; i += 3) {
        const chunk = input.slice(i, i + 3);
        buffer.append(Number.parseInt(chunk, 10), chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4);
      }
    }
  };
}

function makeAlphanumericSegment(input: string): Segment {
  const indexes = [...input].map(getAlphanumericValue);
  if (indexes.some((index) => index < 0)) {
    throw new TypeError("Alphanumeric QR mode only accepts digits, uppercase letters, space, and $%*+-./:");
  }

  return {
    mode: "alphanumeric",
    characterCount: indexes.length,
    // Alphanumeric mode stores pairs as a base-45 value, with a 6-bit tail.
    dataBitLength: Math.floor(indexes.length / 2) * 11 + (indexes.length % 2) * 6,
    appendData(buffer) {
      for (let i = 0; i < indexes.length; i += 2) {
        const first = indexes[i];
        const second = indexes[i + 1];
        if (first === undefined) {
          throw new Error("Invalid alphanumeric index");
        }
        if (second === undefined) {
          buffer.append(first, 6);
        } else {
          buffer.append(first * 45 + second, 11);
        }
      }
    }
  };
}

function makeByteSegment(bytes: Uint8Array): Segment {
  const data = new Uint8Array(bytes);

  return {
    mode: "byte",
    characterCount: data.length,
    dataBitLength: data.length * 8,
    appendData(buffer) {
      for (const byte of data) {
        buffer.append(byte, 8);
      }
    }
  };
}

function getCharacterCountBits(mode: ResolvedMode, version: number): number {
  const groupIndex = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  return CHARACTER_COUNT_BITS[mode][groupIndex];
}

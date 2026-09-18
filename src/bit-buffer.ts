export interface BitBuffer {
  readonly length: number;
  append(value: number, bitLength: number): void;
  toCodewords(): number[];
}

/**
 * Creates a mutable bit writer that packs appended bits into QR codewords.
 */
export function createBitBuffer(): BitBuffer {
  const bits: number[] = [];

  return {
    get length(): number {
      return bits.length;
    },

    append(value: number, bitLength: number): void {
      if (bitLength < 0 || bitLength > 31 || value >>> bitLength !== 0) {
        throw new RangeError(`Value ${value} does not fit in ${bitLength} bits`);
      }

      for (let i = bitLength - 1; i >= 0; i--) {
        bits.push((value >>> i) & 1);
      }
    },

    toCodewords(): number[] {
      const result: number[] = [];
      for (let i = 0; i < bits.length; i += 8) {
        let value = 0;
        for (let j = 0; j < 8; j++) {
          value = (value << 1) | (bits[i + j] ?? 0);
        }
        result.push(value);
      }
      return result;
    },
  };
}

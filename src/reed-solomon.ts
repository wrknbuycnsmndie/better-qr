/**
 * Builds the Reed-Solomon generator polynomial coefficients used by QR Code.
 */
export function reedSolomonComputeDivisor(degree: number): number[] {
  if (degree < 1 || degree > 255) {
    throw new RangeError("Reed-Solomon degree must be between 1 and 255");
  }

  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = reedSolomonMultiply(root, 0x02);
  }

  return result;
}

export function reedSolomonComputeRemainder(
  data: readonly number[],
  divisor: readonly number[],
): number[] {
  const result = new Array<number>(divisor.length).fill(0);

  for (const byte of data) {
    const head = result.shift();
    if (head === undefined) {
      throw new Error("Invalid Reed-Solomon divisor");
    }
    const factor = byte ^ head;
    result.push(0);

    for (let i = 0; i < divisor.length; i++) {
      result[i] = (result[i] ?? 0) ^ reedSolomonMultiply(divisor[i] ?? 0, factor);
    }
  }

  return result;
}

export function reedSolomonMultiply(x: number, y: number): number {
  if (x >>> 8 !== 0 || y >>> 8 !== 0) {
    throw new RangeError("Reed-Solomon operands must be bytes");
  }

  let result = 0;
  for (let i = 7; i >= 0; i--) {
    // GF(2^8) multiplication modulo x^8 + x^4 + x^3 + x^2 + 1 (0x11d).
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> i) & 1) * x;
  }
  return result & 0xff;
}

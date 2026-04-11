import type { ErrorCorrectionLevel, QrCode } from "./types.js";

/**
 * Mutable QR matrix plus a parallel map of modules reserved for function patterns.
 */
export interface MatrixState {
  readonly version: number;
  readonly size: number;
  readonly errorCorrectionLevel: ErrorCorrectionLevel;
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];
}

/**
 * Creates the mutable matrix used while building a QR symbol.
 */
export function createMatrixState(version: number, errorCorrectionLevel: ErrorCorrectionLevel): MatrixState {
  const size = version * 4 + 17;
  return {
    version,
    size,
    errorCorrectionLevel,
    modules: createMatrix(size, false),
    isFunction: createMatrix(size, false)
  };
}

export function setFunctionModule(state: MatrixState, x: number, y: number, isDark: boolean): void {
  state.modules[y][x] = isDark;
  state.isFunction[y][x] = true;
}

/**
 * Places interleaved data/ecc codewords into non-function modules.
 */
export function drawCodewords(state: MatrixState, data: readonly number[]): void {
  let bitIndex = 0;

  // Data bits move upward/downward through two-column stripes from the lower right.
  for (let right = state.size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }

    for (let vertical = 0; vertical < state.size; vertical++) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? state.size - 1 - vertical : vertical;
      drawCodewordColumnPair(state, data, right, y, bitIndex);
      bitIndex += countWritableModulesInPair(state, right, y);
    }
  }
}

/**
 * Toggles non-function modules according to a QR mask pattern.
 */
export function applyMask(state: MatrixState, mask: number): void {
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      if (!state.isFunction[y][x] && getMaskBit(mask, x, y)) {
        state.modules[y][x] = !state.modules[y][x];
      }
    }
  }
}

/**
 * Freezes the mutable matrix into the public immutable QR code shape.
 */
export function toQrCode(state: MatrixState, maskPattern: number): QrCode {
  const modules = state.modules.map((row) => row.slice());
  const size = state.size;

  return {
    version: state.version,
    size,
    errorCorrectionLevel: state.errorCorrectionLevel,
    maskPattern,
    modules,
    isDark(row: number, column: number): boolean {
      if (row < 0 || row >= size || column < 0 || column >= size || !Number.isInteger(row) || !Number.isInteger(column)) {
        throw new RangeError("QR module coordinates are out of range");
      }
      return modules[row][column];
    }
  };
}

function drawCodewordColumnPair(
  state: MatrixState,
  data: readonly number[],
  right: number,
  y: number,
  startBitIndex: number
): void {
  let bitIndex = startBitIndex;

  for (let j = 0; j < 2; j++) {
    const x = right - j;
    if (!state.isFunction[y][x]) {
      const byte = data[bitIndex >>> 3];
      state.modules[y][x] = byte === undefined ? false : (((byte >>> (7 - (bitIndex & 7))) & 1) !== 0);
      bitIndex++;
    }
  }
}

function countWritableModulesInPair(state: MatrixState, right: number, y: number): number {
  let result = 0;
  for (let j = 0; j < 2; j++) {
    if (!state.isFunction[y][right - j]) {
      result++;
    }
  }
  return result;
}

function createMatrix(size: number, value: boolean): boolean[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => value));
}

function getMaskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      throw new RangeError("mask must be an integer from 0 to 7");
  }
}

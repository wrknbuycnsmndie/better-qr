import { ECC_FORMAT_BITS } from "./tables.js";
import { setFunctionModule, type MatrixState } from "./matrix.js";

/**
 * Draws all reserved QR function modules before data placement.
 */
export function drawFunctionPatterns(state: MatrixState): void {
  drawFinderPattern(state, 3, 3);
  drawFinderPattern(state, state.size - 4, 3);
  drawFinderPattern(state, 3, state.size - 4);
  drawTimingPatterns(state);
  drawAlignmentPatterns(state);
  drawFormatBits(state, 0);
  drawVersionBits(state);
}

/**
 * Draws error-correction and mask metadata into the QR format information areas.
 */
export function drawFormatBits(state: MatrixState, mask: number): void {
  const data = (ECC_FORMAT_BITS[state.errorCorrectionLevel] << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }
  const bits = ((data << 10) | remainder) ^ 0x5412;

  for (let i = 0; i <= 5; i++) {
    setFunctionModule(state, 8, i, getBit(bits, i));
  }
  setFunctionModule(state, 8, 7, getBit(bits, 6));
  setFunctionModule(state, 8, 8, getBit(bits, 7));
  setFunctionModule(state, 7, 8, getBit(bits, 8));

  for (let i = 9; i < 15; i++) {
    setFunctionModule(state, 14 - i, 8, getBit(bits, i));
  }
  for (let i = 0; i < 8; i++) {
    setFunctionModule(state, state.size - 1 - i, 8, getBit(bits, i));
  }
  for (let i = 8; i < 15; i++) {
    setFunctionModule(state, 8, state.size - 15 + i, getBit(bits, i));
  }

  setFunctionModule(state, 8, state.size - 8, true);
}

function drawFinderPattern(state: MatrixState, centerX: number, centerY: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x >= 0 && x < state.size && y >= 0 && y < state.size) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(state, x, y, distance !== 2 && distance !== 4);
      }
    }
  }
}

function drawTimingPatterns(state: MatrixState): void {
  for (let i = 8; i < state.size - 8; i++) {
    setFunctionModule(state, 6, i, i % 2 === 0);
    setFunctionModule(state, i, 6, i % 2 === 0);
  }
}

function drawAlignmentPatterns(state: MatrixState): void {
  const alignments = getAlignmentPatternPositions(state.version);
  for (const y of alignments) {
    for (const x of alignments) {
      if (!state.isFunction[y][x]) {
        drawAlignmentPattern(state, x, y);
      }
    }
  }
}

function drawAlignmentPattern(state: MatrixState, centerX: number, centerY: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunctionModule(state, centerX + dx, centerY + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawVersionBits(state: MatrixState): void {
  if (state.version < 7) {
    return;
  }

  let remainder = state.version;
  for (let i = 0; i < 12; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }
  const bits = (state.version << 12) | remainder;

  for (let i = 0; i < 18; i++) {
    const bit = getBit(bits, i);
    const a = state.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunctionModule(state, a, b, bit);
    setFunctionModule(state, b, a, bit);
  }
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }

  const size = version * 4 + 17;
  const count = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const result = [6];

  for (let position = size - 7; result.length < count; position -= step) {
    result.splice(1, 0, position);
  }

  return result;
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

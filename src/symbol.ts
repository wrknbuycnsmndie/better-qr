import { drawFormatBits, drawFunctionPatterns } from "./function-patterns.js";
import { findBestMask } from "./mask.js";
import { applyMask, createMatrixState, drawCodewords, toQrCode } from "./matrix.js";
import type { ErrorCorrectionLevel, QrCode } from "./types.js";

/**
 * Builds and freezes a QR symbol from the final interleaved codeword stream.
 *
 * This module owns the mutable symbol layout sequence: function patterns,
 * reserved modules, data placement, mask selection/application, format bits,
 * and conversion to the public immutable `QrCode` shape.
 */
export function createQrSymbol(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  codewords: readonly number[],
  requestedMaskPattern?: number
): QrCode {
  const matrix = createMatrixState(version, errorCorrectionLevel);

  drawFunctionPatterns(matrix);
  drawCodewords(matrix, codewords);

  const selectedMask = requestedMaskPattern ?? findBestMask(matrix);
  applyMask(matrix, selectedMask);
  drawFormatBits(matrix, selectedMask);

  return toQrCode(matrix, selectedMask);
}

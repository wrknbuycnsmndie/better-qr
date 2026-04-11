import type { ErrorCorrectionLevel } from "./types.js";

export const MIN_VERSION = 1;
export const MAX_VERSION = 40;

export function validateVersion(version: number): void {
  if (!Number.isInteger(version) || version < MIN_VERSION || version > MAX_VERSION) {
    throw new RangeError("QR version must be an integer from 1 to 40");
  }
}

export function validateMaskPattern(maskPattern: number): void {
  if (!Number.isInteger(maskPattern) || maskPattern < 0 || maskPattern > 7) {
    throw new RangeError("maskPattern must be an integer from 0 to 7");
  }
}

export function validateErrorCorrectionLevel(level: string): asserts level is ErrorCorrectionLevel {
  if (level !== "L" && level !== "M" && level !== "Q" && level !== "H") {
    throw new RangeError("errorCorrectionLevel must be L, M, Q, or H");
  }
}

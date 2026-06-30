import { addErrorCorrectionAndInterleave, createDataCodewords } from "./codewords.js";
import { drawFunctionPatterns, drawFormatBits } from "./function-patterns.js";
import { findBestMask } from "./mask.js";
import { applyMask, createMatrixState, drawCodewords, toQrCode } from "./matrix.js";
import { getTotalBits, makeSegment, type Segment } from "./segments.js";
import { canFitDataBits } from "./tables.js";
import type { ErrorCorrectionLevel, QrCode, QrOptions } from "./types.js";
import {
  MAX_VERSION,
  MIN_VERSION,
  validateErrorCorrectionLevel,
  validateMaskPattern,
  validateVersion
} from "./validation.js";

/**
 * Generates a QR Code Model 2 matrix from a string or byte payload.
 */
export function createQrCode(input: string | Uint8Array, options: QrOptions = {}): QrCode {
  const errorCorrectionLevel = resolveErrorCorrectionLevel(options);
  const { minVersion, maxVersion } = resolveVersionRange(options);
  const maskPattern = resolveMaskPattern(options);
  const segment = makeSegment(input, options.mode ?? "auto");
  const { version, dataUsedBits } = chooseVersion(segment, minVersion, maxVersion, errorCorrectionLevel);
  const dataCodewords = createDataCodewords(segment, version, errorCorrectionLevel, dataUsedBits);
  const allCodewords = addErrorCorrectionAndInterleave(dataCodewords, version, errorCorrectionLevel);
  const matrix = createMatrixState(version, errorCorrectionLevel);

  drawFunctionPatterns(matrix);
  drawCodewords(matrix, allCodewords);

  const selectedMask = maskPattern ?? findBestMask(matrix);
  applyMask(matrix, selectedMask);
  drawFormatBits(matrix, selectedMask);

  return toQrCode(matrix, selectedMask);
}

interface VersionRange {
  readonly minVersion: number;
  readonly maxVersion: number;
}

interface VersionChoice {
  readonly version: number;
  readonly dataUsedBits: number;
}

function resolveErrorCorrectionLevel(options: QrOptions): ErrorCorrectionLevel {
  const errorCorrectionLevel = options.errorCorrectionLevel ?? "M";
  validateErrorCorrectionLevel(errorCorrectionLevel);
  return errorCorrectionLevel;
}

function resolveVersionRange(options: QrOptions): VersionRange {
  const minVersion = options.version ?? options.minVersion ?? MIN_VERSION;
  const maxVersion = options.version ?? options.maxVersion ?? MAX_VERSION;

  validateVersion(minVersion);
  validateVersion(maxVersion);
  if (minVersion > maxVersion) {
    throw new RangeError("minVersion must be less than or equal to maxVersion");
  }

  return { minVersion, maxVersion };
}

function resolveMaskPattern(options: QrOptions): number | undefined {
  if (options.maskPattern === undefined) {
    return undefined;
  }

  validateMaskPattern(options.maskPattern);
  return options.maskPattern;
}

function chooseVersion(
  segment: Segment,
  minVersion: number,
  maxVersion: number,
  errorCorrectionLevel: ErrorCorrectionLevel
): VersionChoice {
  for (let version = minVersion; version <= maxVersion; version++) {
    const dataUsedBits = getTotalBits(segment, version);
    if (dataUsedBits !== undefined && canFitDataBits(dataUsedBits, version, errorCorrectionLevel)) {
      return { version, dataUsedBits };
    }
  }

  throw new RangeError(`Input data does not fit in QR versions ${minVersion}-${maxVersion} with error correction ${errorCorrectionLevel}`);
}

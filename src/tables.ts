import type { ErrorCorrectionLevel } from "./types.js";

const ECC_FORMAT_BITS: Record<ErrorCorrectionLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};

const ECC_CODEWORDS_PER_BLOCK: Record<ErrorCorrectionLevel, readonly number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
};

const NUM_ERROR_CORRECTION_BLOCKS: Record<ErrorCorrectionLevel, readonly number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
};

const ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

export interface ErrorCorrectionBlockLayout {
  readonly rawCodewords: number;
  readonly numBlocks: number;
  readonly blockEccLength: number;
  readonly numShortBlocks: number;
  readonly shortDataBlockLength: number;
}

export function getErrorCorrectionFormatBits(errorCorrectionLevel: ErrorCorrectionLevel): number {
  return ECC_FORMAT_BITS[errorCorrectionLevel];
}

export function getAlphanumericValue(char: string): number {
  return ALPHANUMERIC_CHARSET.indexOf(char);
}

export function isAlphanumericChar(char: string): boolean {
  return getAlphanumericValue(char) >= 0;
}

export function canFitDataBits(dataBits: number, version: number, errorCorrectionLevel: ErrorCorrectionLevel): boolean {
  return dataBits <= getDataCapacityBits(version, errorCorrectionLevel);
}

export function getDataCapacityBits(version: number, errorCorrectionLevel: ErrorCorrectionLevel): number {
  return getNumDataCodewords(version, errorCorrectionLevel) * 8;
}

export function getErrorCorrectionBlockLayout(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel
): ErrorCorrectionBlockLayout {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[errorCorrectionLevel][version];
  const blockEccLength = ECC_CODEWORDS_PER_BLOCK[errorCorrectionLevel][version];
  if (numBlocks === undefined || blockEccLength === undefined) {
    throw new RangeError(`Invalid QR version ${version}`);
  }

  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLength = Math.floor(rawCodewords / numBlocks);

  return {
    rawCodewords,
    numBlocks,
    blockEccLength,
    numShortBlocks,
    shortDataBlockLength: shortBlockLength - blockEccLength
  };
}

/**
 * Number of writable modules after subtracting function patterns, before byte rounding.
 */
export function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) {
      result -= 36;
    }
  }

  return result;
}

export function getNumDataCodewords(version: number, errorCorrectionLevel: ErrorCorrectionLevel): number {
  const { rawCodewords, blockEccLength, numBlocks } = getErrorCorrectionBlockLayout(version, errorCorrectionLevel);
  return rawCodewords - blockEccLength * numBlocks;
}

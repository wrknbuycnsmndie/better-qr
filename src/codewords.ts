import { createBitBuffer } from "./bit-buffer.js";
import { reedSolomonComputeDivisor, reedSolomonComputeRemainder } from "./reed-solomon.js";
import { appendSegment, type Segment } from "./segments.js";
import { getDataCapacityBits, getErrorCorrectionBlockLayout } from "./tables.js";
import type { ErrorCorrectionLevel } from "./types.js";

/**
 * Builds the data codeword stream before Reed-Solomon error correction.
 */
export function createDataCodewords(
  segment: Segment,
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  dataUsedBits: number,
): number[] {
  const dataCapacityBits = getDataCapacityBits(version, errorCorrectionLevel);
  const buffer = createBitBuffer();
  appendSegment(buffer, segment, version);

  if (buffer.length !== dataUsedBits) {
    throw new Error("Internal QR bit length mismatch");
  }

  // QR payloads end with a short terminator, byte alignment, then alternating pad bytes.
  buffer.append(0, Math.min(4, dataCapacityBits - buffer.length));
  buffer.append(0, (8 - (buffer.length % 8)) % 8);

  const codewords = buffer.toCodewords();
  for (let padByte = 0xec; codewords.length < dataCapacityBits / 8; padByte ^= 0xec ^ 0x11) {
    codewords.push(padByte);
  }

  return codewords;
}

/**
 * Splits data into QR blocks, appends Reed-Solomon parity, then interleaves them.
 */
export function addErrorCorrectionAndInterleave(
  data: readonly number[],
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
): number[] {
  const layout = getErrorCorrectionBlockLayout(version, errorCorrectionLevel);
  const rsDivisor = reedSolomonComputeDivisor(layout.blockEccLength);
  const blocks = createBlocks(
    data,
    layout.numBlocks,
    layout.numShortBlocks,
    layout.shortDataBlockLength,
    rsDivisor,
  );

  return interleaveBlocks(
    blocks,
    layout.rawCodewords,
    layout.shortDataBlockLength,
    layout.numShortBlocks,
  );
}

function createBlocks(
  data: readonly number[],
  numBlocks: number,
  numShortBlocks: number,
  shortDataBlockLength: number,
  rsDivisor: readonly number[],
): number[][] {
  const blocks: number[][] = [];
  let dataOffset = 0;

  // QR interleaves Reed-Solomon blocks column-wise; short blocks use a dummy byte
  // to make this loop shape match the spec tables without adding it to output.
  for (let i = 0; i < numBlocks; i++) {
    const dataBlockLength = shortDataBlockLength + (i < numShortBlocks ? 0 : 1);
    const dataBlock = Array.from(data.slice(dataOffset, dataOffset + dataBlockLength));
    dataOffset += dataBlockLength;

    const eccBlock = reedSolomonComputeRemainder(dataBlock, rsDivisor);
    const block = dataBlock.slice();
    if (i < numShortBlocks) {
      block.push(0);
    }
    block.push(...eccBlock);
    blocks.push(block);
  }

  return blocks;
}

function interleaveBlocks(
  blocks: readonly (readonly number[])[],
  rawCodewords: number,
  shortDataBlockLength: number,
  numShortBlocks: number,
): number[] {
  const result: number[] = [];
  const blockLength = blocks[0]?.length;
  if (blockLength === undefined) {
    throw new Error("QR data must contain at least one block");
  }

  for (let i = 0; i < blockLength; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortDataBlockLength || j >= numShortBlocks) {
        const value = blocks[j]?.[i];
        if (value !== undefined) {
          result.push(value);
        }
      }
    }
  }

  if (result.length !== rawCodewords) {
    throw new Error("Internal QR interleaving length mismatch");
  }

  return result;
}

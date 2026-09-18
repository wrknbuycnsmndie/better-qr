export type {
  CenterIconOptions,
  EncodingMode,
  ErrorCorrectionLevel,
  QrCode,
  QrOptions,
  SvgRenderOptions,
  ToSvgOptions,
} from "./types.js";
export { createQrCode } from "./qr-code.js";
export { renderSvg } from "./svg.js";

import { createQrSvgRenderModel } from "./render-model.js";
import { serializeSvgRenderModel } from "./svg.js";
import type { ToSvgOptions } from "./types.js";

/** Convenience helper that creates a QR matrix and renders it as SVG. */
export function toSvg(input: string | Uint8Array, options: ToSvgOptions = {}): string {
  return serializeSvgRenderModel(createQrSvgRenderModel(input, options));
}

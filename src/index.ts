export type {
  CenterIconOptions,
  EncodingMode,
  ErrorCorrectionLevel,
  QrCode,
  QrOptions,
  SvgRenderOptions,
  ToSvgOptions
} from "./types.js";
export { createQrCode } from "./qr-code.js";
export { renderSvg } from "./svg.js";

import { createQrCode } from "./qr-code.js";
import { renderSvg } from "./svg.js";
import type { QrOptions, ToSvgOptions } from "./types.js";

/**
 * Convenience helper that creates a QR matrix and renders it as SVG.
 */
export function toSvg(input: string | Uint8Array, options: ToSvgOptions = {}): string {
  const qrOptions: QrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel ?? (options.icon === undefined ? "M" : "H")
  };
  if (options.version !== undefined) qrOptions.version = options.version;
  if (options.minVersion !== undefined) qrOptions.minVersion = options.minVersion;
  if (options.maxVersion !== undefined) qrOptions.maxVersion = options.maxVersion;
  if (options.maskPattern !== undefined) qrOptions.maskPattern = options.maskPattern;
  if (options.mode !== undefined) qrOptions.mode = options.mode;

  return renderSvg(createQrCode(input, qrOptions), options);
}

import { createQrCode } from "./qr-code.js";
import type { QrCode, QrOptions, SvgRenderOptions, ToSvgOptions } from "./types.js";

const DEFAULT_MODULE_SIZE = 4;
const DEFAULT_MARGIN = 4;
const DEFAULT_FOREGROUND = "#000";
const DEFAULT_BACKGROUND = "#fff";
const DEFAULT_ICON_SIZE_RATIO = 0.18;
const DEFAULT_ICON_PADDING_RATIO = 0.03;
const DEFAULT_ICON_BACKGROUND = "#fff";

export interface SvgRenderModel {
  readonly viewBox: string;
  readonly width: string;
  readonly height: string;
  readonly title?: string;
  readonly background: SvgBackgroundModel;
  readonly modules: SvgModulesModel;
  readonly icon?: SvgIconModel;
}

export interface SvgBackgroundModel {
  readonly fill: string;
}

export interface SvgModulesModel {
  readonly fill: string;
  readonly path: string;
}

export interface SvgIconModel {
  readonly patch: SvgIconPatchModel;
  readonly image: SvgIconImageModel;
}

export interface SvgIconPatchModel {
  readonly x: string;
  readonly y: string;
  readonly width: string;
  readonly height: string;
  readonly fill: string;
  readonly rx?: string;
  readonly ry?: string;
}

export interface SvgIconImageModel {
  readonly href: string;
  readonly x: string;
  readonly y: string;
  readonly width: string;
  readonly height: string;
  readonly preserveAspectRatio: "xMidYMid meet";
}

/**
 * Creates framework-neutral data for rendering a QR code as native SVG nodes.
 * Values are intentionally unescaped; framework bindings or `renderSvg()`
 * perform escaping at serialization time.
 */
export function createSvgRenderModel(qr: QrCode, options: SvgRenderOptions = {}): SvgRenderModel {
  const moduleSize = options.moduleSize ?? DEFAULT_MODULE_SIZE;
  const margin = options.margin ?? DEFAULT_MARGIN;
  const foreground = options.foreground ?? DEFAULT_FOREGROUND;
  const background = options.background ?? DEFAULT_BACKGROUND;

  validateDimensions(moduleSize, margin);

  const viewBoxSize = qr.size + margin * 2;
  const viewBoxDimension = formatNumber(viewBoxSize);
  const outputDimension = formatNumber(viewBoxSize * moduleSize);

  return {
    viewBox: `0 0 ${viewBoxDimension} ${viewBoxDimension}`,
    width: outputDimension,
    height: outputDimension,
    background: { fill: background },
    modules: {
      fill: foreground,
      path: makePathData(qr, margin),
    },
    ...(options.title !== undefined && { title: options.title }),
    ...(options.icon !== undefined && {
      icon: createIconModel(qr.size, margin, options.icon),
    }),
  };
}

/** Creates a QR code and its framework-neutral SVG render model. */
export function createQrSvgRenderModel(
  input: string | Uint8Array,
  options: ToSvgOptions = {},
): SvgRenderModel {
  const qrOptions: QrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel ?? (options.icon === undefined ? "M" : "H"),
  };
  if (options.version !== undefined) qrOptions.version = options.version;
  if (options.minVersion !== undefined) qrOptions.minVersion = options.minVersion;
  if (options.maxVersion !== undefined) qrOptions.maxVersion = options.maxVersion;
  if (options.maskPattern !== undefined) qrOptions.maskPattern = options.maskPattern;
  if (options.mode !== undefined) qrOptions.mode = options.mode;

  return createSvgRenderModel(createQrCode(input, qrOptions), options);
}

function validateDimensions(moduleSize: number, margin: number): void {
  if (!Number.isFinite(moduleSize) || moduleSize <= 0) {
    throw new RangeError("moduleSize must be a positive number");
  }
  if (!Number.isFinite(margin) || margin < 0) {
    throw new RangeError("margin must be a non-negative number");
  }
}

function makePathData(qr: QrCode, margin: number): string {
  const commands: string[] = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.modules[y]?.[x]) {
        commands.push(`M${formatNumber(x + margin)} ${formatNumber(y + margin)}h1v1h-1z`);
      }
    }
  }
  return commands.join("");
}

function createIconModel(
  size: number,
  margin: number,
  icon: NonNullable<SvgRenderOptions["icon"]>,
): SvgIconModel {
  const sizeRatio = icon.sizeRatio ?? DEFAULT_ICON_SIZE_RATIO;
  const paddingRatio = icon.paddingRatio ?? DEFAULT_ICON_PADDING_RATIO;
  const background = icon.background ?? DEFAULT_ICON_BACKGROUND;
  const radius = icon.radius ?? 0;

  if (!Number.isFinite(sizeRatio) || sizeRatio <= 0 || sizeRatio >= 0.5) {
    throw new RangeError("icon.sizeRatio must be greater than 0 and less than 0.5");
  }
  if (!Number.isFinite(paddingRatio) || paddingRatio < 0 || paddingRatio >= 0.25) {
    throw new RangeError("icon.paddingRatio must be greater than or equal to 0 and less than 0.25");
  }
  if (!Number.isFinite(radius) || radius < 0) {
    throw new RangeError("icon.radius must be a non-negative number");
  }

  const iconSize = size * sizeRatio;
  const padding = size * paddingRatio;
  const patchSize = iconSize + padding * 2;
  const center = margin + size / 2;
  const patchX = center - patchSize / 2;
  const imageX = center - iconSize / 2;
  const formattedRadius = radius > 0 ? formatNumber(radius) : undefined;

  return {
    patch: {
      x: formatNumber(patchX),
      y: formatNumber(patchX),
      width: formatNumber(patchSize),
      height: formatNumber(patchSize),
      fill: background,
      ...(formattedRadius === undefined ? {} : { rx: formattedRadius, ry: formattedRadius }),
    },
    image: {
      href: icon.href,
      x: formatNumber(imageX),
      y: formatNumber(imageX),
      width: formatNumber(iconSize),
      height: formatNumber(iconSize),
      preserveAspectRatio: "xMidYMid meet",
    },
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

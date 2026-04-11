import type { QrCode, SvgRenderOptions } from "./types.js";

const DEFAULT_MODULE_SIZE = 4;
const DEFAULT_MARGIN = 4;
const DEFAULT_FOREGROUND = "#000";
const DEFAULT_BACKGROUND = "#fff";
const DEFAULT_ICON_SIZE_RATIO = 0.18;
const DEFAULT_ICON_PADDING_RATIO = 0.03;
const DEFAULT_ICON_BACKGROUND = "#fff";

/**
 * Renders a QR matrix as a standalone SVG string.
 */
export function renderSvg(qr: QrCode, options: SvgRenderOptions = {}): string {
  const moduleSize = options.moduleSize ?? DEFAULT_MODULE_SIZE;
  const margin = options.margin ?? DEFAULT_MARGIN;
  const foreground = options.foreground ?? DEFAULT_FOREGROUND;
  const background = options.background ?? DEFAULT_BACKGROUND;

  if (!Number.isFinite(moduleSize) || moduleSize <= 0) {
    throw new RangeError("moduleSize must be a positive number");
  }
  if (!Number.isFinite(margin) || margin < 0) {
    throw new RangeError("margin must be a non-negative number");
  }

  const viewBoxSize = qr.size + margin * 2;
  const outputSize = viewBoxSize * moduleSize;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${formatNumber(viewBoxSize)} ${formatNumber(viewBoxSize)}" width="${formatNumber(outputSize)}" height="${formatNumber(outputSize)}" shape-rendering="crispEdges" role="img">`
  ];

  if (options.title !== undefined) {
    parts.push(`<title>${escapeText(options.title)}</title>`);
  }

  parts.push(`<rect width="100%" height="100%" fill="${escapeAttribute(background)}"/>`);
  // One path is much smaller than one rect per dark module and keeps the SVG easy to embed.
  parts.push(`<path fill="${escapeAttribute(foreground)}" d="${makePathData(qr, margin)}"/>`);

  if (options.icon !== undefined) {
    parts.push(renderIcon(qr.size, margin, options.icon));
  }

  parts.push("</svg>");
  return parts.join("");
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

function renderIcon(size: number, margin: number, icon: NonNullable<SvgRenderOptions["icon"]>): string {
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
  const iconX = center - iconSize / 2;
  const radiusAttribute = radius > 0 ? ` rx="${formatNumber(radius)}" ry="${formatNumber(radius)}"` : "";

  return [
    `<rect x="${formatNumber(patchX)}" y="${formatNumber(patchX)}" width="${formatNumber(patchSize)}" height="${formatNumber(patchSize)}" fill="${escapeAttribute(background)}"${radiusAttribute}/>`,
    `<image href="${escapeAttribute(icon.href)}" x="${formatNumber(iconX)}" y="${formatNumber(iconX)}" width="${formatNumber(iconSize)}" height="${formatNumber(iconSize)}" preserveAspectRatio="xMidYMid meet"/>`
  ].join("");
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

import { createSvgRenderModel, type SvgRenderModel } from "./render-model.js";
import type { QrCode, SvgRenderOptions } from "./types.js";

/** Renders a QR matrix as a standalone SVG string. */
export function renderSvg(qr: QrCode, options: SvgRenderOptions = {}): string {
  return serializeSvgRenderModel(createSvgRenderModel(qr, options));
}

/** @internal Serializes a render model for the string-based public API. */
export function serializeSvgRenderModel(model: SvgRenderModel): string {
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${model.viewBox}" width="${model.width}" height="${model.height}" shape-rendering="crispEdges" role="img">`,
  ];

  if (model.title !== undefined) {
    parts.push(`<title>${escapeText(model.title)}</title>`);
  }

  parts.push(`<rect width="100%" height="100%" fill="${escapeAttribute(model.background.fill)}"/>`);
  parts.push(`<path fill="${escapeAttribute(model.modules.fill)}" d="${model.modules.path}"/>`);

  if (model.icon !== undefined) {
    const { patch, image } = model.icon;
    const radiusAttributes = patch.rx === undefined ? "" : ` rx="${patch.rx}" ry="${patch.ry}"`;
    parts.push(
      `<rect x="${patch.x}" y="${patch.y}" width="${patch.width}" height="${patch.height}" fill="${escapeAttribute(patch.fill)}"${radiusAttributes}/>`,
    );
    parts.push(
      `<image href="${escapeAttribute(image.href)}" x="${image.x}" y="${image.y}" width="${image.width}" height="${image.height}" preserveAspectRatio="${image.preserveAspectRatio}"/>`,
    );
  }

  parts.push("</svg>");
  return parts.join("");
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

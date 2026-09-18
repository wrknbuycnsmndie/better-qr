export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type EncodingMode = "auto" | "numeric" | "alphanumeric" | "byte";

export interface QrOptions {
  /**
   * Error correction level. Higher levels survive more damage but reduce data capacity.
   * Defaults to "M", or "H" in `toSvg()` when an icon is provided.
   */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** Exact QR version to use, from 1 to 40. Overrides minVersion/maxVersion. */
  version?: number;
  /** Lowest QR version allowed when automatically choosing a version. Defaults to 1. */
  minVersion?: number;
  /** Highest QR version allowed when automatically choosing a version. Defaults to 40. */
  maxVersion?: number;
  /** Exact mask pattern to use, from 0 to 7. By default the lowest-penalty mask is chosen. */
  maskPattern?: number;
  /** Encoding mode. "auto" picks numeric, alphanumeric, or UTF-8 byte mode for string input. */
  mode?: EncodingMode;
}

export interface QrCode {
  /** QR Code Model 2 version, from 1 to 40. */
  readonly version: number;
  /** Matrix width/height in modules. Version 1 is 21, then each version adds 4. */
  readonly size: number;
  /** Error correction level used to create the symbol. */
  readonly errorCorrectionLevel: ErrorCorrectionLevel;
  /** Selected mask pattern, from 0 to 7. */
  readonly maskPattern: number;
  /** Dark/light module matrix indexed as modules[row][column]. */
  readonly modules: readonly (readonly boolean[])[];
  /** Returns true when the module at row/column is dark. */
  isDark(row: number, column: number): boolean;
}

export interface CenterIconOptions {
  /** PNG data URI, URL, or project asset path to embed in the center of the SVG. */
  href: string;
  /** Icon width/height as a ratio of QR modules. Must be greater than 0 and less than 0.5. */
  sizeRatio?: number;
  /** Background patch padding as a ratio of QR modules. */
  paddingRatio?: number;
  /** Fill color for the patch behind the icon. Defaults to the SVG background. */
  background?: string;
  /** Corner radius for the patch behind the icon. Use 0 for square corners. */
  radius?: number;
}

export interface SvgRenderOptions {
  /** Output pixels per QR module. Defaults to 4. */
  moduleSize?: number;
  /** Quiet zone around the QR matrix, in modules. Defaults to 4. */
  margin?: number;
  /** Dark module color. Defaults to "#000". */
  foreground?: string;
  /** Background and quiet-zone color. Defaults to "#fff". */
  background?: string;
  /** Optional accessible SVG title. */
  title?: string;
  /** Optional center icon rendered over a background patch. */
  icon?: CenterIconOptions;
}

export type ToSvgOptions = QrOptions & SvgRenderOptions;

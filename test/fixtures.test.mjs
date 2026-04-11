import { describe, expect, test } from "vitest";
import { createQrCode, renderSvg, toSvg } from "../src/index.ts";

describe("better-qr", () => {
  test("creates a version 1 QR matrix for a short numeric payload", () => {
    const qr = createQrCode("01234567", { errorCorrectionLevel: "M" });

    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    expect(qr.errorCorrectionLevel).toBe("M");
    expect(qr.modules).toHaveLength(21);
    expect(qr.modules[0]).toHaveLength(21);
    expect(qr.isDark(0, 0)).toBe(true);
  });

  test("renders SVG with escaped text-safe attributes", () => {
    const svg = toSvg("hello <qr> & world", {
      margin: 2,
      foreground: "#111",
      background: "#fff"
    });

    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/viewBox="0 0 /);
    expect(svg).toMatch(/<rect width="100%" height="100%" fill="#fff"\/>/);
    expect(svg).not.toContain("hello <qr>");
  });

  test("embeds center icon and defaults to high error correction for toSvg", () => {
    const svg = toSvg("https://example.com", {
      icon: {
        href: "data:image/png;base64,AA==",
        sizeRatio: 0.2,
        paddingRatio: 0.04,
        background: "#ffffff",
        radius: 4
      }
    });

    expect(svg).toContain("<image ");
    expect(svg).toContain('href="data:image/png;base64,AA=="');
  });

  test("rejects data that cannot fit in the selected version", () => {
    expect(() => createQrCode("x".repeat(100), { version: 1, errorCorrectionLevel: "H" })).toThrow(/does not fit/);
  });

  test("renderSvg accepts an already-created QR code", () => {
    const qr = createQrCode(new Uint8Array([0, 1, 2, 3]), { errorCorrectionLevel: "Q" });
    const svg = renderSvg(qr, { moduleSize: 3, margin: 1 });

    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('shape-rendering="crispEdges"');
  });
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { createQrCode, renderSvg, toSvg } from "../dist/index.js";

test("creates a version 1 QR matrix for a short numeric payload", () => {
  const qr = createQrCode("01234567", { errorCorrectionLevel: "M" });

  assert.equal(qr.version, 1);
  assert.equal(qr.size, 21);
  assert.equal(qr.errorCorrectionLevel, "M");
  assert.equal(qr.modules.length, 21);
  assert.equal(qr.modules[0].length, 21);
  assert.equal(qr.isDark(0, 0), true);
});

test("renders SVG with escaped text-safe attributes", () => {
  const svg = toSvg("hello <qr> & world", {
    margin: 2,
    foreground: "#111",
    background: "#fff"
  });

  assert.match(svg, /^<svg /);
  assert.match(svg, /viewBox="0 0 /);
  assert.match(svg, /<rect width="100%" height="100%" fill="#fff"\/>/);
  assert.doesNotMatch(svg, /hello <qr>/);
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

  assert.match(svg, /<image /);
  assert.match(svg, /href="data:image\/png;base64,AA=="/);
});

test("rejects data that cannot fit in the selected version", () => {
  assert.throws(
    () => createQrCode("x".repeat(100), { version: 1, errorCorrectionLevel: "H" }),
    /does not fit/
  );
});

test("renderSvg accepts an already-created QR code", () => {
  const qr = createQrCode(new Uint8Array([0, 1, 2, 3]), { errorCorrectionLevel: "Q" });
  const svg = renderSvg(qr, { moduleSize: 3, margin: 1 });

  assert.match(svg, /^<svg /);
  assert.match(svg, /shape-rendering="crispEdges"/);
});

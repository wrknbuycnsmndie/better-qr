import { describe, expect, test } from "vitest";

import { createQrCode, toSvg } from "../src/index.ts";

describe("validation", () => {
  test("rejects invalid version options", () => {
    expect(() => createQrCode("x", { version: 0 })).toThrow(/version/);
    expect(() => createQrCode("x", { version: 41 })).toThrow(/version/);
    expect(() => createQrCode("x", { version: 1.5 })).toThrow(/version/);
    expect(() => createQrCode("x", { minVersion: 5, maxVersion: 4 })).toThrow(/minVersion/);
  });

  test("rejects invalid mask and error correction options", () => {
    expect(() => createQrCode("x", { maskPattern: -1 })).toThrow(/maskPattern/);
    expect(() => createQrCode("x", { maskPattern: 8 })).toThrow(/maskPattern/);
    expect(() => createQrCode("x", { maskPattern: 1.5 })).toThrow(/maskPattern/);
    expect(() => createQrCode("x", { errorCorrectionLevel: "X" })).toThrow(/errorCorrectionLevel/);
  });

  test("rejects oversized payloads within a selected range", () => {
    expect(() => createQrCode("x".repeat(100), { version: 1, errorCorrectionLevel: "H" })).toThrow(
      /does not fit/,
    );
    expect(() =>
      createQrCode("x".repeat(100), { minVersion: 1, maxVersion: 1, errorCorrectionLevel: "L" }),
    ).toThrow(/does not fit/);
  });

  test("rejects invalid SVG render options", () => {
    expect(() => toSvg("x", { moduleSize: 0 })).toThrow(/moduleSize/);
    expect(() => toSvg("x", { moduleSize: Number.NaN })).toThrow(/moduleSize/);
    expect(() => toSvg("x", { margin: -1 })).toThrow(/margin/);
    expect(() => toSvg("x", { icon: { href: "./logo.png", sizeRatio: 0 } })).toThrow(/sizeRatio/);
    expect(() => toSvg("x", { icon: { href: "./logo.png", sizeRatio: 0.5 } })).toThrow(/sizeRatio/);
    expect(() => toSvg("x", { icon: { href: "./logo.png", paddingRatio: -0.1 } })).toThrow(
      /paddingRatio/,
    );
    expect(() => toSvg("x", { icon: { href: "./logo.png", paddingRatio: 0.25 } })).toThrow(
      /paddingRatio/,
    );
    expect(() => toSvg("x", { icon: { href: "./logo.png", radius: -1 } })).toThrow(/radius/);
  });
});

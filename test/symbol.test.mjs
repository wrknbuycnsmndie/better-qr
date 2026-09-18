import { describe, expect, test } from "vitest";

import { createQrSymbol } from "../src/symbol.ts";

describe("QR symbol layout", () => {
  test("creates a public QR code from interleaved codewords", () => {
    const qr = createQrSymbol(
      1,
      "M",
      Array.from({ length: 26 }, () => 0),
      3,
    );

    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    expect(qr.errorCorrectionLevel).toBe("M");
    expect(qr.maskPattern).toBe(3);
    expect(qr.modules).toHaveLength(21);
    expect(qr.modules[0]).toHaveLength(21);
    expect(qr.isDark(0, 0)).toBe(true);
  });

  test("owns automatic mask selection for the symbol", () => {
    const qr = createQrSymbol(
      1,
      "M",
      Array.from({ length: 26 }, (_, index) => index),
    );

    expect(qr.maskPattern).toBeGreaterThanOrEqual(0);
    expect(qr.maskPattern).toBeLessThanOrEqual(7);
  });
});

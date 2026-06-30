import { describe, expect, test } from "vitest";
import { createQrCode, renderSvg, toSvg } from "../src/index.ts";

describe("public package interface", () => {
  test("exports the documented runtime functions", async () => {
    const api = await import("../src/index.ts");

    expect(api).toMatchObject({
      createQrCode: expect.any(Function),
      renderSvg: expect.any(Function),
      toSvg: expect.any(Function)
    });
  });

  test("createQrCode defaults to medium error correction", () => {
    const qr = createQrCode("default ecc");

    expect(qr.errorCorrectionLevel).toBe("M");
  });

  test("toSvg defaults to high error correction when an icon is provided", () => {
    expect(() =>
      toSvg("HELLO WORLD", {
        version: 1,
        icon: { href: "./logo.png" }
      })
    ).toThrow(/does not fit/);
  });

  test("explicit error correction wins over the icon default", () => {
    const svg = toSvg("HELLO WORLD", {
      version: 1,
      errorCorrectionLevel: "M",
      icon: { href: "./logo.png" }
    });

    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("./logo.png");
  });

  test("renderSvg keeps the QrCode object as the rendering seam", () => {
    const qr = createQrCode("HELLO WORLD", { errorCorrectionLevel: "Q", maskPattern: 2 });
    const svg = renderSvg(qr, { margin: 1, moduleSize: 2, title: "Hello" });

    expect(qr.maskPattern).toBe(2);
    expect(svg).toContain("<title>Hello</title>");
    expect(svg).toContain('width="46"');
    expect(svg).toContain('height="46"');
  });
});

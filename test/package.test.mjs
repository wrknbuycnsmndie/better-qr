import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";

const testIfBuilt = existsSync(new URL("../dist/index.js", import.meta.url)) ? test : test.skip;

describe("built package output", () => {
  testIfBuilt("exposes only documented runtime exports", async () => {
    const api = await import("../dist/index.js");

    expect(Object.keys(api).sort()).toEqual(["createQrCode", "renderSvg", "toSvg"]);
    expect(api.toSvg("package smoke")).toMatch(/^<svg /);
  });
});

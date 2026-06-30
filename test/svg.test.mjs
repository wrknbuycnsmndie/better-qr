import { describe, expect, test } from "vitest";
import { createQrCode, renderSvg, toSvg } from "../src/index.ts";

describe("SVG rendering", () => {
  test("escapes title, colors, and icon href attributes", () => {
    const svg = toSvg("escape", {
      title: "QR <title> & text",
      foreground: 'red"<fg>&',
      background: 'white"<bg>&',
      icon: {
        href: 'logo"<script>&.png',
        background: 'patch"<bg>&',
        radius: 2
      }
    });

    expect(svg).toContain("<title>QR &lt;title&gt; &amp; text</title>");
    expect(svg).toContain('fill="red&quot;&lt;fg&gt;&amp;"');
    expect(svg).toContain('fill="white&quot;&lt;bg&gt;&amp;"');
    expect(svg).toContain('fill="patch&quot;&lt;bg&gt;&amp;"');
    expect(svg).toContain('href="logo&quot;&lt;script&gt;&amp;.png"');
  });

  test("formats integer and fractional geometry predictably", () => {
    const qr = createQrCode("x", { version: 1, maskPattern: 0 });
    const svg = renderSvg(qr, {
      margin: 1.25,
      moduleSize: 2.5,
      icon: {
        href: "./logo.png",
        sizeRatio: 0.2,
        paddingRatio: 0.05,
        radius: 1.5
      }
    });

    expect(svg).toContain('viewBox="0 0 23.5 23.5"');
    expect(svg).toContain('width="58.75"');
    expect(svg).toContain('height="58.75"');
    expect(svg).toContain('rx="1.5" ry="1.5"');
  });

  test("omits title and icon markup when not requested", () => {
    const svg = toSvg("plain");

    expect(svg).not.toContain("<title>");
    expect(svg).not.toContain("<image ");
  });
});

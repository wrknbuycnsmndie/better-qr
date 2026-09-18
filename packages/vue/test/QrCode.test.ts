import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";

import { QrCode } from "../src/index.js";

type QrCodeRenderProps = InstanceType<typeof QrCode>["$props"] &
  Readonly<{
    role?: string;
    width?: string;
    height?: string;
    viewBox?: string;
    innerHTML?: string;
    textContent?: string;
    "data-test"?: string;
    "aria-label"?: string;
  }>;

async function render(props: QrCodeRenderProps): Promise<string> {
  return renderToString(
    createSSRApp({
      render: () => h(QrCode, props),
    }),
  );
}

describe("QrCode", () => {
  it("renders native SVG elements", async () => {
    const markup = await render({ value: "hello" });

    expect(markup).toMatch(/^<svg\b/);
    expect(markup).toContain("<rect");
    expect(markup).toContain("<path");
    expect(markup).not.toContain("innerHTML");
  });

  it("rejects raw content attrs", async () => {
    const markup = await render({
      value: "hello",
      innerHTML: '<script data-test="unsafe">alert(1)</script>',
      textContent: "unsafe",
    });

    expect(markup).toContain("<rect");
    expect(markup).toContain("<path");
    expect(markup).not.toContain("<script");
    expect(markup).not.toContain("unsafe");
  });

  it("escapes title and icon attributes", async () => {
    const markup = await render({
      value: "hello",
      options: {
        title: '<QR & "safe">',
        icon: {
          href: 'https://example.test/icon.svg?x=1&label="unsafe"',
        },
      },
    });

    expect(markup).toContain("<title>&lt;QR &amp; &quot;safe&quot;&gt;</title>");
    expect(markup).toContain("<image");
    expect(markup).toContain(
      'href="https://example.test/icon.svg?x=1&amp;label=&quot;unsafe&quot;"',
    );
    expect(markup).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it("forwards attrs while preserving generated geometry", async () => {
    const markup = await render({
      value: "hello",
      class: "qr-code",
      style: "display:block",
      "data-test": "qr",
      "aria-label": "Scan me",
      role: "presentation",
      width: "999",
      height: "999",
      viewBox: "bad",
    });

    expect(markup).toContain('class="qr-code"');
    expect(markup).toContain('style="display:block"');
    expect(markup).toContain('data-test="qr"');
    expect(markup).toContain('aria-label="Scan me"');
    expect(markup).toContain('role="presentation"');
    expect(markup).not.toContain('width="999"');
    expect(markup).not.toContain('height="999"');
    expect(markup).not.toContain('viewBox="bad"');
  });
});

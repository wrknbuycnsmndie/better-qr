import type { ToSvgOptions } from "better-qr";
import type { SvgRenderModel } from "better-qr/render-model";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type CreateRenderModel = (value: string | Uint8Array, options?: ToSvgOptions) => SvgRenderModel;

const { createQrSvgRenderModel, modelState, modelWithoutIcon } = vi.hoisted(() => {
  const baseModel: SvgRenderModel = {
    viewBox: "0 0 29 29",
    width: "116",
    height: "116",
    title: "Scan <this> & go",
    background: { fill: "#fff" },
    modules: { fill: "#123", path: "M4 4h1v1h-1z" },
  };
  const state: { current: SvgRenderModel } = {
    current: baseModel,
  };

  return {
    createQrSvgRenderModel: vi.fn<CreateRenderModel>(() => state.current),
    modelState: state,
    modelWithoutIcon: baseModel,
  };
});

vi.mock("better-qr/render-model", () => ({ createQrSvgRenderModel }));

import { QrCode } from "../src/index.js";

afterEach(() => {
  modelState.current = modelWithoutIcon;
  createQrSvgRenderModel.mockClear();
});

describe("QrCode", () => {
  it("renders native SVG markup without injecting raw HTML", () => {
    const html = renderToStaticMarkup(<QrCode value="hello" aria-label="QR & code" />);

    expect(html).toContain("<title>Scan &lt;this&gt; &amp; go</title>");
    expect(html).toContain('<rect width="100%" height="100%" fill="#fff"></rect>');
    expect(html).toContain('<path fill="#123" d="M4 4h1v1h-1z"></path>');
    expect(html.match(/<path\b/g)).toHaveLength(1);
    expect(html).not.toContain("dangerouslySetInnerHTML");
    expect(html).toContain('aria-label="QR &amp; code"');
  });

  it("renders escaped icon attributes", () => {
    modelState.current = {
      ...modelWithoutIcon,
      icon: {
        patch: {
          x: "10",
          y: "10",
          width: "9",
          height: "9",
          fill: "#fff",
          rx: "1.5",
          ry: "1.5",
        },
        image: {
          href: 'data:image/svg+xml,<svg id="icon">&</svg>',
          x: "11",
          y: "11",
          width: "7",
          height: "7",
          preserveAspectRatio: "xMidYMid meet",
        },
      },
    };

    const html = renderToStaticMarkup(<QrCode value="icon" />);

    expect(html).toContain('rx="1.5" ry="1.5"');
    expect(html).toContain(
      'href="data:image/svg+xml,&lt;svg id=&quot;icon&quot;&gt;&amp;&lt;/svg&gt;"',
    );
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it("passes native props while generated geometry wins", () => {
    const html = renderToStaticMarkup(
      <QrCode
        value={new Uint8Array([1, 2, 3])}
        viewBox="bad"
        width="1"
        height="2"
        role="presentation"
        className="qr"
        style={{ display: "block" }}
      />,
    );

    expect(html).toContain('viewBox="0 0 29 29"');
    expect(html).toContain('width="116" height="116"');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('class="qr"');
    expect(html).toContain('style="display:block"');
    expect(html).not.toContain('viewBox="bad"');
  });

  it("defaults role to img and forwards options", () => {
    const options = { title: "Forwarded" };
    const html = renderToStaticMarkup(<QrCode value="options" options={options} />);

    expect(html).toContain('role="img"');
    expect(createQrSvgRenderModel).toHaveBeenLastCalledWith("options", options);
  });
});

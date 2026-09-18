import "@angular/compiler";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import type { ToSvgOptions } from "better-qr";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { QrCodeComponent } from "../dist";

function render(value: string | Uint8Array, options?: ToSvgOptions): HTMLElement {
  TestBed.configureTestingModule({ imports: [QrCodeComponent] });
  const fixture = TestBed.createComponent(QrCodeComponent);
  fixture.componentRef.setInput("value", value);
  if (options !== undefined) {
    fixture.componentRef.setInput("options", options);
  }
  fixture.detectChanges();

  const nativeElement: unknown = fixture.nativeElement;
  if (!(nativeElement instanceof HTMLElement)) {
    throw new TypeError("Expected Angular fixture to render an HTMLElement");
  }
  return nativeElement;
}

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
});
afterEach(() => TestBed.resetTestingModule());
afterAll(() => TestBed.resetTestEnvironment());

describe("QrCodeComponent", () => {
  it("renders escaped native SVG markup", () => {
    const host = render("hello", { title: "Scan <this> & go" });
    const svg = host.querySelector("svg");

    expect(svg).not.toBeNull();
    expect(svg?.querySelector("title")?.textContent).toBe("Scan <this> & go");
    expect(svg?.querySelector("script")).toBeNull();
    expect(svg?.querySelector("rect")).not.toBeNull();
    expect(svg?.querySelector("path")).not.toBeNull();
  });

  it("renders icon geometry and attributes", () => {
    const href = 'https://example.test/icon.svg?x=1&label="safe"';
    const host = render(new Uint8Array([1, 2, 3]), {
      icon: { href, radius: 1.5 },
    });
    const icon = host.querySelector("image");
    const patch = host.querySelectorAll("rect").item(1);

    expect(icon?.getAttribute("href")).toBe(href);
    expect(icon?.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
    expect(patch.getAttribute("rx")).toBe("1.5");
    expect(patch.getAttribute("ry")).toBe("1.5");
  });

  it("renders an explicitly empty title", () => {
    const host = render("hello", { title: "" });

    expect(host.querySelector("title")).not.toBeNull();
    expect(host.querySelector("title")?.textContent).toBe("");
  });
});

# better-qr

[![CI](https://github.com/wrknbuycnsmndie/better-qr/actions/workflows/ci.yml/badge.svg)](https://github.com/wrknbuycnsmndie/better-qr/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/wrknbuycnsmndie/better-qr/branch/main/graph/badge.svg)](https://codecov.io/gh/wrknbuycnsmndie/better-qr)
[![npm version](https://img.shields.io/npm/v/better-qr.svg)](https://www.npmjs.com/package/better-qr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Small, dependency-free TypeScript QR code generator with SVG output. Use core package directly or render native SVG elements through React, Vue, and Angular adapters.

## Why better-qr?

- No runtime dependencies in core package
- ESM and tree-shakeable
- QR Code Model 2, versions 1–40
- Error correction levels `L`, `M`, `Q`, and `H`
- Numeric, alphanumeric, and UTF-8 byte encoding
- Automatic version and mask selection
- Custom colors, quiet zone, and output size
- Optional center icon
- Strict TypeScript types
- Native framework adapters

## Choose your package

| Package                                                | Use it when…                                 |
| ------------------------------------------------------ | -------------------------------------------- |
| [`better-qr`](https://www.npmjs.com/package/better-qr) | You need QR data or an SVG string.           |
| [`@better-qr/react`](packages/react/README.md)         | You want a native React SVG component.       |
| [`@better-qr/vue`](packages/vue/README.md)             | You want a reactive Vue 3 SVG component.     |
| [`@better-qr/angular`](packages/angular/README.md)     | You want a standalone Angular SVG component. |

Framework adapters use `better-qr` for generation and render native SVG nodes. They do not inject generated markup with `innerHTML`.

## Core package

### Install

```sh
npm install better-qr
```

### Render an SVG string

```ts
import { toSvg } from "better-qr";

const svg = toSvg("https://example.com", {
  title: "Open example.com",
  foreground: "#172554",
  background: "#eff6ff",
});

const container = document.querySelector("#qr");
if (container !== null) {
  container.innerHTML = svg;
}
```

`toSvg()` returns a complete, escaped SVG string. When using React, Vue, or Angular, prefer framework adapter instead of assigning HTML yourself.

### Add a center icon

```ts
import { toSvg } from "better-qr";

const svg = toSvg("https://example.com/pay", {
  errorCorrectionLevel: "H",
  icon: {
    href: "/logo.svg",
    sizeRatio: 0.18,
    paddingRatio: 0.035,
    background: "#fff",
    radius: 3,
  },
});
```

Icon `href` may be project asset path, URL, or data URI. Library places it in SVG `<image>` element and does not process image data. Use high error correction and test important codes with real scanners.

## Framework adapters

### React

```tsx
import { QrCode } from "@better-qr/react";

<QrCode
  value="https://example.com"
  options={{ title: "Open example.com" }}
  aria-label="Open example.com"
/>;
```

See [`@better-qr/react` documentation](packages/react/README.md) for SVG props, refs, styling, and icon examples.

### Vue

```vue
<script setup lang="ts">
import { QrCode } from "@better-qr/vue";
</script>

<template>
  <QrCode
    value="https://example.com"
    :options="{ title: 'Open example.com' }"
    aria-label="Open example.com"
  />
</template>
```

See [`@better-qr/vue` documentation](packages/vue/README.md) for reactive values, forwarded attributes, events, and icon examples.

### Angular

```ts
import { Component } from "@angular/core";
import { QrCodeComponent } from "@better-qr/angular";

@Component({
  selector: "app-root",
  imports: [QrCodeComponent],
  template: `
    <better-qr
      value="https://example.com"
      [options]="{ title: 'Open example.com' }"
      ariaLabel="Open example.com"
    />
  `,
})
export class AppComponent {}
```

See [`@better-qr/angular` documentation](packages/angular/README.md) for inputs, standalone usage, styling, and icon examples.

## Core API

```ts
import { createQrCode, renderSvg, toSvg } from "better-qr";
```

### `toSvg(input, options?)`

Creates QR code and returns complete SVG string.

### `createQrCode(input, options?)`

Creates QR matrix when you need direct access to version, mask, error correction level, or modules.

### `renderSvg(qr, options?)`

Renders existing QR matrix as SVG string.

Input may be `string` or `Uint8Array`. String mode is detected automatically unless explicitly configured.

## Render model API

Framework integrations can consume escaped-by-renderer geometry without parsing SVG strings:

```ts
import { createQrSvgRenderModel, type SvgRenderModel } from "better-qr/render-model";

const model: SvgRenderModel = createQrSvgRenderModel("hello");
```

Render-model values are plain strings intended for framework bindings. Text and attribute escaping remains renderer responsibility.

## Options

```ts
import type { ToSvgOptions } from "better-qr";

const options: ToSvgOptions = {
  errorCorrectionLevel: "H",
  mode: "auto",
  minVersion: 1,
  maxVersion: 40,
  foreground: "#000",
  background: "#fff",
  margin: 4,
  moduleSize: 4,
  title: "Example QR code",
  icon: {
    href: "/logo.svg",
    sizeRatio: 0.18,
    paddingRatio: 0.03,
    background: "#fff",
    radius: 2,
  },
};
```

`toSvg()` defaults to error correction level `M`, or `H` when icon is present.

## Browser usage

Core package and adapters are ESM packages. Plain browsers need bundler, import map, local ESM file, or ESM CDN to resolve package imports.

## License

MIT

# better-qr

[![CI](https://github.com/wrknbuycnsmndie/better-qr/actions/workflows/ci.yml/badge.svg)](https://github.com/wrknbuycnsmndie/better-qr/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/wrknbuycnsmndie/better-qr/branch/main/graph/badge.svg)](https://codecov.io/gh/wrknbuycnsmndie/better-qr)
[![npm version](https://img.shields.io/npm/v/better-qr.svg)](https://www.npmjs.com/package/better-qr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Small QR code generator with SVG output.  
No runtime dependencies. ESM, ready for modern bundlers and runtimes.

Supports center icons (PNG / URL / data URI). Use high error correction and test important codes with real scanners.

---

## Features

- no runtime deps
- ESM, tree-shakeable
- QR Code Model 2 (versions 1–40)
- error correction: `L`, `M`, `Q`, `H`
- encoding: numeric / alphanumeric / UTF-8
- auto version + mask selection
- SVG output
- optional center icon

---

## Install

```
npm install better-qr
```

---

## Usage

```ts
import { toSvg } from 'better-qr';

const svg = toSvg('https://example.com');
document.querySelector('#qr')!.innerHTML = svg;
```

With icon:

```ts
const svg = toSvg('https://example.com', {
  errorCorrectionLevel: 'H',
  icon: {
    href: './logo.png',
    sizeRatio: 0.18,
    paddingRatio: 0.035,
    background: '#fff',
    radius: 3,
  },
});
```

`href` can be:

- local path
- URL
- data URI

Image is inserted as `<image>` inside SVG (no image processing inside the lib).

---

## API

```ts
toSvg(input, options);
createQrCode(input, options);
renderSvg(qr, options);
```

`input`:

- string
- Uint8Array

Strings are auto-detected (numeric / alphanumeric / byte).

---

## Options

```ts
type Options = {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  version?: number;
  minVersion?: number;
  maxVersion?: number;
  maskPattern?: number;
  mode?: 'auto' | 'numeric' | 'alphanumeric' | 'byte';

  foreground?: string;
  background?: string;

  margin?: number;
  moduleSize?: number;

  title?: string;

  icon?: {
    href: string;
    sizeRatio?: number;
    paddingRatio?: number;
    background?: string;
    radius?: number;
  };
};
```

Notes:

- `toSvg()` defaults error correction to `M`
- `toSvg()` defaults error correction to `H` when `icon` is set
- plain browsers need a bundler, import map, local ESM file, or ESM CDN to import `better-qr`

---

## License

MIT

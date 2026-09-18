# @better-qr/react

React adapter for [`better-qr`](https://www.npmjs.com/package/better-qr).

Use it when you want a QR code to behave like a normal React component. It creates native SVG elements instead of injecting an SVG string, so React handles escaping, attributes, events, and refs for you.

## Install

```sh
npm install better-qr @better-qr/react react
```

Requires React 18 or newer and `better-qr` 0.2.

## Quick start

```tsx
import { QrCode } from "@better-qr/react";

export function InviteQr() {
  return (
    <QrCode
      value="https://example.com/invite"
      options={{ title: "Open invitation" }}
      aria-label="Open invitation"
      className="invite-qr"
    />
  );
}
```

`value` may be a string or `Uint8Array`. Pass any QR generation or SVG setting through `options`:

```tsx
<QrCode
  value="https://example.com/pay"
  options={{
    errorCorrectionLevel: "H",
    foreground: "#172554",
    background: "#eff6ff",
    margin: 3,
    icon: {
      href: "/logo.svg",
      sizeRatio: 0.2,
      radius: 2,
    },
  }}
/>
```

## SVG props and refs

`QrCode` accepts native SVG props, including `className`, `style`, ARIA attributes, and event handlers. Its ref points to the rendered `<svg>`:

```tsx
import { useRef } from "react";
import { QrCode } from "@better-qr/react";

export function DownloadableQr() {
  const svgRef = useRef<SVGSVGElement>(null);

  return <QrCode ref={svgRef} value="hello" role="img" />;
}
```

Generated `viewBox`, `width`, and `height` always come from `better-qr`. Use CSS or `options.moduleSize` to control displayed size. Role defaults to `img` and may be overridden.

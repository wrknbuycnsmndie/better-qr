# @better-qr/angular

Standalone Angular adapter for [`better-qr`](https://www.npmjs.com/package/better-qr).

Use it when you want a QR code in an Angular template without handling SVG strings yourself. Component renders native SVG elements, uses `OnPush` change detection, and recomputes whenever its signal inputs change.

## Install

```sh
npm install better-qr @better-qr/angular @angular/core
```

Requires Angular 22 and `better-qr` 0.2.

## Quick start

Import standalone component where you need it:

```ts
import { Component } from "@angular/core";
import { QrCodeComponent } from "@better-qr/angular";

@Component({
  selector: "app-invite",
  imports: [QrCodeComponent],
  template: `
    <better-qr
      value="https://example.com/invite"
      [options]="{ title: 'Open invitation' }"
      ariaLabel="Open invitation"
      svgClass="invite-qr"
    />
  `,
})
export class InviteComponent {}
```

`value` may be a string or `Uint8Array`. Use property binding for byte data or changing values. Pass any QR generation or SVG setting through `options`:

```ts
import { Component } from "@angular/core";
import { QrCodeComponent } from "@better-qr/angular";

@Component({
  selector: "app-payment",
  imports: [QrCodeComponent],
  template: `
    <better-qr
      [value]="payload"
      [options]="{
        errorCorrectionLevel: 'H',
        foreground: '#172554',
        background: '#eff6ff',
        margin: 3,
        icon: {
          href: '/logo.svg',
          sizeRatio: 0.2,
          radius: 2,
        },
      }"
      ariaLabel="Scan payment code"
    />
  `,
})
export class PaymentComponent {
  readonly payload = new TextEncoder().encode("payment:1234");
}
```

## Inputs

| Input       | Type                   | Description                              |
| ----------- | ---------------------- | ---------------------------------------- |
| `value`     | `string \| Uint8Array` | Required QR payload.                     |
| `options`   | `ToSvgOptions`         | QR generation and SVG rendering options. |
| `ariaLabel` | `string \| undefined`  | Accessible label for root SVG.           |
| `svgClass`  | `string \| undefined`  | CSS class applied to root SVG.           |
| `role`      | `string`               | SVG role. Defaults to `img`.             |

Generated `viewBox`, `width`, and `height` always come from `better-qr`. Use CSS or `options.moduleSize` to control displayed size.

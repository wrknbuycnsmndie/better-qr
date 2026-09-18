# @better-qr/vue

Vue 3 adapter for [`better-qr`](https://www.npmjs.com/package/better-qr).

Use it when you want a QR code that updates with normal Vue state. Component renders native SVG nodes—never `innerHTML`—so Vue handles escaping, attributes, and event listeners.

## Install

```sh
npm install better-qr @better-qr/vue vue
```

Requires Vue 3.3 or newer and `better-qr` 0.2.

## Quick start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { QrCode } from "@better-qr/vue";

const url = ref("https://example.com/invite");
</script>

<template>
  <QrCode
    :value="url"
    :options="{ title: 'Open invitation' }"
    aria-label="Open invitation"
    class="invite-qr"
  />
</template>
```

`value` may be a string or `Uint8Array`. Pass any QR generation or SVG setting through `options`:

```vue
<QrCode
  value="https://example.com/pay"
  :options="{
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
/>
```

## SVG attributes

Undeclared attributes are forwarded to root `<svg>`. This includes `class`, `style`, ARIA attributes, event listeners, and `role`:

```vue
<QrCode
  value="hello"
  role="img"
  class="qr-code"
  style="width: 12rem"
  @click="console.log('QR clicked')"
/>
```

Generated `viewBox`, `width`, and `height` always come from `better-qr`. Use CSS or `options.moduleSize` to control displayed size. Role defaults to `img` and may be overridden.

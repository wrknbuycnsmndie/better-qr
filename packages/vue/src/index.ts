import type { ToSvgOptions } from "better-qr";
import { createQrSvgRenderModel, type SvgRenderModel } from "better-qr/render-model";
import { computed, defineComponent, h, type PropType, type SetupContext, type VNode } from "vue";

type SvgAttrs = SetupContext["attrs"];
type IconModel = NonNullable<SvgRenderModel["icon"]>;
function renderIcon({ patch, image }: IconModel): VNode[] {
  return [
    h("rect", {
      x: patch.x,
      y: patch.y,
      width: patch.width,
      height: patch.height,
      fill: patch.fill,
      rx: patch.rx,
      ry: patch.ry,
    }),
    h("image", {
      href: image.href,
      x: image.x,
      y: image.y,
      width: image.width,
      height: image.height,
      preserveAspectRatio: image.preserveAspectRatio,
    }),
  ];
}

function safeSvgAttrs(attrs: SvgAttrs): Record<string, unknown> {
  const safeAttrs: Record<string, unknown> = { ...attrs };
  delete safeAttrs.innerHTML;
  delete safeAttrs.textContent;
  return safeAttrs;
}

function renderSvg(model: SvgRenderModel, attrs: SvgAttrs): VNode {
  const children: VNode[] = [];

  if (model.title !== undefined) {
    children.push(h("title", model.title));
  }

  children.push(
    h("rect", {
      width: "100%",
      height: "100%",
      fill: model.background.fill,
    }),
    h("path", {
      fill: model.modules.fill,
      d: model.modules.path,
    }),
  );

  if (model.icon !== undefined) {
    children.push(...renderIcon(model.icon));
  }

  return h(
    "svg",
    {
      ...safeSvgAttrs(attrs),
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: model.viewBox,
      width: model.width,
      height: model.height,
      "shape-rendering": "crispEdges",
      role: attrs.role ?? "img",
    },
    children,
  );
}

/** Renders a QR code as native SVG nodes. */
export const QrCode = defineComponent({
  name: "QrCode",
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Uint8Array] as PropType<string | Uint8Array>,
      required: true,
    },
    options: {
      type: Object as PropType<ToSvgOptions>,
      required: false,
    },
  },
  setup(props, { attrs }) {
    const model = computed(() => createQrSvgRenderModel(props.value, props.options));

    return () => renderSvg(model.value, attrs);
  },
});

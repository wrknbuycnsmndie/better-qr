import type { ToSvgOptions } from "better-qr";
import { createQrSvgRenderModel, type SvgRenderModel } from "better-qr/render-model";
import { forwardRef, type SVGProps } from "react";

export type QrCodeProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "dangerouslySetInnerHTML" | "value"
> & {
  /** Text or bytes encoded by QR code. */
  value: string | Uint8Array;
  /** QR generation and SVG rendering options. */
  options?: ToSvgOptions;
};

/** Renders a QR code as native SVG elements. */
export const QrCode = forwardRef<SVGSVGElement, QrCodeProps>(function QrCode(
  { value, options, role = "img", ...svgProps },
  ref,
) {
  const model: SvgRenderModel = createQrSvgRenderModel(value, options);
  const { background, modules, icon, title } = model;

  return (
    <svg
      {...svgProps}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={model.viewBox}
      width={model.width}
      height={model.height}
      shapeRendering="crispEdges"
      role={role}
    >
      {title === undefined ? null : <title>{title}</title>}
      <rect width="100%" height="100%" fill={background.fill} />
      <path fill={modules.fill} d={modules.path} />
      {icon === undefined ? null : (
        <>
          <rect
            x={icon.patch.x}
            y={icon.patch.y}
            width={icon.patch.width}
            height={icon.patch.height}
            fill={icon.patch.fill}
            rx={icon.patch.rx}
            ry={icon.patch.ry}
          />
          <image
            href={icon.image.href}
            x={icon.image.x}
            y={icon.image.y}
            width={icon.image.width}
            height={icon.image.height}
            preserveAspectRatio={icon.image.preserveAspectRatio}
          />
        </>
      )}
    </svg>
  );
});

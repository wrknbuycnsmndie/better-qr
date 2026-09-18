import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { ToSvgOptions } from "better-qr";
import { createQrSvgRenderModel, type SvgRenderModel } from "better-qr/render-model";

@Component({
  selector: "better-qr",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="model().viewBox"
      [attr.width]="model().width"
      [attr.height]="model().height"
      [attr.class]="svgClass()"
      [attr.aria-label]="ariaLabel()"
      [attr.role]="role()"
      shape-rendering="crispEdges"
    >
      @if (model().title !== undefined) {
        <title>{{ model().title }}</title>
      }
      <rect width="100%" height="100%" [attr.fill]="model().background.fill" />
      <path [attr.fill]="model().modules.fill" [attr.d]="model().modules.path" />
      @if (model().icon; as icon) {
        <rect
          [attr.x]="icon.patch.x"
          [attr.y]="icon.patch.y"
          [attr.width]="icon.patch.width"
          [attr.height]="icon.patch.height"
          [attr.fill]="icon.patch.fill"
          [attr.rx]="icon.patch.rx"
          [attr.ry]="icon.patch.ry"
        />
        <image
          [attr.href]="icon.image.href"
          [attr.x]="icon.image.x"
          [attr.y]="icon.image.y"
          [attr.width]="icon.image.width"
          [attr.height]="icon.image.height"
          [attr.preserveAspectRatio]="icon.image.preserveAspectRatio"
        ></image>
      }
    </svg>
  `,
})
export class QrCodeComponent {
  readonly value = input.required<string | Uint8Array>();
  readonly options = input<ToSvgOptions>({});
  readonly ariaLabel = input<string>();
  readonly svgClass = input<string>();
  readonly role = input("img");

  protected readonly model = computed<SvgRenderModel>(() =>
    createQrSvgRenderModel(this.value(), this.options()),
  );
}

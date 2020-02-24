import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PreviewResource } from '../../composer.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'm-composer__mediaPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'media-preview.component.html',
})
export class MediaPreviewComponent {
  @Input() previewResource: PreviewResource;

  constructor(protected domSanitizer: DomSanitizer) {}

  trustedUrl(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  fitForImage(image: HTMLImageElement) {
    //console.log(image);
  }
}

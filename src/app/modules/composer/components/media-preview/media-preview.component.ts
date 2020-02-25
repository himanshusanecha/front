import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { PreviewResource } from '../../composer.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'm-composer__mediaPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'media-preview.component.html',
})
export class MediaPreviewComponent {
  @Input('previewResource') set _previewResource(
    previewResource: PreviewResource
  ) {
    this.portrait = false;
    this.previewResource = previewResource;
  }

  previewResource: PreviewResource;

  portrait: boolean = false;

  constructor(
    protected domSanitizer: DomSanitizer,
    protected cd: ChangeDetectorRef
  ) {}

  trustedUrl(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  fitForImage(image: HTMLImageElement) {
    if (!image) {
      return false;
    }

    const currentValue = this.portrait;
    this.portrait = image.naturalHeight >= image.naturalWidth;

    if (this.portrait !== currentValue) {
      this.detectChanges();
    }
  }

  fitForVideo(video: HTMLVideoElement) {
    if (!video) {
      return false;
    }

    const currentValue = this.portrait;
    this.portrait = video.videoHeight >= video.videoWidth;

    if (this.portrait !== currentValue) {
      this.detectChanges();
    }
  }

  detectChanges() {
    this.cd.detectChanges();
    this.cd.markForCheck();
  }
}

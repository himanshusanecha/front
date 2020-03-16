import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ComposerService, PreviewResource } from '../../composer.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigsService } from '../../../../common/services/configs.service';

/**
 * Composer media preview container. Renders a user-friendly preview of
 * the embedded media, and allows to change the video thumbnails and
 * delete the embed as well.
 */
@Component({
  selector: 'm-composer__mediaPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'media-preview.component.html',
})
export class MediaPreviewComponent {
  /**
   * Is the media in portrait mode?
   */
  portrait: boolean = false;

  /**
   * URL for the CDN
   */
  readonly cdnUrl: string;

  /**
   * Constructor.
   * @param service
   * @param domSanitizer
   * @param cd
   * @param configs
   */
  constructor(
    protected service: ComposerService,
    protected domSanitizer: DomSanitizer,
    protected cd: ChangeDetectorRef,
    configs: ConfigsService
  ) {
    this.cdnUrl = configs.get('cdn_url');
  }

  /**
   * Gets the preview metadata subject from the service
   */
  get preview$() {
    return this.service.preview$;
  }

  /**
   * Gets the URL for a resource
   * @param previewResource
   */
  getUrl(previewResource: PreviewResource) {
    switch (previewResource.sourceType) {
      case 'image':
        if (previewResource.source === 'local') {
          return this.localTrustedUrl(previewResource.payload);
        } else if (previewResource.source === 'guid') {
          return `${this.cdnUrl}fs/v1/thumbnail/${previewResource.payload}/xlarge/`;
        }
        break;
      case 'video':
        if (previewResource.source === 'local') {
          return `${this.localTrustedUrl(previewResource.payload)}#t=1`;
        } else if (previewResource.source === 'guid') {
          return `${this.cdnUrl}api/v1/media/${previewResource.payload}/play/#t=1`;
        }
        break;
    }
  }

  /**
   * Trust the Blob URL used to preview the media
   * @param url
   */
  protected localTrustedUrl(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Calculates portrait mode for images. Called on load.
   * @param image
   */
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

  /**
   * Calculates portrait mode for videos. Called on load.
   * @param video
   */
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

  /**
   * Removes the attachment using the service
   */
  remove() {
    // TODO: Implement a nice themed modal confirmation
    if (confirm("Are you sure? There's no UNDO.")) {
      this.service.removeAttachment();
    }
  }

  /**
   * Detects changes
   */
  detectChanges() {
    this.cd.detectChanges();
    this.cd.markForCheck();
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ComposerService,
  PreviewResource,
} from '../../services/composer.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigsService } from '../../../../common/services/configs.service';

/**
 * Composer preview container. Renders a user-friendly preview of
 * the embedded media or rich embed, and allows to change the video
 * thumbnails and delete the embed as well.
 */
@Component({
  selector: 'm-composer__preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'preview.component.html',
})
export class PreviewComponent {
  /**
   * Is the media in portrait mode?
   */
  portrait: boolean = false;

  /**
   * Constructor.
   * @param service
   * @param cd
   */
  constructor(
    protected service: ComposerService,
    protected cd: ChangeDetectorRef
  ) {}

  /**
   * Gets the preview metadata subject from the service
   */
  get preview$() {
    return this.service.preview$;
  }

  /**
   * Sets the portrait mode
   * @param portrait
   */
  setPortrait(portrait: boolean) {
    if (portrait !== this.portrait) {
      this.portrait = portrait;
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

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'm-composer__mediaPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'media-preview.component.html',
})
export class MediaPreviewComponent {}

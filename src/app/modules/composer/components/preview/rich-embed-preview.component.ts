import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RichEmbed } from '../../services/rich-embed.service';

@Component({
  selector: 'm-composerRichEmbedPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'rich-embed-preview.component.html',
})
export class RichEmbedPreviewComponent {
  @Input() richEmbed: RichEmbed;

  /**
   * Extracts the domain name
   */
  extractDomain(): string {
    return new URL(this.richEmbed.url || '').hostname;
  }
}

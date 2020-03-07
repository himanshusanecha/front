import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ConfigsService } from '../../services/configs.service';

export type IconSource = 'md' | 'ion' | 'assets-file' | 'text';

@Component({
  selector: 'm-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'icon.component.html',
})
export class IconComponent {
  /**
   * Source for this icon
   */
  @Input() from: IconSource = 'md';

  /**
   * icon ID (for icons set) or file name for assets-file
   */
  @Input() iconId: string;

  /**
   * Sizing factor
   */
  @Input() sizeFactor: number = 35;

  /**
   * URL for CDN assets
   * @internal
   */
  readonly cdnAssetsUrl: string;

  constructor(configs: ConfigsService) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url') || '/';
  }

  get sizeCss() {
    const size = 1 + this.sizeFactor / 100;

    switch (this.from) {
      case 'md':
      case 'ion':
        return { fontSize: `${size}em` };
      case 'text':
        return { fontSize: `${size}em` }; // Ratio might differ in the future
      case 'assets-file':
        return { height: `${size}em` };
    }

    return {};
  }
}

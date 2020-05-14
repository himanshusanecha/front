import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ConfigsService } from '../../../../common/services/configs.service';
import { ChannelContentService } from './content.service';

/**
 * A container for channel loading errors.
 * (channel not found, channel banned ect).
 *
 * @author Ben Hayward
 */
@Component({
  selector: 'm-channel__content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'content.component.html',
  providers: [ChannelContentService],
})
export class ChannelContentComponent {
  /**
   * Assets CDN URL
   */
  readonly cdnAssetsUrl: string;

  /**
   * Constructor
   * @param content
   * @param configs
   */
  constructor(public content: ChannelContentService, configs: ConfigsService) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChannelShopService } from './shop.service';
import { ChannelsV2Service } from '../channels-v2.service';
import { WireModalService } from '../../../wire/wire-modal.service';

@Component({
  selector: 'm-channelShop__brief',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'brief.component.html',
  providers: [ChannelShopService],
})
export class ChannelShopBriefComponent {
  /**
   * Constructor
   * @param shop
   * @param channel
   * @param wireModal
   */
  constructor(
    public shop: ChannelShopService,
    public channel: ChannelsV2Service,
    protected wireModal: WireModalService
  ) {}

  /**
   * Triggers Wire modal
   * @param type
   * @param reward
   */
  async onEntryClick(type, reward) {
    await this.wireModal
      .present(this.channel.channel$.getValue(), {
        default: {
          min: reward.amount,
          type: type,
        },
      })
      .toPromise();
  }
}

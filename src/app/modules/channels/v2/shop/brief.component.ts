import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ChannelsV2Service } from '../channels-v2.service';
import { WireModalService } from '../../../wire/wire-modal.service';
import {
  SupportTier,
  WireSupportTiersService,
} from '../../../wire/v2/wire-support-tiers.service';
import { Subscription } from 'rxjs';
import { MindsUser } from '../../../../interfaces/entities';

@Component({
  selector: 'm-channelShop__brief',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'brief.component.html',
  providers: [WireSupportTiersService],
})
export class ChannelShopBriefComponent implements OnDestroy {
  /**
   * Channel GUID subscription
   */
  protected channelGuidSubscription: Subscription;

  /**
   * Constructor. Set channel GUID subscription.
   * @param channel
   * @param wireSupportTiers
   * @param wireModal
   */
  constructor(
    public channel: ChannelsV2Service,
    public wireSupportTiers: WireSupportTiersService,
    protected wireModal: WireModalService
  ) {
    this.channelGuidSubscription = this.channel.guid$.subscribe(guid =>
      this.wireSupportTiers.setEntityGuid(guid)
    );
  }

  /**
   * Component destroy
   */
  ngOnDestroy(): void {
    if (this.channelGuidSubscription) {
      this.channelGuidSubscription.unsubscribe();
    }
  }

  /**
   * Triggers Wire modal
   * @param channel
   * @param supportTier
   */
  async onEntryClick(channel: MindsUser, supportTier: SupportTier) {
    const type =
      supportTier.currency === 'usd' ? 'money' : supportTier.currency;

    await this.wireModal
      .present(channel, {
        default: {
          min: supportTier.amount,
          type,
        },
      })
      .toPromise();
  }
}

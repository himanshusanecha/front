import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChannelsV2Service } from '../channels-v2.service';
import { PostMenuService } from '../../../../common/components/post-menu/post-menu.service';
import { ActivityService } from '../../../../common/services/activity.service';
import { BanModalComponent } from '../../../ban/modal/modal.component';
import { OverlayModalService } from '../../../../services/ux/overlay-modal';

/**
 * Extra actions dropdown menu
 */
@Component({
  selector: 'm-channelActions__menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'menu.component.html',
  providers: [PostMenuService, ActivityService],
})
export class ChannelActionsMenuComponent {
  /**
   * Constructor
   * @param service
   * @param overlayModalService
   * @param postMenu
   * @param activity
   */
  constructor(
    public service: ChannelsV2Service,
    protected overlayModalService: OverlayModalService,
    protected postMenu: PostMenuService,
    activity: ActivityService
  ) {}

  /**
   * Subscribe to the user
   * @todo Create a generic service along with post menu things
   */
  async subscribe(): Promise<void> {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, subscribed: false });

    // Let Post Menu service handle subscription
    await this.postMenu.setEntityOwner(channel).subscribe();

    // Post menu service mutates passed object
    this.service.setChannel({ ...channel });
  }

  /**
   * Unsubscribe from the user
   * @todo Create a generic service along with post menu things
   */
  async unsubscribe(): Promise<void> {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, subscribed: false });

    // Let Post Menu service handle subscription
    await this.postMenu.setEntityOwner(channel).unSubscribe();

    // Post menu service mutates passed object
    this.service.setChannel({ ...channel });
  }

  /**
   * Ban a user
   * @todo Create a generic service along with post menu things
   */
  async ban() {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, banned: 'yes', subscribed: false });

    this.overlayModalService
      .create(BanModalComponent, channel)
      .onDidDismiss(data => {
        if (data.banned) {
          // Let Post Menu service handle ban operation
          this.postMenu.setEntity({ ownerObj: channel }).ban();
        }
      })
      .present();
  }

  /**
   * Unban a user
   * @todo Create a generic service along with post menu things
   */
  async unBan() {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, banned: 'no', subscribed: false });

    // Let Post Menu service handle ban operation
    await this.postMenu.setEntity({ ownerObj: channel }).unBan();
  }

  /**
   * Block a user
   * @todo Create a generic service along with post menu things
   */
  async block() {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, blocked: true, subscribed: false });

    // Let Post Menu service handle block operation
    await this.postMenu.setEntity({ ownerObj: channel }).block();
  }

  /**
   * Unblock a user
   * @todo Create a generic service along with post menu things
   */
  async unblock() {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Optimistic mutation
    this.service.setChannel({ ...channel, blocked: false });

    // Let Post Menu service handle block operation
    await this.postMenu.setEntity({ ownerObj: channel }).unBlock();
  }

  /**
   * Report the user
   * @todo Create a generic service along with post menu things
   */
  report(): void {
    // Shallow clone current user
    const channel = { ...this.service.channel$.getValue() };

    // Let Post Menu service handle modal
    this.postMenu.setEntity(channel).openReportModal();
  }
}

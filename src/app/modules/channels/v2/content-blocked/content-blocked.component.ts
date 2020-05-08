/**
 * A container for channel loading errors.
 * (channel not found, channel banned ect).
 *
 * <m-channel-container__error [error$]="error$"></m-channel-container__error>

 * @author Ben Hayward
 */
import { Component, Input } from '@angular/core';
import { ConfigsService } from '../../../../common/services/configs.service';
import { ChannelContentBlockedService } from './content-blocked.service';

@Component({
  selector: 'm-channel__contentBlocked',
  template: `
    <div
      *ngIf="service.show$ | async"
      class="m-channel-contentBlocked__wrapper"
    >
      <i class="m-channel-contentBlocked__icon material-icons">
        {{ service.icon$ | async }}</i
      >
      <h3 class="m-channel-contentBlocked__primaryText" i18n>
        {{ service.text$ | async }}
      </h3>
      <span class="m-channel-contentBlocked__secondaryText" i18n>{{
        service.secondaryText$ | async
      }}</span>
      <button
        *ngIf="service.dismissButtonText$ | async"
        class="m-channel-contentBlocked__confirmButton"
        (click)="onConfirmationClick()"
        i18n
      >
        {{ service.dismissButtonText$ | async }}
      </button>
    </div>
  `,
})
export class ChannelContentBlockedComponent {
  // Assets url.
  readonly cdnAssetsUrl: string;

  @Input() onClick: Function = $event => void 0;

  constructor(
    public configs: ConfigsService,
    public service: ChannelContentBlockedService
  ) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }

  onConfirmationClick() {
    this.service.show$.next(false);
    this.onClick();
  }
}

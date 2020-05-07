/**
 * A container for channel loading errors.
 * (channel not found, channel banned ect).
 *
 * @author Ben Hayward
 */
import { Component, Input } from '@angular/core';
import { ConfigsService } from '../../../common/services/configs.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'm-channel-container__error',
  template: `
    <div>
      <div *ngIf="error$ | async" class="m-channel-container__errorContainer">
        <img
          [src]="cdnAssetsUrl + 'assets/logos/logo.svg'"
          class="m-channel-container__errorImage"
        />
        <h3 class="m-channel-container__errorPrimary">{{ error$ | async }}</h3>
        <span class="m-channel-container__errorSecondary" i18n>{{
          secondaryText$ | async
        }}</span>
      </div>
    </div>
  `,
})
export class ChannelContainerErrorComponent {
  // Observable error.
  @Input() readonly error$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  // Observable secondary text for the error (e.g. advice on what to do next).
  @Input() readonly secondaryText$: BehaviorSubject<
    string
  > = new BehaviorSubject<string>('Please check the username');

  // Assets url.
  readonly cdnAssetsUrl: string;

  constructor(public configs: ConfigsService) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }
}

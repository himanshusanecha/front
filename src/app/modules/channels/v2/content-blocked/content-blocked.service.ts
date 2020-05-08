/**
 * A container for channel loading errors.
 * (channel not found, channel banned ect).
 *
 * @author Ben Hayward
 */
import { Injectable } from '@angular/core';
import { ConfigsService } from '../../../../common/services/configs.service';
import { BehaviorSubject } from 'rxjs';

export enum CONTENT_BLOCK_REASONS {
  NSFW_PRIMARY = 'This channel is NSFW',
  NSFW_CONFIRM_BUTTON = 'I am 18 or over',
  NOT_FOUND_PRIMARY = "Sorry, this channel doesn't appear to exist",
  BANNED_PRIMARY = 'Account banned',
  BANNED_SECONDARY = 'This account has been banned for violating the Minds terms of use',
}

@Injectable()
export class ChannelContentBlockedService {
  // Observable error.
  readonly text$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // Observable secondary text for the error (e.g. advice on what to do next).
  readonly secondaryText$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  // icon
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject<string>(
    'help_outline'
  );

  // icon
  readonly dismissButtonText$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('help_outline');

  // should be shown
  readonly show$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // Assets url.
  readonly cdnAssetsUrl: string;

  constructor(public configs: ConfigsService) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }

  // TODO: Add type
  public deriveState(channel: any): void {
    if (
      (Array.isArray(channel.nsfw) && channel.nsfw.length > 0) ||
      channel.is_mature
    ) {
      this.text$.next(CONTENT_BLOCK_REASONS.NSFW_PRIMARY);
      this.dismissButtonText$.next(CONTENT_BLOCK_REASONS.NSFW_CONFIRM_BUTTON);
      this.icon$.next('error_outline');
      this.show$.next(true);
    }
  }

  public hide() {
    this.show$.next(false);
  }
}

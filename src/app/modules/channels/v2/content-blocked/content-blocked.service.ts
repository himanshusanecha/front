/**
 * A container for channel loading errors.
 * (channel not found, channel banned ect).
 *
 * @author Ben Hayward
 */
import { Injectable } from '@angular/core';
import { ConfigsService } from '../../../../common/services/configs.service';
import { BehaviorSubject } from 'rxjs';
import { MindsUser } from '../../../../interfaces/entities';
import { Session } from '../../../../services/session';

export enum CONTENT_BLOCK_REASONS {
  NSFW_PRIMARY = 'This channel is NSFW',
  NSFW_CONFIRM_BUTTON = 'I am 18 or over',
  NOT_FOUND_PRIMARY = "Sorry, this channel doesn't appear to exist",
  BANNED_PRIMARY = 'Account banned',
  BANNED_SECONDARY = 'This account has been banned for violating the ',
  DISABLED_PRIMARY = 'This channel has been disabled',
}

export enum TRIGGER_EXCEPTION {
  NOT_FOUND = 'ChannelNotFoundException',
  DISABLED = 'ChannelDisabledException',
  BANNED = 'ChannelBannedException',
}

@Injectable()
export class ChannelContentBlockedService {
  // Observable error.
  readonly text$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // Observable secondary text for the error (e.g. advice on what to do next).
  readonly secondaryText$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  // Show content policy link at end of secondary text.
  readonly contentPolicyLink$: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(false);

  // icon
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // text for a dismiss button - to hide do not set.
  readonly dismissButtonText$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  // should be shown
  readonly show$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // Assets url.
  readonly cdnAssetsUrl: string;

  constructor(public configs: ConfigsService, public session: Session) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }

  /**
   * Derives the component state based on input channel
   * @param { MindsUser } channel - the channel being loaded.
   */
  public deriveState(channel: MindsUser): void {
    if (!channel) {
      return;
    }

    if (channel.not_found) {
      this.text$.next(CONTENT_BLOCK_REASONS.NOT_FOUND_PRIMARY);
      this.icon$.next('error_outline');
      this.show$.next(true);
      return;
    }

    if (channel.banned === 'yes') {
      this.text$.next(CONTENT_BLOCK_REASONS.BANNED_PRIMARY);
      this.secondaryText$.next(CONTENT_BLOCK_REASONS.BANNED_SECONDARY);
      this.contentPolicyLink$.next(true);
      this.icon$.next('not_interested');
      this.show$.next(true);
      return;
    }

    if (channel.enabled === 'no') {
      this.text$.next(CONTENT_BLOCK_REASONS.DISABLED_PRIMARY);
      this.icon$.next('not_interested');
      this.show$.next(true);
      return;
    }

    if (this.shouldShowNsfw(channel)) {
      this.text$.next(CONTENT_BLOCK_REASONS.NSFW_PRIMARY);
      this.dismissButtonText$.next(CONTENT_BLOCK_REASONS.NSFW_CONFIRM_BUTTON);
      this.icon$.next('error_outline');
      this.show$.next(true);
      return;
    }
  }

  /**
   * Determines whether should be shown for NSFW.
   * @param { MindsUser } channel - the subject.
   * @returns { boolean } - true if should be shown.
   */
  private shouldShowNsfw(channel: MindsUser): boolean {
    return (
      this.session.getLoggedInUser().guid !== channel.guid &&
      ((Array.isArray(channel.nsfw) && channel.nsfw.length > 0) ||
        channel.is_mature)
    );
  }

  /**
   * Resets all observables to default state.
   */
  public reset(): void {
    this.text$.next('');
    this.secondaryText$.next('');
    this.contentPolicyLink$.next(false);
    this.icon$.next('');
    this.dismissButtonText$.next('');
    this.show$.next(false);
  }
}

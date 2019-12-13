import { Component, Input } from '@angular/core';
import { Session } from '../../../services/session';
import { Router } from '@angular/router';
import { Storage } from '../../../services/storage';

@Component({
  selector: 'm-channel--explicit-overlay',
  templateUrl: 'overlay.component.html',
})
export class ExplicitOverlayComponent {
  protected hidden = true;
  protected _channel: any;

  @Input() set channel(value: any) {
    this._channel = value;
    this.showOverlay();
  }

  constructor(
    public session: Session,
    public storage: Storage,
    public router: Router
  ) {}

  login() {
    this.storage.set(
      'redirect',
      window.Minds.site_url + this._channel.username
    );
    this.router.navigate(['/login']);
  }

  /**
   * Disables overlay screen, revealing channel.
   */
  protected disableFilter(): void {
    this._channel.mature_visibility = true;
    this.hidden = true;
  }

  /**
   * Determines whether the channel overlay should be shown
   * over the a channel.
   */
  private showOverlay(): void {
    if (!this._channel) {
      return;
    }

    this.hidden =
      !this._channel.mature_visibility &&
      (this._channel.isMature ||
        this._channel.nsfw.length === undefined ||
        this._channel.nsfw.length <= 1);
  }
}

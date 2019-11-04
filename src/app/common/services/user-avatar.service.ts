/**
 * @author Ben Hayward
 * @desc Singleton service used to store the current user avatar as a BehaviorSubject.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Session } from '../../services/session';
import { MindsUser } from '../../interfaces/entities';

@Injectable({
  providedIn: 'root',
})
export class UserAvatarService {
  private minds = window.Minds;
  private user: MindsUser;
  public src$: BehaviorSubject<string>;

  constructor(public session: Session) {
    this.init();
  }

  /**
   * Sets the current user and avatar src.
   */
  public init(): void {
    this.user = this.session.getLoggedInUser();
    this.src$ = new BehaviorSubject(
      `${this.minds.cdn_url}icon/${this.user.guid}/large/${this.user.icontime}`
    );
  }
}

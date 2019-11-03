import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Singleton
@Injectable({
  providedIn: 'root',
})
export class UserAvatarService {
  private minds = window.Minds;
  public src$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor() {
    this.src$.next(
      `${this.minds.cdn_url}icon/${this.minds.user.guid}/large/${this.minds.user.icontime}`
    );
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ComposerService {
  // TODO: TYPES!!!
  readonly message$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly attachment$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly nsfw$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly monetization$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly scheduler$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly stream$: Observable<any>;

  constructor() {
    this.stream$ = combineLatest([
      this.message$,
      this.attachment$,
      this.nsfw$,
      this.monetization$,
      this.scheduler$,
    ]).pipe(
      map(([message, attachment, nsfw, monetization, scheduler]) => ({
        message,
        attachment,
        nsfw,
        monetization,
        scheduler,
      }))
    );
  }
}

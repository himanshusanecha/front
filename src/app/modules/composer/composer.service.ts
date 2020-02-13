import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ComposerService implements OnDestroy {
  // TODO: TYPES!!!
  readonly message$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly attachment$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly nsfw$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly monetization$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly scheduler$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  protected data: any = null;
  protected dataStreamSubscription: Subscription;

  constructor() {
    this.dataStreamSubscription = combineLatest([
      this.message$,
      this.attachment$,
      this.nsfw$,
      this.monetization$,
      this.scheduler$,
    ])
      .pipe(
        map(([message, attachment, nsfw, monetization, scheduler]) => ({
          message,
          attachment,
          nsfw,
          monetization,
          scheduler,
        }))
      )
      .subscribe(data => (this.data = data));
  }

  ngOnDestroy(): void {
    this.dataStreamSubscription.unsubscribe();
  }

  alterMessageTags() {
    // TODO: Parse message to add and delete passed tags
    this.message$.next(
      `${this.message$.getValue() || ''} #tag${+Date.now()}`.trim()
    );
  }

  async post(): Promise<any> {
    // TODO: Return type!

    // TODO: Post
    console.log(this.data);
  }
}

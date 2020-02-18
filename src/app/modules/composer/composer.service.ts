import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { last, map, switchAll, tap } from 'rxjs/operators';
import {
  AttachmentApiService,
  UploadEvent,
  UploadEventType,
} from '../../common/api/attachment-api.service';

@Injectable()
export class ComposerService implements OnDestroy {
  // TODO: TYPES!!!
  readonly message$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly attachment$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly nsfw$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly monetization$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  readonly scheduler$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  readonly progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  readonly dataStream$: Observable<any>;

  protected readonly dataStreamSubscription: Subscription;
  protected data: any = null;

  constructor(protected attachmentApi: AttachmentApiService) {
    this.dataStream$ = combineLatest([
      this.message$,
      this.attachment$.pipe(
        map(file =>
          this.attachmentApi.upload(file).pipe(
            tap(uploadEvent => this.setProgress(uploadEvent)),
            last()
          )
        ),
        switchAll()
      ),
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

    this.dataStreamSubscription = this.dataStream$.subscribe(
      data => (this.data = data)
    );
  }

  ngOnDestroy(): void {
    this.dataStreamSubscription.unsubscribe();
  }

  setProgress(uploadEvent: UploadEvent | null): void {
    if (!uploadEvent) {
      this.progress$.next(0);
      this.inProgress$.next(false);
      return;
    }

    switch (uploadEvent.type) {
      case UploadEventType.Progress:
        this.inProgress$.next(true);
        this.progress$.next(uploadEvent.payload.progress);
        break;

      case UploadEventType.Success:
      case UploadEventType.Fail:
        this.progress$.next(0);
        this.inProgress$.next(false);
        break;
    }
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

/*
    <pre>
      Progress: {{ service.progress$ | async }}
      In Progress: {{ service.inProgress$ | async }}
      Data: {{ service.dataStream$ | async | json }}
    </pre>
*/

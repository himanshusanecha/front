import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { last, map, switchAll, tap } from 'rxjs/operators';
import {
  AttachmentApiService,
  UploadEvent,
  UploadEventType,
} from '../../common/api/attachment-api.service';

export type MessageSubjectValue = string;

export type AttachmentSubjectValue = File | null;

export type NsfwSubjectValue = Array<number>;

export type MonetizationSubjectValue = any;

export type TagsSubjectValue = Array<string>;

export type SchedulerSubjectValue = any;

@Injectable()
export class ComposerService implements OnDestroy {
  readonly message$: BehaviorSubject<MessageSubjectValue> = new BehaviorSubject<
    MessageSubjectValue
  >('');

  readonly attachment$: BehaviorSubject<
    AttachmentSubjectValue
  > = new BehaviorSubject<AttachmentSubjectValue>(null);

  readonly nsfw$: BehaviorSubject<NsfwSubjectValue> = new BehaviorSubject<
    NsfwSubjectValue
  >([]);

  readonly monetization$: BehaviorSubject<
    MonetizationSubjectValue
  > = new BehaviorSubject<MonetizationSubjectValue>(null);

  readonly tags$: BehaviorSubject<TagsSubjectValue> = new BehaviorSubject<
    TagsSubjectValue
  >([]);

  readonly scheduler$: BehaviorSubject<
    SchedulerSubjectValue
  > = new BehaviorSubject<SchedulerSubjectValue>(null);

  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  readonly progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  protected data: any = null;

  protected readonly dataStreamSubscription: Subscription;

  constructor(protected attachmentApi: AttachmentApiService) {
    this.dataStreamSubscription = combineLatest([
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
      this.tags$,
      this.scheduler$,
    ])
      .pipe(
        map(([message, attachment, nsfw, monetization, tags, scheduler]) => ({
          message,
          attachment,
          nsfw,
          monetization,
          tags,
          scheduler,
        }))
      )
      .subscribe(data => (this.data = data));
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

  async post(): Promise<any> {
    // TODO: Return type!

    // TODO: Post
    console.log(this.data);
  }
}

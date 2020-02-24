import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  last,
  map,
  switchAll,
  tap,
} from 'rxjs/operators';
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

export type ScheduleSubjectValue = any;

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

  readonly schedule$: BehaviorSubject<
    ScheduleSubjectValue
  > = new BehaviorSubject<ScheduleSubjectValue>(null);

  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  readonly progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  protected payload: any = null;

  protected readonly dataStreamSubscription: Subscription;

  constructor(protected attachmentApi: AttachmentApiService) {
    this.dataStreamSubscription = combineLatest([
      this.message$.pipe(distinctUntilChanged()),
      this.attachment$.pipe(
        distinctUntilChanged(),
        this.attachmentApi.fileToGuid((inProgress, progress) =>
          this.setProgress(inProgress, progress)
        )
      ),
      this.nsfw$, // TODO: Implement custom distinctUntilChanged comparison
      this.monetization$, // TODO: Implement custom distinctUntilChanged comparison
      this.tags$, // TODO: Implement custom distinctUntilChanged comparison
      this.schedule$, // TODO: Implement custom distinctUntilChanged comparison
    ]).subscribe(values => this.buildPayload(values));
  }

  ngOnDestroy(): void {
    this.dataStreamSubscription.unsubscribe();
  }

  reset() {
    // TODO: Set initial values
  }

  load(activity: any) {
    this.reset();

    if (!activity) {
      return;
    }

    console.log('received activity', activity);
    // TODO: Set values based on activity
  }

  setProgress(inProgress: boolean, progress: number): void {
    this.inProgress$.next(inProgress);
    this.progress$.next(progress);
  }

  buildPayload([message, attachment, nsfw, monetization, tags, schedule]) {
    this.payload = {
      message: message || '',
      wire_threshold: monetization || null,
      time_created: schedule || null,
      is_rich: 0, // TODO
      title: '', // TODO
      description: '', // TODO
      thumbnail: '', // TODO
      url: '', // TODO
      attachment_guid: attachment || null,
      mature: nsfw && nsfw.length > 0,
      access_id: 2, // TODO (group GUID)
      container_guid: null, // TODO (group GUID)
      nsfw: nsfw || [],
      tags: tags,
    };
  }

  async post(): Promise<any> {
    // TODO: Return type!

    // TODO: Post
    console.log(this.payload);

    // TODO: Return an activity
  }
}

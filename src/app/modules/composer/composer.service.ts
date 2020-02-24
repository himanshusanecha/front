import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, tap } from 'rxjs/operators';
import { AttachmentApiService } from '../../common/api/attachment-api.service';

export type MessageSubjectValue = string;

export type AttachmentSubjectValue = File | null;

export type NsfwSubjectValue = Array<number>;

export type MonetizationSubjectValue = any;

export type TagsSubjectValue = Array<string>;

export type ScheduleSubjectValue = number | null;

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

  readonly attachmentError$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  protected payload: any = null;

  protected readonly dataStreamSubscription: Subscription;

  constructor(protected attachmentApi: AttachmentApiService) {
    this.dataStreamSubscription = combineLatest([
      this.message$.pipe(distinctUntilChanged()),
      this.attachment$.pipe(
        distinctUntilChanged(),
        tap(_ => this.attachmentError$.next('')),
        this.attachmentApi.fileToGuid(
          (inProgress, progress) => this.setProgress(inProgress, progress),
          e => {
            console.error('Composer:Attachment', e); // Ensure Sentry knows
            this.attachmentError$.next(
              (e && e.message) || 'There was an issue uploading your file'
            );
          }
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
    this.message$.next('');
    this.attachment$.next(null);
    this.nsfw$.next([]);
    this.monetization$.next(null);
    this.tags$.next([]);
    this.schedule$.next(null);
    this.inProgress$.next(false);
    this.progress$.next(0);
    this.attachmentError$.next('');
  }

  load(activity: any) {
    this.reset();

    if (!activity) {
      return;
    }

    console.log('received activity', activity);
    // TODO: Set values based on activity
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
      tags: tags || [],
    };
  }

  setProgress(inProgress: boolean, progress: number): void {
    this.inProgress$.next(inProgress);
    this.progress$.next(progress);
  }

  async post(): Promise<any> {
    // TODO: Return type!

    // TODO: Post
    console.log(this.payload);

    // TODO: Return an activity
  }
}

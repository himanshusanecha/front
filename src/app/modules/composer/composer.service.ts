import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AttachmentApiService } from '../../common/api/attachment-api.service';
import { ApiResponse, ApiService } from '../../common/api/api.service';

export type MessageSubjectValue = string;

export type AttachmentSubjectValue = File | null;

export type NsfwSubjectValue = Array<number>;

export type MonetizationSubjectValue = any;

export type TagsSubjectValue = Array<string>;

export type ScheduleSubjectValue = number | null;

export interface PreviewResource {
  source: 'none' | 'local' | 'guid' | 'rich-embed';
  sourceType?: 'image' | 'video';
  payload?: any;
}

export interface Data {
  message: MessageSubjectValue;
  attachment: AttachmentSubjectValue;
  nsfw: NsfwSubjectValue;
  monetization: MonetizationSubjectValue;
  tags: TagsSubjectValue;
  schedule: ScheduleSubjectValue;
}

@Injectable()
export class ComposerService implements OnDestroy {
  // Data Subjects

  readonly message$: BehaviorSubject<MessageSubjectValue> = new BehaviorSubject<
    MessageSubjectValue
  >('');

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

  readonly attachment$: BehaviorSubject<
    AttachmentSubjectValue
  > = new BehaviorSubject<AttachmentSubjectValue>(null);

  // State Subjects

  readonly preview$: BehaviorSubject<PreviewResource> = new BehaviorSubject<
    PreviewResource
  >({
    source: 'none',
  });

  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  readonly progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  readonly attachmentError$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  // Data and its payload builder subscription

  readonly data$: Observable<Data>;

  protected readonly dataSubscription: Subscription;

  protected payload: any = null;

  /**
   * Sets up data observable and its subscription
   *
   * @param attachmentApi
   * @param api
   */
  constructor(
    protected attachmentApi: AttachmentApiService,
    protected api: ApiService
  ) {
    // Setup data stream

    this.data$ = combineLatest([
      this.message$.pipe(distinctUntilChanged()),
      this.nsfw$, // TODO: Implement custom distinctUntilChanged comparison
      this.monetization$, // TODO: Implement custom distinctUntilChanged comparison
      this.tags$, // TODO: Implement custom distinctUntilChanged comparison
      this.schedule$, // TODO: Implement custom distinctUntilChanged comparison
      this.attachment$.pipe(
        // Only react to attachment changes from previous values (string -> File -> null -> File -> ...)
        distinctUntilChanged(),

        // On every attachment change:
        tap(file => {
          // - Reset attachment error string
          this.attachmentError$.next('');

          // - Set the preview based the current value (Blob URL or empty)
          this.setPreview(this.buildLocalPreviewResource(file));
        }),

        // Upload attachment to server, receive events as callbacks, return GUID when completed
        this.attachmentApi.fileToGuid(
          // - Update inProgress and progress state subjects
          (inProgress, progress) => this.setProgress(inProgress, progress),

          // - Handle errors and update attachmentErrors subject
          e => {
            console.error('Composer:Attachment', e); // Ensure Sentry knows
            this.attachmentError$.next(
              (e && e.message) || 'There was an issue uploading your file'
            );
          }
        )

        // Value for this attachment$ pipe will be either a string holding the GUID or null
      ),
    ]).pipe(
      map(
        // Create an JSON object based on an array of Subject values
        ([message, nsfw, monetization, tags, schedule, attachment]) => ({
          message,
          nsfw,
          monetization,
          tags,
          schedule,
          attachment,
        })
      )
    );

    // Subscribe to data stream and re-build API payload when it changes

    this.dataSubscription = this.data$.subscribe(data =>
      this.buildPayload(data)
    );
  }

  /**
   * Runs when dependant component is destroyed
   */
  ngOnDestroy(): void {
    this.tearDown();
  }

  /**
   * Destroys the service and its state
   */
  tearDown(): void {
    // Reset state and free resources
    this.reset();

    // Unsubscribe to data stream
    this.dataSubscription.unsubscribe();
  }

  /**
   * Resets composer data and state
   */
  reset(): void {
    // Reset data
    this.message$.next('');
    this.nsfw$.next([]);
    this.monetization$.next(null);
    this.tags$.next([]);
    this.schedule$.next(null);
    this.attachment$.next(null);

    // Reset state
    this.inProgress$.next(false);
    this.progress$.next(0);
    this.attachmentError$.next('');

    // Reset preview (state + blob URL)
    this.setPreview({
      source: 'none',
    });
  }

  /**
   * Loads an activity from API payload
   *
   * @param activity
   */
  load(activity: any) {
    if (!activity) {
      return;
    }

    this.reset();

    this.message$.next(activity.message || '');
    this.nsfw$.next(activity.nsfw || []);
    this.monetization$.next(activity.wire_threshold || null);
    this.tags$.next(activity.tags || []);
    this.schedule$.next(null /* TODO: Allow editing schedule time */);
    this.attachment$.next(null /* TODO: Allow editing attachments */);
  }

  /**
   * Updates the preview. Frees resources, if needed.
   * @param previewResource
   */
  setPreview(previewResource: PreviewResource) {
    this.freePreviewResources();
    this.preview$.next(previewResource);
  }

  protected buildLocalPreviewResource(file: File | null): PreviewResource {
    if (!file) {
      return {
        source: 'none',
      };
    }

    return {
      source: 'local',
      sourceType: /image\/.+/.test(file.type)
        ? 'image'
        : /video\/.+/.test(file.type)
        ? 'video'
        : void 0,
      payload: URL.createObjectURL(file),
    };
  }

  /**
   * Free preview resources
   *
   * @private
   */
  protected freePreviewResources() {
    const oldPreviewResource = this.preview$.getValue();

    if (oldPreviewResource && oldPreviewResource.source === 'local') {
      try {
        URL.revokeObjectURL(oldPreviewResource.payload);
      } catch (e) {
        console.warn('Composer:Preview', e);
      }
    }
  }

  /**
   * Builds the API payload and sets to a property
   * @param message
   * @param attachment
   * @param nsfw
   * @param monetization
   * @param tags
   * @param schedule
   */
  buildPayload({
    message,
    attachment,
    nsfw,
    monetization,
    tags,
    schedule,
  }: Data) {
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

  /**
   * Sets the current progress state
   *
   * @param inProgress
   * @param progress
   * @private
   */
  setProgress(inProgress: boolean, progress: number = 1): void {
    this.inProgress$.next(inProgress);
    this.progress$.next(progress);
  }

  /**
   *
   */
  async post(): Promise<any> {
    // TODO: Return type!
    // TODO: Edit mode!

    this.setProgress(true);

    const { activity } = await this.api
      .post(`api/v1/newsfeed`, this.payload)
      .toPromise();

    this.setProgress(false);

    activity.boostToggle = true;
    return activity;
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import {
  AttachmentApiService,
  fileToGuid,
} from '../../common/api/attachment-api.service';
import { ApiService } from '../../common/api/api.service';

export type MessageSubjectValue = string;

export const DEFAULT_MESSAGE_VALUE: MessageSubjectValue = '';

export type AttachmentSubjectValue = File | null;

export const DEFAULT_TITLE_VALUE: MessageSubjectValue = null;

export type TitleSubjectValue = string | null;

export const DEFAULT_ATTACHMENT_VALUE: AttachmentSubjectValue = null;

export type AttachmentGuidMappedValue = string | null;

export type NsfwSubjectValue = Array<number>;

export const DEFAULT_NSFW_VALUE: NsfwSubjectValue = [];

export type MonetizationSubjectValue = { type: string; min: number } | null;

export const DEFAULT_MONETIZATION_VALUE: MonetizationSubjectValue = null;

export type TagsSubjectValue = Array<string>;

export const DEFAULT_TAGS_VALUE: TagsSubjectValue = [];

export type ScheduleSubjectValue = number | null;

export const DEFAULT_SCHEDULE_VALUE: ScheduleSubjectValue = null;

export type AccessIdSubjectValue = string;

export const DEFAULT_ACCESS_ID_VALUE: AccessIdSubjectValue = '2';

export type LicenseSubjectValue = string;

export const DEFAULT_LICENSE_VALUE: LicenseSubjectValue = 'all-rights-reserved';

export interface PreviewResource {
  source: 'none' | 'local' | 'guid' | 'rich-embed';
  sourceType?: 'image' | 'video';
  payload?: any;
}

export interface Data {
  message: MessageSubjectValue;
  title: TitleSubjectValue;
  nsfw: NsfwSubjectValue;
  monetization: MonetizationSubjectValue;
  tags: TagsSubjectValue;
  schedule: ScheduleSubjectValue;
  accessId: AccessIdSubjectValue;
  license: LicenseSubjectValue;
  attachmentGuid: AttachmentGuidMappedValue;
}

@Injectable()
export class ComposerService implements OnDestroy {
  // Data Subjects

  readonly message$: BehaviorSubject<MessageSubjectValue> = new BehaviorSubject<
    MessageSubjectValue
  >(DEFAULT_MESSAGE_VALUE);

  readonly title$: BehaviorSubject<TitleSubjectValue> = new BehaviorSubject<
    TitleSubjectValue
  >(DEFAULT_TITLE_VALUE);

  readonly nsfw$: BehaviorSubject<NsfwSubjectValue> = new BehaviorSubject<
    NsfwSubjectValue
  >(DEFAULT_NSFW_VALUE);

  readonly monetization$: BehaviorSubject<
    MonetizationSubjectValue
  > = new BehaviorSubject<MonetizationSubjectValue>(DEFAULT_MONETIZATION_VALUE);

  readonly tags$: BehaviorSubject<TagsSubjectValue> = new BehaviorSubject<
    TagsSubjectValue
  >(DEFAULT_TAGS_VALUE);

  readonly schedule$: BehaviorSubject<
    ScheduleSubjectValue
  > = new BehaviorSubject<ScheduleSubjectValue>(DEFAULT_SCHEDULE_VALUE);

  readonly accessId$: BehaviorSubject<
    AccessIdSubjectValue
  > = new BehaviorSubject<AccessIdSubjectValue>(DEFAULT_ACCESS_ID_VALUE);

  readonly license$: BehaviorSubject<LicenseSubjectValue> = new BehaviorSubject<
    LicenseSubjectValue
  >(DEFAULT_LICENSE_VALUE);

  readonly attachment$: BehaviorSubject<
    AttachmentSubjectValue
  > = new BehaviorSubject<AttachmentSubjectValue>(DEFAULT_ATTACHMENT_VALUE);

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

  readonly canPost$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // Data and its payload builder subscription

  readonly data$: Observable<Data>;

  protected readonly dataSubscription: Subscription;

  protected containerGuid: string | null = null;

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

    this.data$ = combineLatest<
      [
        MessageSubjectValue,
        TitleSubjectValue,
        NsfwSubjectValue,
        MonetizationSubjectValue,
        TagsSubjectValue,
        ScheduleSubjectValue,
        AccessIdSubjectValue,
        LicenseSubjectValue,
        AttachmentGuidMappedValue
      ]
    >([
      this.message$.pipe(distinctUntilChanged()),
      this.title$.pipe(distinctUntilChanged()),
      this.nsfw$, // TODO: Implement custom distinctUntilChanged comparison
      this.monetization$, // TODO: Implement custom distinctUntilChanged comparison
      this.tags$, // TODO: Implement custom distinctUntilChanged comparison
      this.schedule$, // TODO: Implement custom distinctUntilChanged comparison
      this.accessId$.pipe(
        distinctUntilChanged(),
        tap(accessId => {
          if (this.containerGuid && this.containerGuid !== accessId) {
            console.warn(
              "Access ID will be overriden by container's GUID",
              this.containerGuid
            );
          }
        })
      ),
      this.license$.pipe(distinctUntilChanged()),
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
        fileToGuid(
          // - Upload
          file => this.attachmentApi.upload(file),

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
        ([
          message,
          title,
          nsfw,
          monetization,
          tags,
          schedule,
          accessId,
          license,
          attachmentGuid,
        ]) => ({
          message,
          title,
          nsfw,
          monetization,
          tags,
          schedule,
          accessId,
          license,
          attachmentGuid,
        })
      ),
      tap(values => {
        this.canPost$.next(Boolean(values.message || values.attachmentGuid));
      })
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

  setContainerGuid(containerGuid: string | null) {
    this.containerGuid = containerGuid || null;
    return this;
  }

  getContainerGuid(): string | null {
    return this.containerGuid || null;
  }

  /**
   * Resets composer data and state
   */
  reset(): void {
    // Reset data
    this.message$.next(DEFAULT_MESSAGE_VALUE);
    this.title$.next(DEFAULT_TITLE_VALUE);
    this.nsfw$.next(DEFAULT_NSFW_VALUE);
    this.monetization$.next(DEFAULT_MONETIZATION_VALUE);
    this.tags$.next(DEFAULT_TAGS_VALUE);
    this.schedule$.next(DEFAULT_SCHEDULE_VALUE);
    this.accessId$.next(DEFAULT_ACCESS_ID_VALUE);
    this.license$.next(DEFAULT_LICENSE_VALUE);
    this.attachment$.next(DEFAULT_ATTACHMENT_VALUE);

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

    this.message$.next(activity.message || DEFAULT_MESSAGE_VALUE);
    this.title$.next(activity.title || DEFAULT_TITLE_VALUE);
    this.nsfw$.next(activity.nsfw || DEFAULT_NSFW_VALUE);
    this.monetization$.next(
      activity.wire_threshold || DEFAULT_MONETIZATION_VALUE
    );
    this.tags$.next(activity.tags || DEFAULT_TAGS_VALUE);
    this.schedule$.next(
      DEFAULT_SCHEDULE_VALUE /* TODO: Allow editing schedule time */
    );
    this.attachment$.next(
      DEFAULT_ATTACHMENT_VALUE /* TODO: Allow editing attachments */
    );
    this.accessId$.next(activity.accessId || DEFAULT_ACCESS_ID_VALUE);

    if (typeof activity.containerGuid !== 'undefined') {
      this.setContainerGuid(activity.containerGuid);
    }
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
    title,
    nsfw,
    monetization,
    tags,
    schedule,
    accessId,
    license,
    attachmentGuid,
  }: Data) {
    if (this.containerGuid) {
      // Override accessId if there's a container set
      accessId = this.containerGuid;
    }

    this.payload = {
      message: message || '',
      wire_threshold: monetization || null,
      time_created: schedule || null,
      is_rich: 0, // TODO
      title: title || '',
      description: '', // TODO
      thumbnail: '', // TODO
      url: '', // TODO
      attachment_guid: attachmentGuid || null,
      mature: nsfw && nsfw.length > 0,
      nsfw: nsfw || [],
      tags: tags || [],
      access_id: accessId,
      attachment_license: license,
      license: license, // TODO: Implement on engine
      container_guid: this.containerGuid || null,
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

    this.reset();
    this.setProgress(false);

    activity.boostToggle = true;
    return activity;
  }
}

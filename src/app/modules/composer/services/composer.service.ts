import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, scan, tap } from 'rxjs/operators';
import { ApiService } from '../../../common/api/api.service';
import { ActivityEntity } from '../../newsfeed/activity/activity.service';
import { createUrlRegex } from '../../../helpers/url-regex';
import { RichEmbed, RichEmbedService } from './rich-embed.service';
import { AttachmentService } from './attachment.service';

/**
 * Media resource types
 */
export type ResourceSourceType = 'image' | 'video';

/**
 * Media resource preview
 */
export interface PreviewResource {
  source: 'none' | 'local' | 'guid';
  sourceType?: ResourceSourceType;
  payload?: any;
}

/**
 * Media resource GUID wrapper
 */
export class ResourceGuid {
  constructor(protected type: ResourceSourceType, protected guid: string) {}

  getType() {
    return this.type;
  }

  getGuid() {
    return this.guid;
  }
}

/**
 * Message value type
 */
export type MessageSubjectValue = string;

/**
 * Default message value
 */
export const DEFAULT_MESSAGE_VALUE: MessageSubjectValue = '';

/**
 * Title value type
 */
export type TitleSubjectValue = string | null;

/**
 * Default title value
 */
export const DEFAULT_TITLE_VALUE: MessageSubjectValue = null;

/**
 * Attachment value type
 */
export type AttachmentSubjectValue = File | ResourceGuid | null;

/**
 * Attachment resolved GUID value (used for payload)
 */
export type AttachmentGuidMappedValue = string | null;

/**
 * Default attachment value
 */
export const DEFAULT_ATTACHMENT_VALUE: AttachmentSubjectValue = null;

/**
 * Rich embed value type
 */
export type RichEmbedSubjectValue = RichEmbed | string | null;

/**
 * Rich embed resolved object value (used for payload)
 */
export type RichEmbedMetadataMappedValue = RichEmbed | null;

/**
 * Default rich embed value
 */
export const DEFAULT_RICH_EMBED_VALUE: RichEmbedSubjectValue = null;

/**
 * NSFW value type
 */
export type NsfwSubjectValue = Array<number>;

/**
 * Default NSFW value
 */
export const DEFAULT_NSFW_VALUE: NsfwSubjectValue = [];

/**
 * Monetization value type
 */
export type MonetizationSubjectValue = { type: string; min: number } | null;

/**
 * Default monetization value
 */
export const DEFAULT_MONETIZATION_VALUE: MonetizationSubjectValue = null;

/**
 * Tags value type
 */
export type TagsSubjectValue = Array<string>;

/**
 * Default tags value
 */
export const DEFAULT_TAGS_VALUE: TagsSubjectValue = [];

/**
 * Schedule value type
 */
export type ScheduleSubjectValue = number | null;

/**
 * Default schedule value
 */
export const DEFAULT_SCHEDULE_VALUE: ScheduleSubjectValue = null;

/**
 * Access ID value type
 */
export type AccessIdSubjectValue = string;

/**
 * Default access ID value
 */
export const DEFAULT_ACCESS_ID_VALUE: AccessIdSubjectValue = '2';

/**
 * License value type
 */
export type LicenseSubjectValue = string;

/**
 * Default license value
 */
export const DEFAULT_LICENSE_VALUE: LicenseSubjectValue = 'all-rights-reserved';

/**
 * Payload data object. Used to build the DTO
 */
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
  richEmbed: RichEmbedMetadataMappedValue;
}

/**
 * Store/process class for activities composer. As it's used as a store it should be injected individually
 * on the components that require it using `providers` array.
 */
@Injectable()
export class ComposerService implements OnDestroy {
  /**
   * Message subject
   */
  readonly message$: BehaviorSubject<MessageSubjectValue> = new BehaviorSubject<
    MessageSubjectValue
  >(DEFAULT_MESSAGE_VALUE);

  /**
   * Title subject
   */
  readonly title$: BehaviorSubject<TitleSubjectValue> = new BehaviorSubject<
    TitleSubjectValue
  >(DEFAULT_TITLE_VALUE);

  /**
   * NSFW subject
   */
  readonly nsfw$: BehaviorSubject<NsfwSubjectValue> = new BehaviorSubject<
    NsfwSubjectValue
  >(DEFAULT_NSFW_VALUE);

  /**
   * Monetization subject
   */
  readonly monetization$: BehaviorSubject<
    MonetizationSubjectValue
  > = new BehaviorSubject<MonetizationSubjectValue>(DEFAULT_MONETIZATION_VALUE);

  /**
   * Tags subject
   */
  readonly tags$: BehaviorSubject<TagsSubjectValue> = new BehaviorSubject<
    TagsSubjectValue
  >(DEFAULT_TAGS_VALUE);

  /**
   * Schedule subject
   */
  readonly schedule$: BehaviorSubject<
    ScheduleSubjectValue
  > = new BehaviorSubject<ScheduleSubjectValue>(DEFAULT_SCHEDULE_VALUE);

  /**
   * Access ID subject
   */
  readonly accessId$: BehaviorSubject<
    AccessIdSubjectValue
  > = new BehaviorSubject<AccessIdSubjectValue>(DEFAULT_ACCESS_ID_VALUE);

  /**
   * License subject
   */
  readonly license$: BehaviorSubject<LicenseSubjectValue> = new BehaviorSubject<
    LicenseSubjectValue
  >(DEFAULT_LICENSE_VALUE);

  /**
   * Attachment subject
   */
  readonly attachment$: BehaviorSubject<
    AttachmentSubjectValue
  > = new BehaviorSubject<AttachmentSubjectValue>(DEFAULT_ATTACHMENT_VALUE);

  /**
   * Rich embed subject
   */
  readonly richEmbed$: BehaviorSubject<
    RichEmbedSubjectValue
  > = new BehaviorSubject<RichEmbedSubjectValue>(DEFAULT_RICH_EMBED_VALUE);

  /**
   * Preview subject (state)
   */
  readonly preview$: BehaviorSubject<PreviewResource> = new BehaviorSubject<
    PreviewResource
  >({
    source: 'none',
  });

  /**
   * In progress flag subject (state)
   */
  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Current progress subject (state)
   */
  readonly progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Attachment error subject (state)
   */
  readonly attachmentError$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  /**
   * Post-ability check subject (state)
   */
  readonly canPost$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Is this an edit operation? (state)
   */
  readonly isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Data structure observable
   */
  readonly data$: Observable<Data>;

  /**
   * Subscription to data structure observable
   */
  protected readonly dataSubscription: Subscription;

  /**
   * Subscription to a rich embed extractor observable
   */
  protected readonly richEmbedExtractorSubscription: Subscription;

  /**
   * Container GUID for this instance
   */
  protected containerGuid: string | null = null;

  /**
   * If we're editing, this holds a clone of the original activity
   */
  protected originalSource: any = null;

  /**
   * Current payload to be consumed by DTO builder
   */
  protected payload: any = null;

  /**
   * Sets up data observable and its subscription
   *
   * @param api
   * @param attachment
   * @param richEmbed
   */
  constructor(
    protected api: ApiService,
    protected attachment: AttachmentService,
    protected richEmbed: RichEmbedService
  ) {
    // Setup data stream using the latest subject values
    // This should emit whenever any subject changes.

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
        AttachmentGuidMappedValue,
        RichEmbedMetadataMappedValue
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
          // This will trigger a warning about an illegal access ID operation
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
          this.setPreview(this.buildPreviewResource(file));
        }),

        // Call the engine endpoints to upload the file
        this.attachment.resolve(
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
      this.richEmbed$.pipe(
        // Only react to rich-embed URL changes
        distinctUntilChanged(),

        // Call the engine endpoint to resolve the URL, debouncing the request to avoid server overload
        this.richEmbed.resolve(200)
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
          richEmbed,
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
          richEmbed,
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

    // Subscribe to message and rich embed in order to know if a URL should be extracted

    this.richEmbedExtractorSubscription = combineLatest([
      this.message$.pipe(distinctUntilChanged()),
      this.richEmbed$.pipe(distinctUntilChanged()),
    ]).subscribe(([message, richEmbed]) => {
      if (
        !richEmbed ||
        typeof richEmbed === 'string' ||
        !richEmbed.entityGuid
      ) {
        // Extract rich embed from URL when:
        // a) there's no rich embed already set; or
        // b) rich embed's type is a string (locally extracted); or
        // c) loaded activity don't have the entity GUID set (which mean is a blog)
        this.extractRichEmbed(message);
      }
    });
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

    // Unsubscribe from rich embed extractor
    this.richEmbedExtractorSubscription.unsubscribe();
  }

  /**
   * Sets the container GUID for this instance
   * @param containerGuid
   */
  setContainerGuid(containerGuid: string | null) {
    this.containerGuid = containerGuid || null;
    return this;
  }

  /**
   * Gets the container GUID for this instance
   */
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
    this.isEditing$.next(false);

    // Reset preview (state + blob URL)
    this.setPreview({
      source: 'none',
    });

    // Reset original source
    this.originalSource = null;
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

    // Save a clone of the original activity that was loaded
    this.originalSource = JSON.parse(JSON.stringify(activity));

    // Build the fields
    const message = activity.message || DEFAULT_MESSAGE_VALUE;
    const title = activity.title || DEFAULT_TITLE_VALUE;
    const nsfw = activity.nsfw || DEFAULT_NSFW_VALUE;
    const monetization = activity.wire_threshold || DEFAULT_MONETIZATION_VALUE;
    const tags = activity.tags || DEFAULT_TAGS_VALUE;
    const schedule =
      activity.time_created && activity.time_created * 1000 > Date.now() + 15000
        ? activity.time_created
        : null;
    const accessId =
      activity.access_id !== null
        ? activity.access_id
        : DEFAULT_ACCESS_ID_VALUE;
    const license = activity.license || DEFAULT_LICENSE_VALUE;

    // Build attachment and rich embed data structure

    let attachmentResourceGuid = DEFAULT_ATTACHMENT_VALUE;

    let richEmbed = DEFAULT_RICH_EMBED_VALUE;

    if (activity.custom_type === 'batch') {
      attachmentResourceGuid = new ResourceGuid('image', activity.entity_guid);

      this.setPreview({
        source: 'guid',
        sourceType: attachmentResourceGuid.getType(),
        payload: attachmentResourceGuid.getGuid(),
      });
    } else if (activity.custom_type === 'video') {
      attachmentResourceGuid = new ResourceGuid('video', activity.entity_guid);

      this.setPreview({
        source: 'guid',
        sourceType: attachmentResourceGuid.getType(),
        payload: attachmentResourceGuid.getGuid(),
      });
    } else if (activity.entity_guid || activity.perma_url) {
      // Rich embeds (blogs included)
      richEmbed = {
        entityGuid: activity.entity_guid || null,
        url: activity.perma_url,
        title: activity.title || '',
        description: activity.blurb || '',
        thumbnail: activity.thumbnail_src || '',
      };
    }

    // Priority service state elements

    this.attachment$.next(attachmentResourceGuid);
    this.richEmbed$.next(richEmbed);

    // Apply them to the service state

    this.message$.next(message);
    this.title$.next(title);
    this.nsfw$.next(nsfw);
    this.monetization$.next(monetization);
    this.tags$.next(tags);
    this.schedule$.next(schedule);
    this.accessId$.next(accessId);
    this.license$.next(license);

    // Define custom container if different than owner (groups)

    if (
      typeof activity.container_guid !== 'undefined' &&
      activity.container_guid !== activity.owner_guid
    ) {
      this.setContainerGuid(activity.containerGuid);
    }

    this.isEditing$.next(true);
  }

  /**
   * Updates the preview. Frees resources, if needed.
   * @param previewResource
   */
  setPreview(previewResource: PreviewResource) {
    this.freePreviewResources();
    this.preview$.next(previewResource);
  }

  /**
   * Builds the local preview resource for assets that weren't uploaded yet
   * @param file
   */
  protected buildPreviewResource(
    file: File | ResourceGuid | null
  ): PreviewResource {
    if (!file) {
      return {
        source: 'none',
      };
    } else if (file instanceof File) {
      return {
        source: 'local',
        sourceType: /image\/.+/.test(file.type)
          ? 'image'
          : /video\/.+/.test(file.type)
          ? 'video'
          : void 0,
        payload: URL.createObjectURL(file),
      };
    } else if (file instanceof ResourceGuid) {
      return {
        source: 'guid',
        sourceType: file.getType(),
        payload: file.getGuid(),
      };
    }

    throw new Error('Invalid preview resource source');
  }

  /**
   * Extracts the rich embed from a string body
   * @param body
   */
  protected extractRichEmbed(body: string) {
    const matches = body.match(createUrlRegex());
    this.richEmbed$.next(matches ? matches[0] : '');
  }

  /**
   * Free preview resources
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
   * Deletes the current attachment, if any
   */
  removeAttachment() {
    const payload = this.payload;

    // Clean up attachment ONLY if the new entity GUID is different from the original source, if any
    if (payload.entity_guid && !this.isOriginalEntity(payload.entity_guid)) {
      this.attachment.prune(payload.entity_guid);
    }

    this.attachment$.next(null);
  }

  /**
   * Used to prevent original entity deletion when editing an activity. That operation is handled in the engine.
   * @param entityGuid
   */
  protected isOriginalEntity(entityGuid): boolean {
    if (
      !this.originalSource ||
      typeof this.originalSource.entity_guid === 'undefined'
    ) {
      return false;
    }

    return entityGuid === this.originalSource.entity_guid;
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
    richEmbed,
  }: Data) {
    if (this.containerGuid) {
      // Override accessId if there's a container set
      accessId = this.containerGuid;
    }

    this.payload = {
      ...(this.originalSource || {}),
      message: message || '',
      wire_threshold: monetization || null,
      paywall: Boolean(monetization),
      time_created: schedule || null,
      is_rich: false,
      title: '',
      description: '',
      thumbnail: '',
      url: '',
      entity_guid: null,
      entity_guid_update: false,
      mature: nsfw && nsfw.length > 0,
      nsfw: nsfw || [],
      tags: tags || [],
      access_id: accessId,
      license: license,
      container_guid: this.containerGuid || null,
    };

    if (attachmentGuid) {
      this.payload.entity_guid = attachmentGuid;
      this.payload.title = title;
      this.payload.entity_guid_update = true;
    } else if (richEmbed) {
      this.payload.is_rich = true;
      this.payload.url = richEmbed.url;
      this.payload.entity_guid = richEmbed.entityGuid;
      this.payload.title = richEmbed.title;
      this.payload.description = richEmbed.description;
      this.payload.thumbnail = richEmbed.thumbnail;

      if (!this.isOriginalEntity(attachmentGuid)) {
        this.payload.entity_guid_update = true;
      }
    }
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
   * Posts a new activity
   */
  async post(): Promise<ActivityEntity> {
    this.setProgress(true);

    // New activity
    let endpoint = `api/v1/newsfeed`;

    if (this.payload.guid) {
      // Editing an activity
      endpoint = `api/v1/newsfeed/${this.payload.guid}`;
    }

    const { activity } = await this.api
      .post(endpoint, this.payload)
      .toPromise();

    this.reset();
    this.setProgress(false);

    activity.boostToggle = true;
    return activity;
  }
}

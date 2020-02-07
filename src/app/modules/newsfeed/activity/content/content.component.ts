import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import {
  ActivityService,
  ActivityEntity,
  ACTIVITY_FIXED_HEIGHT_RATIO,
  ACTIVITY_FIXED_HEIGHT_HEIGHT,
  ACTIVITY_OWNERBLOCK_HEIGHT,
  ACTIVITY_FIXED_HEIGHT_WIDTH,
  ACTIVITY_COMMENTS_POSTER_HEIGHT,
  ACTIVITY_TOOLBAR_HEIGHT,
  ACTIVITY_COMMENTS_MORE_HEIGHT,
  ACTIVITY_CONTENT_PADDING,
} from '../activity.service';
import { ConfigsService } from '../../../../common/services/configs.service';
import { Session } from '../../../../services/session';
import { MindsUser, MindsGroup } from '../../../../interfaces/entities';
import { OverlayModalService } from '../../../../services/ux/overlay-modal';
import { MediaModalComponent } from '../../../media/modal/modal.component';
import { ActivityRemindComponent } from '../remind/remind.component';
import { delay } from 'q';

@Component({
  selector: 'm-activity__content',
  templateUrl: 'content.component.html',
})
export class ActivityContentComponent {
  @ViewChild('mediaEl', { static: false, read: ElementRef })
  mediaEl: ElementRef;

  @ViewChild('messageEl', { static: false, read: ElementRef })
  messageEl: ElementRef;

  @ViewChild('mediaDesciptionEl', { static: false, read: ElementRef })
  mediaDescriptionEl: ElementRef;

  maxFixedHeightContent: number = 750 * ACTIVITY_FIXED_HEIGHT_RATIO;
  activityHeight: number;
  remindWidth: number;
  remindHeight: number;

  private entitySubscription: Subscription;
  private activityHeightSubscription: Subscription;

  entity: ActivityEntity;

  constructor(
    public service: ActivityService,
    private overlayModal: OverlayModalService,
    private router: Router,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.entitySubscription = this.service.entity$.subscribe(
      (entity: ActivityEntity) => {
        this.entity = entity;
        this.calculateFixedContentHeight();
      }
    );
    this.activityHeightSubscription = this.service.height$.subscribe(
      (height: number) => {
        this.activityHeight = height;
        this.calculateRemindHeight();
      }
    );
  }

  ngAfterViewInit() {
    // Run after view initialized
    timer(0)
      .toPromise()
      .then(() => this.calculateRemindHeight());
  }

  ngOnDestroy() {
    this.entitySubscription.unsubscribe();
    this.activityHeightSubscription.unsubscribe();
  }

  get message(): string {
    return this.entity.message || this.entity.title;
  }

  get isRichEmbed(): boolean {
    return !!this.entity.perma_url;
  }

  get mediaDescription(): string {
    return this.entity.blurb
      ? this.entity.blurb + (this.entity.perma_url ? '...' : '')
      : '';
  }

  get isVideo(): boolean {
    return this.entity.custom_type == 'video';
  }

  get videoGuid(): string {
    return this.entity.entity_guid;
  }

  get isImage(): boolean {
    return (
      this.entity.custom_type == 'batch' ||
      (this.entity.thumbnail_src && !this.entity.perma_url)
    );
  }

  get imageUrl(): string {
    if (this.entity.custom_type) {
      return this.entity.custom_data[0].src;
    }

    if (this.entity.thumbnail_src) {
      return this.entity.thumbnail_src;
    }

    return ''; // TODO: placehol;der
  }

  get imageGuid(): string {
    return this.entity.entity_guid;
  }

  calculateFixedContentHeight(): void {
    let contentHeight = this.activityHeight || ACTIVITY_FIXED_HEIGHT_HEIGHT;
    contentHeight = contentHeight - ACTIVITY_CONTENT_PADDING;
    if (this.service.displayOptions.showOwnerBlock) {
      contentHeight = contentHeight - ACTIVITY_OWNERBLOCK_HEIGHT;
    }
    if (this.service.displayOptions.showToolbar) {
      contentHeight = contentHeight - ACTIVITY_TOOLBAR_HEIGHT;
    }
    if (this.service.displayOptions.showComments) {
      contentHeight = contentHeight - ACTIVITY_COMMENTS_POSTER_HEIGHT;
    }
    if (
      this.service.displayOptions.showComments &&
      this.entity['comments:count'] > 0
    ) {
      contentHeight = contentHeight - ACTIVITY_COMMENTS_MORE_HEIGHT;
    }

    this.maxFixedHeightContent = contentHeight;
  }

  @HostListener('window:resize')
  calculateRemindHeight(): void {
    if (!this.service.displayOptions.fixedHeight) return;
    const messageHeight = this.messageEl
      ? this.messageEl.nativeElement.clientHeight
      : 0;

    this.calculateFixedContentHeight();

    let maxFixedHeightContent = this.maxFixedHeightContent;

    this.remindHeight = maxFixedHeightContent - messageHeight;

    //if (this.entity['remind_object'].)
    //this.remindWidth = this.remindHeight * ACTIVITY_FIXED_HEIGHT_RATIO;
  }

  onModalRequested(event: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.entity.modal_source_url = this.router.url;

    this.overlayModal
      .create(
        MediaModalComponent,
        { entity: this.entity },
        {
          class: 'm-overlayModal--media',
        }
      )
      .present();
  }

  onImageError(e: Event): void {}
}

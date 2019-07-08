import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { Client } from '../../../../services/api';
import { ActivityService } from '../../../../common/services/activity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'minds-button-comment',
  inputs: ['_object: object'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [ngClass]="{'selected': object['comments:count'] > 0 }">
      <i class="material-icons" *ngIf="allowComments">chat_bubble</i>
      <i class="material-icons" 
        *ngIf="!allowComments"
        title="Comments have been disabled for this post"
        i18n-title="@@COMMENTS__DISABLED">
        speaker_notes_off
      </i>
      <span class="minds-counter" *ngIf="object['comments:count'] > 0">{{object['comments:count'] | number}}</span>
    </a>
  `
})

export class CommentButton implements OnInit, OnDestroy {

  object;
  protected activityChangedSubscription: Subscription;
  protected allowComments = true;

  constructor(
    public client: Client,
    protected activityService: ActivityService,
    protected cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activityChangedSubscription = this.activityService.activityChanged.subscribe((payload) => {
      this.object = payload.entity;
      this.allowComments = this.object['allow_comments'];
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.activityChangedSubscription) {
      this.activityChangedSubscription.unsubscribe();
    }
  }

  set _object(value: any) {
    this.object = value;
    this.allowComments = this.object['allow_comments'];
  }

}

import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { ActivityService, ActivityEntity } from '../activity.service';
import { Session } from '../../../../services/session';
import { Router } from '@angular/router';
import { BoostCreatorComponent } from '../../../boost/creator/creator.component';
import { OverlayModalService } from '../../../../services/ux/overlay-modal';

@Component({
  selector: 'm-activity__toolbar',
  templateUrl: 'toolbar.component.html',
})
export class ActivityToolbarComponent {
  private entitySubscription: Subscription;

  entity: ActivityEntity;
  hideCommentsInputWhenCommentsCollapse: boolean = false;

  constructor(
    public service: ActivityService,
    public session: Session,
    private router: Router,
    private overlayModalService: OverlayModalService
  ) {}

  ngOnInit() {
    this.entitySubscription = this.service.entity$.subscribe(
      (entity: ActivityEntity) => {
        this.entity = entity;
      }
    );
  }

  ngOnDestroy() {
    this.entitySubscription.unsubscribe();
  }

  toggleComments(): void {
    const opts = this.service.displayOptions;

    if (opts.fixedHeight) {
      this.router.navigate([`/newsfeed/${this.entity.guid}`]);
      return;
    }
    console.log('onlycommetnsinptu', opts.showOnlyCommentsInput);
    console.log('showcomments', opts.showComments);

    // Pro tiles have comments AND comments input hidden by default
    if (!opts.showComments) {
      console.log('1 PRO show');
      this.hideCommentsInputWhenCommentsCollapse = true;
      // Pro tiles - show comments
      opts.showComments = true;
      opts.showOnlyCommentsInput = false;
    } else {
      if (this.hideCommentsInputWhenCommentsCollapse) {
        console.log('2 PRO hide');
        // Pro tiles - hide comments
        opts.showComments = false;
      } else {
        console.log('3 NORMAL toggle');
        // Normal newsfeed activities - toggle comments
        opts.showOnlyCommentsInput = !opts.showOnlyCommentsInput;
      }
    }
  }

  openBoostModal(e: MouseEvent): void {
    this.overlayModalService
      .create(BoostCreatorComponent, this.entity)
      .present();
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { Client } from '../../../services/api';
import { Session } from '../../../services/session';
import { OverlayModalService } from '../../../services/ux/overlay-modal';

@Component({
  selector: 'm-media--modal',
  templateUrl: 'modal.component.html'
})

export class MediaModalComponent implements OnInit {
  minds = window.Minds;
  entity: any = {};
  boosted: boolean;
  inProgress: boolean = true;
  expanded: boolean = false;


  @Input('entity') set data(entity) {
    this.entity = entity;
  }
  constructor(
    public session: Session,
    private overlayModal: OverlayModalService,
    private client: Client,
  ) {
  }

  ngOnInit() {
    console.log(this.entity);

    // TODO OJM verify this method
    // get entity_guid if coming from newsfeed. get guid if coming from media page
    const srcGuid = this.entity.entity_guid ? this.entity.entity_guid : this.entity.guid;
    this.entity.thumbnail = `${this.minds.cdn_url}fs/v1/thumbnail/${srcGuid}/xlarge`;

    this.boosted = this.entity.boosted || this.entity.p2p_boosted;


  }

  isUnlisted() {
    return this.entity.access_id === '0' || this.entity.access_id === 0;
  }

  getOwnerIconTime() {
    const session = this.session.getLoggedInUser();
    if (session && session.guid === this.entity.ownerObj.guid) {
      return session.icontime;
    } else {
      return this.entity.ownerObj.icontime;
    }
  }

  openFullscreen() {
    // TODO OJM
    // const elem = document.getElementById('m-media-modal__mediaWrapper');
    // if (elem.requestFullscreen) {
    //   elem.requestFullscreen();
    // }
    // else if (elem.mozRequestFullScreen) { /* Firefox */
    //   elem.mozRequestFullScreen();
    // } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    //   elem.webkitRequestFullscreen();
    // } else if (elem.msRequestFullscreen) { /* IE/Edge */
    //   elem.msRequestFullscreen();
    // }
    this.expanded = true;
  }

  closeFullscreen() {
    // TODO OJM
    // const elem = document.getElementById('m-media-modal__mediaWrapper');
    // if (elem.exitFullscreen) {
    //   elem.exitFullscreen();
    // }
    //  else if (elem.mozCancelFullScreen) { /* Firefox */
    //   elem.mozCancelFullScreen();
    // } else if (elem.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    //   elem.webkitExitFullscreen();
    // } else if (elem.msExitFullscreen) { /* IE/Edge */
    //   elem.msExitFullscreen();
    // }
    this.expanded = false;
  }

}


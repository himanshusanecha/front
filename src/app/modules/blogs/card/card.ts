import { Component } from '@angular/core';
import { Session } from '../../../services/session';
import { AttachmentService } from '../../../services/attachment';
import { ACCESS } from '../../../services/list-options';
import { Router } from '@angular/router';
import { MediaModalComponent } from '../../media/modal/modal.component';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { FeaturesService } from '../../../services/features.service';
import isMobile from '../../../helpers/is-mobile';

@Component({
  moduleId: module.id,
  selector: 'minds-card-blog',
  inputs: ['_blog : object'],
  templateUrl: 'card.html',
})
export class BlogCard {
  minds;
  blog;
  access = ACCESS;

  constructor(
    public session: Session,
    public attachment: AttachmentService,
    private router: Router,
    protected featuresService: FeaturesService,
    private overlayModal: OverlayModalService,
  ) {
    this.minds = window.Minds;
  }

  set _blog(value: any) {
    if (!value.thumbnail_src || !value.header_bg)
      value.thumbnail_src = 'assets/videos/earth-1/earth-1.png';
    this.blog = value;
  }

  showMediaModal() {
    const route = this.blog.route ? `/${this.blog.route}` : `/blog/view${this.blog.guid}`;
    const isNotTablet = Math.min(screen.width, screen.height) < 768;

    if (isMobile() && isNotTablet) {
      this.router.navigate([route]);
      return;
    }

    if (!this.featuresService.has('media-modal')) {
      this.router.navigate([route]);
      return;
    } else {
      this.blog.modal_source_url = this.router.url;

      this.overlayModal.create(MediaModalComponent, this.blog, {
        class: 'm-overlayModal--media'
      }).present();
    }
  }

}

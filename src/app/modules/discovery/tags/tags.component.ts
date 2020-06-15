import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoveryTagsService } from './tags.service';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { ActivatedRoute } from '@angular/router';

export interface TagsQueryParam {
  q: string;
}

@Component({
  selector: 'm-discovery__tags',
  templateUrl: './tags.component.html',
})
export class DiscoveryTagsComponent {
  tags$: Observable<any> = this.service.tags$;
  trending$: Observable<any> = this.service.trending$;
  inProgress$: Observable<boolean> = this.service.inProgress$;

  constructor(
    public route: ActivatedRoute,
    private service: DiscoveryTagsService,
    private overlayModal: OverlayModalService,
    private injector: Injector
  ) {}

  ngOnInit() {
    this.service.loadTags();
  }
}

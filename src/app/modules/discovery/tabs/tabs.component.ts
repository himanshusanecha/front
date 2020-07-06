import { Component, OnInit, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FeedsService } from '../../../common/services/feeds.service';

@Component({
  selector: 'm-discovery__tabs',
  templateUrl: './tabs.component.html',
})
export class DiscoveryTabsComponent {
  @Input() showSettingsButton = true;

  constructor(
    public route: ActivatedRoute,
    private feedsService: FeedsService
  ) {}
}

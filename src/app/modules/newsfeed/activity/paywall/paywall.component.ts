import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityService, ActivityEntity } from '../activity.service';
import { map } from 'rxjs/operators';
import { NSFW_REASONS } from '../../../../common/components/nsfw-selector/nsfw-selector.service';

@Component({
  selector: 'm-activity__paywall',
  templateUrl: './paywall.component.html',
})
export class ActivityPaywallComponent {
  @Input() mediaHeight: number | null = null;

  constructor(public service: ActivityService) {}

  onEntityUpdated(entity: ActivityEntity): void {
    this.service.setEntity(entity);
    this.service.paywallUnlockedEmitter.next(true);
  }
}

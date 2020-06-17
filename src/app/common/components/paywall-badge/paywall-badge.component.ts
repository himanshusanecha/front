import { Component, Input } from '@angular/core';
import { PaywallType } from '../../../modules/wire/lock-screen/wire-lock-screen.component';

@Component({
  selector: 'm-paywallBadge',
  templateUrl: './paywall-badge.component.html',
})
export class PaywallBadgeComponent {
  @Input() paywallType: PaywallType = 'custom';
  constructor() {}
}

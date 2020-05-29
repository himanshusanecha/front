import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-paywallBadge',
  templateUrl: './paywall-badge.component.html',
})
export class PaywallBadgeComponent {
  @Input() paywallType: 'plus' | 'tier' | 'ppv' = 'ppv';
  constructor() {}
}

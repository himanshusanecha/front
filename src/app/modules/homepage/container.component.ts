import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../../services/features.service';

@Component({
  selector: 'm-homepage__container',
  template: `
    <m-homepage *ngIf="!newHomepage; else newHomepageBlock"></m-homepage>
    <ng-template #newHomepageBlock>
      <m-homepage__v2></m-homepage__v2>
    </ng-template>
  `,
})
export class HomepageContainerComponent {
  minds = window.Minds;

  newHomepage: boolean = false;

  constructor(private featuresService: FeaturesService) {
    this.newHomepage = this.featuresService.has('homepage-and-onboarding');
  }
}

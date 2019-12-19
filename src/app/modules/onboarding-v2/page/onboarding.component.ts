import { Component } from '@angular/core';
import { Session } from '../../../services/session';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '../../../services/storage';
import { OnboardingV2Service } from '../service/onboarding.service';

@Component({
  selector: 'm-onboarding',
  templateUrl: 'onboarding.component.html',
})
export class OnboardingComponent {
  steps = [
    {
      name: 'Hashtags',
      selected: false,
    },
    {
      name: 'Info',
      selected: false,
    },
    {
      name: 'Groups',
      selected: false,
    },
    {
      name: 'Channels',
      selected: false,
    },
  ];
  showTitle: boolean = false;

  constructor(
    private session: Session,
    private router: Router,
    private storage: Storage,
    private route: ActivatedRoute,
    private onboardingService: OnboardingV2Service
  ) {
    route.url.subscribe(() => {
      const section: string = route.snapshot.firstChild.routeConfig.path;
      if (section === 'notice') {
        this.showTitle = false;
      } else {
        this.showTitle = true;

        for (const item of this.steps) {
          item.selected = item.name.toLowerCase() === section;
        }
        this.steps = this.steps.slice(0);
      }
    });

    if (!this.session.isLoggedIn()) {
      this.storage.set('redirect', 'onboarding');
      this.router.navigate(['/register']);
      return;
    }

    this.checkIfAlreadyOnboarded();
  }

  async checkIfAlreadyOnboarded() {
    if (!(await this.onboardingService.shouldShow())) {
      this.router.navigate(['/newsfeed/subscriptions']);
    }

    this.onboardingService.shown();
  }
}

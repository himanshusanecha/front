import { Component, OnInit } from '@angular/core';
import { Session } from '../../../services/session';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '../../../services/storage';

@Component({
  selector: 'm-onboarding',
  templateUrl: 'onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
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
    private route: ActivatedRoute
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
  }

  ngOnInit() {
    if (!this.session.isLoggedIn()) {
      this.storage.set('redirect', 'onboarding');
      this.router.navigate(['/register']);
    }
  }
}

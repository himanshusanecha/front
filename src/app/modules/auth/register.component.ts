import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { Navigation as NavigationService } from '../../services/navigation';
import { Client } from '../../services/api';
import { Session } from '../../services/session';
import { SignupModalService } from '../modals/signup/service';
import { LoginReferrerService } from '../../services/login-referrer.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { MindsTitle } from '../../services/ux/title';
import { FeaturesService } from '../../services/features.service';
import { V2TopbarService } from '../../common/layout/v2-topbar/v2-topbar.service';

@Component({
  selector: 'm-register',
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
  minds = window.Minds;
  errorMessage: string = '';
  twofactorToken: string = '';
  hideLogin: boolean = false;
  inProgress: boolean = false;
  videoError: boolean = false;
  referrer: string;
  @HostBinding('class.m-register__newDesign')
  newDesign: boolean = false;
  private redirectTo: string;

  flags = {
    canPlayInlineVideos: true,
  };

  paramsSubscription: Subscription;

  constructor(
    public client: Client,
    public router: Router,
    public route: ActivatedRoute,
    private modal: SignupModalService,
    private loginReferrer: LoginReferrerService,
    public session: Session,
    private onboarding: OnboardingService,
    public navigation: NavigationService,
    private featuresService: FeaturesService,
    private topbarService: V2TopbarService,
    public title: MindsTitle
  ) {
    if (this.session.isLoggedIn()) {
      this.router.navigate(['/newsfeed']);
      return;
    }

    this.newDesign = this.featuresService.has('register_pages-december-2019');

    if (this.newDesign) {
      this.topbarService.toggleMarketingPages(true);
    }
  }

  ngOnInit() {
    if (this.session.isLoggedIn()) {
      this.loginReferrer.register('/newsfeed');
      this.loginReferrer.navigate();
    }

    this.redirectTo = localStorage.getItem('redirect');

    // Set referrer if there is one
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      if (params['referrer']) {
        this.referrer = params['referrer'];
      }
    });

    this.title.setTitle('Register');

    if (/iP(hone|od)/.test(window.navigator.userAgent)) {
      this.flags.canPlayInlineVideos = false;
    }
  }

  registered() {
    if (this.redirectTo) {
      this.navigateToRedirection();
    }

    this.router.navigate(['/' + this.session.getLoggedInUser().username]);
  }

  onSourceError() {
    this.videoError = true;
  }

  ngOnDestroy() {
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
    this.topbarService.toggleMarketingPages(false);
  }

  private navigateToRedirection() {
    const uri = this.redirectTo.split('?', 2);
    const extras = {};

    if (uri[1]) {
      extras['queryParams'] = {};

      for (const queryParamString of uri[1].split('&')) {
        const queryParam = queryParamString.split('=');
        extras['queryParams'][queryParam[0]] = queryParam[1];
      }
    }

    this.router.navigate([uri[0]], extras);
  }
}

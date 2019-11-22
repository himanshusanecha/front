import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-onboarding',
  templateUrl: 'onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  topbar: HTMLElement;

  constructor() {
    this.topbar = document.querySelector('.m-v2-topbar__Top');
    this.topbar.classList.add('m-v2-topbar__noBackground');
  }

  ngOnInit() {}
}

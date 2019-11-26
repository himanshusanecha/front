import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'm-groups__step',
  templateUrl: 'groups.component.html',
})
export class GroupsStepComponent {
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
      selected: true,
    },
    {
      name: 'Channels',
      selected: false,
    },
  ];

  constructor(private router: Router) {}

  skip() {
    this.router.navigate(['/onboarding', 'channels']);
  }

  continue() {
    this.router.navigate(['/onboarding', 'channels']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'm-channels__step',
  templateUrl: 'channels.component.html',
})
export class ChannelsStepComponent {
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
      selected: true,
    },
  ];

  constructor(private router: Router) {}

  finish() {
    this.router.navigate(['/newsfeed']);
  }
}

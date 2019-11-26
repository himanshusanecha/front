import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FeedsService } from '../../../../common/services/feeds.service';
import { Session } from '../../../../services/session';

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

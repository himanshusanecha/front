import { Component, OnInit } from '@angular/core';
import { TopbarHashtagsService } from '../../../hashtags/service/topbar.service';
import { Router } from '@angular/router';

type Hashtag = {
  value: string;
  selected: boolean;
};

@Component({
  selector: 'm-hashtags__step',
  templateUrl: 'hashtags.component.html',
})
export class HashtagsStepComponent implements OnInit {
  steps = [
    {
      name: 'Hashtags',
      selected: true,
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

  input: string = '';
  hashtags: Array<Hashtag> = [];
  error: string;
  inProgress: boolean;

  constructor(private service: TopbarHashtagsService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.inProgress = true;

    try {
      this.hashtags = await this.service.load(14);
    } catch (e) {
      console.error(e);
    }

    this.inProgress = false;
  }

  async toggleSelection(hashtag) {
    this.error = null;
    try {
      await this.service.toggleSelection(hashtag, this);
    } catch (e) {
      this.error = (e && e.message) || 'Sorry, something went wrong';
      hashtag.selected = !hashtag.selected;
    }
  }

  skip() {
    this.router.navigate(['/onboarding', 'channels']);
  }

  continue() {
    if (this.validate()) {
      this.router.navigate(['/onboarding', 'info']);
    }
  }

  private validate() {
    this.error = null;

    if (this.hashtags.filter(item => item.selected).length < 3) {
      this.error = 'not:enough:hashtags';
      return false;
    }

    return true;
  }
}

import { Component, OnInit } from '@angular/core';
import { MindsUser } from '../../../../interfaces/entities';
import { Session } from '../../../../services/session';
import { Router } from '@angular/router';

@Component({
  selector: 'm-notice__step',
  templateUrl: 'notice.component.html',
})
export class NoticeStepComponent implements OnInit {
  user: MindsUser;

  constructor(private session: Session, private router: Router) {
    this.user = session.getLoggedInUser();
  }

  ngOnInit() {}

  continue() {
    this.router.navigate(['/onboarding', 'hashtags']);
  }

  skip() {
    this.router.navigate(['/newsfeed']);
  }
}

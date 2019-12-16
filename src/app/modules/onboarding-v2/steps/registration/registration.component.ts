import { Component, OnInit } from '@angular/core';
import { Session } from '../../../../services/session';
import { Router } from '@angular/router';

@Component({
  selector: 'm-registration__step',
  templateUrl: 'registration.component.html',
})
export class RegistrationStepComponent implements OnInit {
  constructor(private session: Session, private router: Router) {
    if (this.session.isLoggedIn()) {
      this.router.navigate(['/onboarding', 'notice']);
    }
  }

  ngOnInit() {}

  goToNextStep() {
    this.router.navigate(['/onboarding', 'notice']);
  }
}

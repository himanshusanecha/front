import { Component, HostListener } from '@angular/core';
import { Session } from '../../../../services/session';
import { MindsUser } from '../../../../interfaces/entities';
import { Client } from '../../../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'm-onboarding__infoStep',
  templateUrl: 'info.component.html',
})
export class InfoStepComponent {
  user: MindsUser;

  selectedMonth = 'January';
  selectedDay = '1';
  selectedYear = new Date().getFullYear();
  tooltipAnchor: 'top' | 'left' = 'left';
  confirming: boolean = false;
  inProgress: boolean = false;

  number: string;
  numberError: string;
  code: number;
  codeError: string;
  secret: string;
  location: string;
  locationError: string;
  date: string;
  dateOfBirthError: string;

  constructor(
    private session: Session,
    private client: Client,
    private router: Router
  ) {
    this.user = session.getLoggedInUser();

    this.onResize();
  }

  async updateLocation() {
    this.locationError = null;
    try {
      const response: any = await this.client.post('api/v1/channel/info', {
        city: this.location,
      });
    } catch (e) {
      console.error(e);
      this.locationError = e.message;
      return false;
    }
    return true;
  }

  async updateDateOfBirth() {
    this.dateOfBirthError = null;

    try {
      const response: any = await this.client.post('api/v1/channel/info', {
        dob: this.date,
      });
    } catch (e) {
      console.error(e);
      this.dateOfBirthError = e.message;
      return false;
    }
    return true;
  }

  async savePhoneNumber() {
    this.verify();
  }

  selectedDateChange(date: string) {
    this.date = date;
  }

  codeChange(code: number) {
    this.code = code;

    if (code.toString().length === 6) {
      this.confirm();
    }
  }

  async verify() {
    this.inProgress = true;
    this.numberError = null;
    try {
      const response: any = await this.client.post(
        'api/v2/blockchain/rewards/verify',
        {
          number: this.number,
        }
      );
      this.secret = response.secret;
      this.confirming = true;
    } catch (e) {
      this.numberError = e.message;
      this.confirming = false;
    }
    this.inProgress = false;
  }

  async confirm() {
    this.inProgress = true;
    this.codeError = null;
    try {
      const response: any = await this.client.post(
        'api/v2/blockchain/rewards/confirm',
        {
          number: this.number,
          code: this.code,
          secret: this.secret,
        }
      );

      window.Minds.user.rewards = true;
    } catch (e) {
      this.codeError = e.message;
    }

    this.inProgress = false;
  }

  cancel() {
    this.confirming = false;
    this.code = null;
    this.secret = null;
    this.inProgress = false;
    this.numberError = null;
    this.codeError = null;
    this.locationError = null;
    this.dateOfBirthError = null;
  }

  skip() {
    this.router.navigate(['/onboarding', 'hashtags']);
  }

  continue() {
    if (this.saveData()) {
      this.router.navigate(['/onboarding', 'groups']);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.tooltipAnchor = window.innerWidth <= 480 ? 'top' : 'left';
  }

  private saveData() {
    return this.updateLocation() && this.updateDateOfBirth();
  }
}

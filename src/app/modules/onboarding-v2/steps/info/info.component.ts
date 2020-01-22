import { Component, HostListener, ViewChild } from '@angular/core';
import { Session } from '../../../../services/session';
import { MindsUser } from '../../../../interfaces/entities';
import { Client, Upload } from '../../../../services/api';
import { Router } from '@angular/router';
import { PhoneVerificationComponent } from './phone-input/input.component';
import { MindsAvatar } from '../../../../common/components/avatar/avatar';

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
  inProgress: boolean = false;

  location: string;
  locationError: string;
  date: string;
  dateOfBirthError: string;

  @ViewChild('phoneVerification', { static: false })
  phoneVerification: PhoneVerificationComponent;

  @ViewChild('avatar', { static: false })
  avatar: MindsAvatar;

  constructor(
    private session: Session,
    private client: Client,
    private upload: Upload,
    private router: Router
  ) {
    this.user = session.getLoggedInUser();

    this.onResize();
  }

  addAvatar() {
    this.avatar.editing = true;
    setTimeout(() => {
      this.avatar.openFileDialog();
    });
  }

  async uploadAvatar(file) {
    this.avatar.editing = false;
    try {
      const response: any = await this.upload.post(
        'api/v1/channel/avatar',
        [file],
        { filekey: 'file' }
      );
      this.updateUser('icontime', Date.now());
    } catch (e) {
      console.error(e);
    }
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

  updateUser(prop: string, value: any) {
    const minds = Object.assign({}, window.Minds);

    minds.user[prop] = value;

    window.Minds = minds;
    this.session.userEmitter.next(window.Minds.user);
  }

  selectedDateChange(date: string) {
    this.date = date;
  }

  cancel() {
    this.phoneVerification.reset();
    this.inProgress = false;
    this.locationError = null;
    this.dateOfBirthError = null;
  }

  skip() {
    this.router.navigate(['/onboarding', 'avatar']);
  }

  continue() {
    if (this.saveData()) {
      this.router.navigate(['/onboarding', 'avatar']);
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

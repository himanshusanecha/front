import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ViewRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { requiredFor, optionalFor } from '../settings-cash.validators';
import { WalletV2Service } from '../../../wallet-v2.service';
import { Session } from '../../../../../../services/session';
import { Client } from '../../../../../../services/api';

@Component({
  selector: 'm-walletCashOnboarding',
  templateUrl: './cash-onboarding.component.html',
})
export class WalletCashOnboardingComponent implements OnInit {
  @Input() allowedCountries: string[];
  @Output() submitted: EventEmitter<any> = new EventEmitter();
  form;
  user;

  inProgress: boolean = false;
  showModal: boolean = false;
  editing;
  error: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    protected walletService: WalletV2Service,
    private fb: FormBuilder,
    protected session: Session,
    private client: Client
  ) {}

  ngOnInit() {
    this.user = this.session.getLoggedInUser();

    this.form = this.fb.group({
      country: ['US', Validators.required],

      firstName: ['', optionalFor(['JP'])],
      lastName: ['', optionalFor(['JP'])],
      gender: ['', requiredFor(['JP'])],
      dob: ['', Validators.required],
      phoneNumber: ['', requiredFor(['JP'])],
      ssn: ['', requiredFor(['US'])],
      personalIdNumber: ['', requiredFor(['CA', 'HK', 'SG'])],

      street: ['', optionalFor(['JP'])],
      city: ['', optionalFor(['JP', 'SG'])],
      state: ['', requiredFor(['AU', 'CA', 'IE', 'US'])],
      postCode: ['', optionalFor(['HK', 'IE', 'JP'])],
      stripeAgree: ['', Validators.required],
    });
    this.detectChanges();
  }

  async createAccount() {
    if (this.inProgress || this.form.invalid) {
      return;
    }

    this.inProgress = true;
    this.error = '';

    try {
      await this.walletService.createStripeAccount(this.form.value);
      this.inProgress = false;
      this.detectChanges();
    } catch (e) {
      this.inProgress = false;
      this.error = e.message;
      this.detectChanges();
    }
  }

  cancelForm() {
    if (!this.inProgress) {
      this.showModal = true;
    }
  }

  enterEditMode() {
    this.editing = true;
    this.detectChanges();
  }
  leaveEditMode() {
    this.showModal = false;
    this.editing = false;
    this.form.reset();
    this.detectChanges();
  }

  isCountry(countries: string[]) {
    return countries.indexOf(this.country.value) > -1;
  }

  revalidateForm(): void {
    Object.values(this.form.controls).forEach((control: FormControl) => {
      control.updateValueAndValidity();
    });
  }

  countryChange($event) {
    this.country.setValue($event);
    this.revalidateForm();
  }
  detectChanges(): void {
    if ((this.cd as ViewRef).destroyed) {
      return;
    }
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  get country() {
    return this.form.get('country');
  }
  get firstName() {
    return this.form.get('firstName');
  }
  get lastName() {
    return this.form.get('lastName');
  }
  get gender() {
    return this.form.get('gender');
  }
  get dob() {
    return this.form.get('dob');
  }
  get phoneNumber() {
    return this.form.get('phoneNumber');
  }
  get ssn() {
    return this.form.get('ssn');
  }
  get personalIdNumber() {
    return this.form.get('personalIdNumber');
  }
  get street() {
    return this.form.get('street');
  }
  get city() {
    return this.form.get('city');
  }
  get state() {
    return this.form.get('state');
  }
  get postCode() {
    return this.form.get('postCode');
  }
  get stripeAgree() {
    return this.form.get('stripeAgree');
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EmailConfirmationService } from './email-confirmation.service';
import { Session } from '../../../services/session';
import { Subscription } from 'rxjs';

@Component({
  providers: [EmailConfirmationService],
  selector: 'm-emailConfirmation',
  templateUrl: 'email-confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailConfirmationComponent implements OnInit, OnDestroy {
  sent: boolean = false;
  shouldShow: boolean = false;
  canClose: boolean = false;

  protected userEmitter$: Subscription;
  protected canCloseTimer;

  constructor(
    protected service: EmailConfirmationService,
    protected session: Session,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setShouldShow(this.session.getLoggedInUser());

    this.userEmitter$ = this.session.userEmitter.subscribe(user => {
      this.sent = false;
      this.setShouldShow(user);

      this.detectChanges();
    });

    this.canCloseTimer = setTimeout(() => {
      this.canClose = true;
      this.detectChanges();
    }, 3000);
  }

  ngOnDestroy() {
    clearTimeout(this.canCloseTimer);

    if (this.userEmitter$) {
      this.userEmitter$.unsubscribe();
    }
  }

  setShouldShow(user) {
    this.shouldShow = user && user.email_confirmed === false;
  }

  async send() {
    this.sent = true;
    this.detectChanges();

    try {
      const sent = await this.service.send();

      if (!sent) {
        this.sent = false;
      }
    } catch (e) {}

    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

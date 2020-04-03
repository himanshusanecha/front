import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { SignupModalService } from '../../modals/signup/service';
import { Session } from '../../../services/session';
import { WireModalService } from '../v2/wire-modal.service';
import { WireEventType } from '../v2/wire-v2.service';

@Component({
  selector: 'm-wire-button',
  template: `
    <button
      class="m-btn m-btn--action m-btn--slim m-wire-button"
      (click)="wire()"
    >
      <i class="ion-icon ion-flash"></i>
      <span>Wire</span>
    </button>
  `,
})
export class WireButtonComponent implements OnDestroy {
  @Input() object: any;
  @Output('done') doneEmitter: EventEmitter<any> = new EventEmitter();

  protected payModalSubscription: Subscription;

  constructor(
    public session: Session,
    private overlayModal: OverlayModalService,
    private modal: SignupModalService,
    private payModal: WireModalService
  ) {}

  ngOnDestroy(): void {
    if (this.payModalSubscription) {
      this.payModalSubscription.unsubscribe();
    }
  }

  wire() {
    if (!this.session.isLoggedIn()) {
      this.modal.open();

      return;
    }

    this.payModalSubscription = this.payModal
      .present(this.object, {
        default: this.object && this.object.wire_threshold,
      })
      .subscribe(payEvent => {
        if (payEvent.type === WireEventType.Completed) {
          const wire = payEvent.payload;

          if (this.object.wire_totals) {
            this.object.wire_totals[wire.currency] = wire.amount;
          }

          this.doneEmitter.emit(wire);
        }
      });
  }
}

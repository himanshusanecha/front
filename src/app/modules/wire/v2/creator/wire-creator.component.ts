import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WireService } from '../../wire.service';
import { WireV2Service } from '../wire-v2.service';
import { WalletV2Service } from '../../../wallet/v2/wallet-v2.service';

@Component({
  selector: 'm-wireCreator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'wire-creator.component.html',
  providers: [WireService, WireV2Service, WalletV2Service],
})
export class WireCreatorComponent {
  /**
   * Sets the entity that will receive the payment
   * @param object
   */
  @Input('object') set data(object) {
    this.service.setEntity(object);
  }

  /**
   * Completion intent
   */
  onComplete: (any) => any = () => {};

  /**
   * Dismiss intent
   */
  onDismissIntent: () => void = () => {};

  /**
   * Modal options
   *
   * @param onComplete
   * @param onDismissIntent
   */
  set opts({ onComplete, onDismissIntent }) {
    this.onComplete = onComplete || (() => {});
    this.onDismissIntent = onDismissIntent || (() => {});
  }

  /**
   * Constructor
   * @param service
   */
  constructor(public service: WireV2Service) {}

  /**
   * Submit button handler
   */
  async onSubmit() {
    this.onComplete(await this.service.submit());
  }
}

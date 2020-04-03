import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WireV2Service } from '../wire-v2.service';
import { WalletV2Service } from '../../../wallet/v2/wallet-v2.service';

@Component({
  selector: 'm-wireCreator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'wire-v2-creator.component.html',
  providers: [WireV2Service, WalletV2Service],
})
export class WireV2CreatorComponent {
  /**
   * Sets the entity that will receive the payment
   * @param object
   */
  @Input('object') set data(object) {
    this.service.setEntity(object);
  }

  /**
   * Constructor
   * @param service
   */
  constructor(public service: WireV2Service) {}
}

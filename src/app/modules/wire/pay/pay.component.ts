import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PayService } from './pay.service';
import { WalletV2Service } from '../../wallet/v2/wallet-v2.service';

@Component({
  selector: 'm-pay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'pay.component.html',
  providers: [PayService, WalletV2Service],
})
export class PayComponent {
  @Input('object') set data(object) {
    this.service.setEntity(object);
  }

  constructor(public service: PayService) {}
}

import { Component, OnInit } from '@angular/core';
import { ProService } from '../../../../../../../pro/pro.service';
import { WirePaymentHandlersService } from '../../../../../../../wire/wire-payment-handlers.service';
import { WireModalService } from '../../../../../../../wire/wire-modal.service';

@Component({
  selector: 'm-composer__monetizeV2__plus',
  templateUrl: './plus.component.html',
})
export class ComposerMonetizeV2PlusComponent implements OnInit {
  isPro;
  constructor(
    private proService: ProService,
    private wirePaymentHandlers: WirePaymentHandlersService,
    private wireModal: WireModalService
  ) {}

  ngOnInit(): void {
    this.isPro = this.proService.isActive();
  }

  showProModal(): void {
    // TODOOJM enable after upgrade modal MR is merged
    // const plusGuid = await this.wirePaymentHandlers.get('plus');
    // const wireEvent = await this.wireModal
    //   .present(plusGuid, {
    //     default: {
    //       type: 'money',
    //       upgradeType: 'pro',
    //     },
    //   })
    //   .toPromise();
    // if (wireEvent.type === WireEventType.Completed) {
    //   // const wire = wireEvent.payload;
    //   this.isPro = true;
    // }
  }
}

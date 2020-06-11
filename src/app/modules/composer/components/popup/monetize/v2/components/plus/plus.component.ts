import { Component, OnInit } from '@angular/core';
import { ProService } from '../../../../../../../pro/pro.service';
import { WirePaymentHandlersService } from '../../../../../../../wire/wire-payment-handlers.service';
import { WireModalService } from '../../../../../../../wire/wire-modal.service';
import { WireEventType } from '../../../../../../../wire/v2/wire-v2.service';
import { Session } from '../../../../../../../../services/session';
import { DynamicModalSettings } from '../../../../../../../../common/components/stackable-modal/stackable-modal.component';
import { PopupService } from '../../../../popup.service';

@Component({
  selector: 'm-composer__monetizeV2__plus',
  templateUrl: './plus.component.html',
})
export class ComposerMonetizeV2PlusComponent implements OnInit {
  isPro;
  stackableModalSettings: DynamicModalSettings;

  constructor(
    private proService: ProService,
    private wirePaymentHandlers: WirePaymentHandlersService,
    private wireModal: WireModalService,
    private session: Session,
    private popup: PopupService
  ) {}

  ngOnInit(): void {
    this.setup();
  }

  async setup(): Promise<void> {
    this.isPro = await this.proService.isActive();
  }

  // openShareModal(): void {
  //   const componentClass = ShareModalComponent,
  //     data = this.site.baseUrl + this.pageUrl.substr(1),
  //     opts = { class: 'm-overlayModal__share' };

  //   this.stackableModalSettings = {
  //     componentClass: componentClass,
  //     data: data,
  //     opts: opts,
  //   };
  // }

  async openProUpgradeModal(): Promise<void> {
    const plusGuid = await this.wirePaymentHandlers.get('pro');
    const wireEvent = await this.wireModal
      .present(plusGuid, {
        default: {
          type: 'money',
          upgradeType: 'pro',
        },
      })
      .toPromise();
    if (wireEvent.type === WireEventType.Completed) {
      this.session.getLoggedInUser().pro = true;
      this.isPro = true;
    }
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PayService } from '../pay.service';

@Component({
  selector: 'm-pay__ownerBlock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'owner-block.component.html',
})
export class PayOwnerBlock {
  constructor(public service: PayService) {}
}

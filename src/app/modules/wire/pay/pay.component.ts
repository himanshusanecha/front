import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PayService } from './pay.service';

@Component({
  selector: 'm-pay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'pay.component.html',
  providers: [PayService],
})
export class PayComponent {
  constructor(public service: PayService) {}

  onSubmit(): void {}
}

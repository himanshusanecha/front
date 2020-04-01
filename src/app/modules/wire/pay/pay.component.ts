import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PayService } from './pay.service';

@Component({
  selector: 'm-pay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'pay.component.html',
  providers: [PayService],
})
export class PayComponent {
  @Input('object') set data(object) {
    this.service.setEntity(object);
  }

  constructor(public service: PayService) {}

  onSubmit(): void {}
}

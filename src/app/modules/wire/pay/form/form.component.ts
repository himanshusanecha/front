import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PayService } from '../pay.service';

@Component({
  selector: 'm-pay__form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'form.component.html',
})
export class PayFormComponent {
  constructor(public service: PayService) {}
}

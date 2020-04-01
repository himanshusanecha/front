import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PayService } from '../pay.service';

@Component({
  selector: 'm-pay__form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'form.component.html',
})
export class PayFormComponent {
  constructor(public service: PayService) {}

  setAmount(amount: string): void {
    amount = amount.trim();

    if (amount.slice(-1) === '.') {
      // If we're in the middle of writing a decimal value, don't process it
      return;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, '') || '0');

    if (isNaN(numericAmount)) {
      return;
    }

    // TODO: Remove non-digits properly to avoid NaN
    this.service.setAmount(numericAmount);
  }
}

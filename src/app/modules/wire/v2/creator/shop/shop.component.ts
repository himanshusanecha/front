import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { WireV2Service } from '../../wire-v2.service';
import { combineLatest, Subscription } from 'rxjs';

/**
 * Shop (Wire Reward Tiers) component
 */
@Component({
  selector: 'm-wireCreator__shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'shop.component.html',
})
export class WireCreatorShopComponent implements OnInit, OnDestroy {
  /**
   * Selected ID (type:amount)
   */
  selectedId: string = '';

  /**
   * Subscription to state values
   */
  protected valuesSubscription: Subscription;

  /**
   * Constructor
   * @param service
   */
  constructor(public service: WireV2Service) {}

  /**
   * Initialization. Set type/amount/recurring subscription.
   */
  ngOnInit(): void {
    this.valuesSubscription = combineLatest([
      this.service.type$,
      this.service.amount$,
      this.service.recurring$,
    ]).subscribe(([type, amount, recurring]) =>
      this.onValuesChange(type, amount, recurring)
    );
  }

  /**
   * Destroy. Remove subscription.
   */
  ngOnDestroy(): void {
    this.valuesSubscription.unsubscribe();
  }

  /**
   * Update selection when values change
   * @param type
   * @param amount
   * @param recurring
   */
  onValuesChange(type: string, amount: number, recurring: boolean): void {
    if (!recurring) {
      this.selectedId = '';
      return;
    }
  }

  /**
   * Sets the selected reward values based on the ID (type:amount)
   * @param selectedId
   */
  onWireRewardSelect(selectedId: string): void {
    this.selectedId = selectedId;

    if (!selectedId) {
      return;
    }

    const [type, amountString] = selectedId.split(':');
    const amount = parseFloat(amountString);

    if (isNaN(amount)) {
      return;
    }

    switch (type) {
      case 'tokens':
        this.service.setType('tokens');
        break;

      case 'usd':
        this.service.setType('usd');
        break;

      default:
        return;
    }

    this.service.setAmount(amount);
    this.service.setRecurring(true);
  }
}

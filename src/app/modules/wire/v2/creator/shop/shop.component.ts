import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
   * @param cd
   */
  constructor(public service: WireV2Service, protected cd: ChangeDetectorRef) {}

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
      this.detectChanges();
      return;
    }

    const rewards = this.service.wireRewards$.getValue()[type];

    if (!rewards) {
      this.selectedId = '';
      this.detectChanges();
      return;
    }

    let selectedId = '';

    for (let i = rewards.length - 1; i >= 0; i--) {
      const entry = rewards[i];

      if (entry.amount <= amount) {
        selectedId = entry.id;
        break;
      }
    }

    this.selectedId = selectedId;
    this.detectChanges();
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
        throw new Error(`Invalid type: ${type}`);
    }

    this.service.setAmount(amount);
    this.service.setRecurring(true);
  }

  /**
   * Triggers change detection
   */
  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { WireV2Service } from '../../wire-v2.service';
import { ShopService } from './shop.service';

/**
 * Shop (Wire Reward Tiers) component
 */
@Component({
  selector: 'm-wireCreator__shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'shop.component.html',
  providers: [ShopService],
})
export class WireCreatorShopComponent {
  /**
   * Dismiss intent event emitter
   */
  @Output('onDismissIntent') dismissIntentEmitter: EventEmitter<
    void
  > = new EventEmitter<void>();

  /**
   * Constructor
   * @param service
   * @param shop
   */
  constructor(public service: WireV2Service, public shop: ShopService) {}

  /**
   * Triggers the dismiss modal event
   */
  dismiss() {
    this.dismissIntentEmitter.emit();
  }
}

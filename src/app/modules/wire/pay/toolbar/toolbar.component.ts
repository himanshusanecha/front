import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { PayService } from '../pay.service';

/**
 * Bottom toolbar for Pay modal
 */
@Component({
  selector: 'm-pay__toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'toolbar.component.html',
})
export class PayToolbarComponent {
  /**
   * Constructor.
   * @param service
   */
  constructor(public service: PayService) {}

  /**
   * Submit intent
   */
  @Output('onSubmit') onSubmitEmitter: EventEmitter<void> = new EventEmitter<
    void
  >();

  /**
   * Submit button event handler
   * @param $event
   */
  onSubmitClick($event?: MouseEvent): void {
    this.onSubmitEmitter.emit();
  }
}

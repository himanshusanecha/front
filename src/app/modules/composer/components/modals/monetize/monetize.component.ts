import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ComposerService } from '../../../composer.service';

@Component({
  selector: 'm-composer__monetize',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'monetize.component.html',
})
export class MonetizeComponent implements OnInit {
  @Output() dismissIntent: EventEmitter<any> = new EventEmitter<any>();

  state: { enabled: boolean; type: string; amount: number } = {
    enabled: false,
    type: 'tokens',
    amount: 0,
  };

  constructor(protected service: ComposerService) {}

  ngOnInit(): void {
    const monetization = this.service.monetization$.getValue();

    this.state = {
      enabled: Boolean(monetization),
      type: (monetization && monetization.type) || 'tokens',
      amount: (monetization && monetization.min) || 0,
    };
  }

  save() {
    this.service.monetization$.next(
      this.state.enabled
        ? {
            type: this.state.type,
            min: this.state.amount,
          }
        : null
    );
    this.dismissIntent.emit();
  }
}

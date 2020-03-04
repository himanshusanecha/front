import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { ComposerService } from '../../../composer.service';

@Component({
  selector: 'm-composer__monetize',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div></div>',
})
export class MonetizeComponent {
  @Output() dismissIntent: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected service: ComposerService) {}

  get monetization$() {
    return this.service.monetization$;
  }

  save() {}
}

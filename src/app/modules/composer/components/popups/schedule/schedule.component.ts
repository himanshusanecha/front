import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { ComposerService } from '../../../composer.service';

@Component({
  selector: 'm-composer__schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div></div>',
})
export class ScheduleComponent {
  @Output() dismissIntent: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected service: ComposerService) {}

  get schedule$() {
    return this.service.schedule$;
  }

  save() {}
}

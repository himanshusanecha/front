import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { ComposerService } from '../../../composer.service';

@Component({
  selector: 'm-composer__tags',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div></div>',
})
export class TagsComponent {
  @Output() dismissIntent: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected service: ComposerService) {}

  get tags$() {
    return this.service.tags$;
  }

  save() {}
}

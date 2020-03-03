import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { ComposerService } from '../../composer.service';

@Component({
  selector: 'm-composer__nsfw',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div (click)="save()">NSFW: {{nsfw$|async|json}}</div>',
})
export class NsfwComponent {
  @Output() dismissIntent: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected service: ComposerService) {}

  get nsfw$() {
    return this.service.nsfw$;
  }

  save() {
    this.service.nsfw$.next([1, 2, 3, +Date.now()]);
    this.dismissIntent.emit({});
  }
}

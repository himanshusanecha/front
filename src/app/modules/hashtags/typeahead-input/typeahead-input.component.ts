import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'm-hashtags__typeaheadInput',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'typeahead-input.component.html',
})
export class TypeaheadInputComponent implements OnInit {
  @Input() historyKey: string = 'default';

  @Output('onAction') onActionEmitter: EventEmitter<string> = new EventEmitter<
    string
  >();

  tag: string;

  ngOnInit(): void {}

  setTag(tag: string) {
    this.tag = tag || '';
  }

  triggerAction(): void {
    if (this.tag) {
      this.onActionEmitter.emit(this.tag);
    }
  }

  pushMRUItems(tags: string[]) {}

  reset(): void {
    this.setTag('');
  }
}

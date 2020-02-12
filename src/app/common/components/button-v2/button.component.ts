import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

export interface ButtonComponentAction {
  type: string;
}

@Component({
  selector: 'm-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'button.component.html',
})
export class ButtonComponent {
  @Input() dropdown: TemplateRef<any>;
  @Output() onAction: EventEmitter<ButtonComponentAction> = new EventEmitter<
    ButtonComponentAction
  >();
}

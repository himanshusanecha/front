import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

/**
 * Interface for action emitter
 */
export interface ButtonComponentAction {
  type: string;
}

/**
 * Standard button based on 2020 designs, with dropdown support
 */
@Component({
  selector: 'm-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'button.component.html',
})
export class ButtonComponent {
  /**
   * Button type
   */
  @Input() type: string = 'default';

  /**
   * Is the button disabled?
   */
  @Input() @HostBinding('class.m-button--disabled') disabled: boolean = false;

  /**
   * Dropdown template
   */
  @Input() dropdown: TemplateRef<any>;

  /**
   * Event emitter when actioning the button
   */
  @Output() onAction: EventEmitter<ButtonComponentAction> = new EventEmitter<
    ButtonComponentAction
  >();

  /**
   * Emits the action to the parent using the exported interface
   */
  emitAction() {
    this.onAction.emit({
      type: this.type,
    });
  }
}

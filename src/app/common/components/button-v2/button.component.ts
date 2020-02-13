import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
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
  @Input() type: string = 'default';
  @Input() @HostBinding('class.m-button--disabled') disabled: boolean = false;
  @Input() dropdown: TemplateRef<any>;
  @Output() onAction: EventEmitter<ButtonComponentAction> = new EventEmitter<
    ButtonComponentAction
  >();

  dropdownOpen: boolean = false;

  emitAction() {
    this.onAction.emit({
      type: this.type,
    });
  }

  openDropdown() {
    if (!this.dropdown) {
      return;
    }

    this.dropdownOpen = true;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}

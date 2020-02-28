import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'm-dropdownMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'dropdown-menu.component.html',
})
export class DropdownMenuComponent {
  @Input() menu: TemplateRef<any>;

  @Input() hover: boolean = true;

  @Input() triggerClass: string = '';

  @Input() menuClass: string = '';

  isOpen: boolean = false;

  onClick($event: MouseEvent) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    this.open();
  }

  // TODO: Implement open-on-hover behavior

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  get triggerCssClasses() {
    const classList = ['m-dropdownMenu__trigger'];

    if (!this.hover) {
      classList.push('m-dropdownMenuTrigger--clickable');
    }

    if (this.triggerClass) {
      classList.push(
        ...this.triggerClass
          .split(' ')
          .map(className => className.trim())
          .filter(Boolean)
      );
    }

    return classList;
  }

  get menuCssClasses() {
    const classList = ['m-dropdownMenu__menu'];

    if (this.menuClass) {
      classList.push(
        ...this.menuClass
          .split(' ')
          .map(className => className.trim())
          .filter(Boolean)
      );
    }

    return classList;
  }
}

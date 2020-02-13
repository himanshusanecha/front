import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Component({
  selector: 'm-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'overlay.component.html',
})
export class OverlayComponent {
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  @HostListener('click', ['$event']) _click($event) {
    // TODO: Check if $event.target is self, to avoid bubbles from other screen elements
    this.onClick.emit();
  }
}

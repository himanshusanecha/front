import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';

const noOp = () => {};

@Component({
  selector: 'm-composer__modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'modal.component.html',
})
export class ModalComponent {
  onPost: (any) => any = noOp;

  onDismissIntent: () => void = noOp;

  /**
   * Modal options
   *
   * @param onPost
   * @param onDismissIntent
   */
  set opts({ onPost, onDismissIntent }) {
    this.onPost = onPost || noOp;
    this.onDismissIntent = onDismissIntent || noOp;
  }

  /**
   * Processes Esc keys as dismissal intent
   * @param $event
   */
  @HostListener('window:keydown', ['$event']) onWindowKeyDown(
    $event: KeyboardEvent
  ) {
    if (!$event || !$event.target) {
      return true;
    }

    const tagName = (
      ($event.target as HTMLElement).tagName || ''
    ).toLowerCase();

    const isContentEditable =
      ($event.target as HTMLElement).contentEditable === 'true';

    if (
      // NOTE: For now, let's allow pressing Esc even on editable
      // tagName === 'input' ||
      // tagName === 'textarea' ||
      // isContentEditable ||
      $event.key !== 'Escape'
    ) {
      return true;
    }

    $event.stopPropagation();
    $event.preventDefault();
    this.onDismissIntent();

    return true;
  }
}

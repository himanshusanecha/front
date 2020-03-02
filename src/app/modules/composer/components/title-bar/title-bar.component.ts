import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ACCESS, LICENSES } from '../../../../services/list-options';

/**
 * Composer title bar component. It features a label and a dropdown menu
 * with not-that-important options.
 */
@Component({
  selector: 'm-composer__titleBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'title-bar.component.html',
})
export class TitleBarComponent {
  /**
   * Composer textarea ID
   */
  @Input() id: string;

  /**
   * Current visibility (access ID) value
   */
  @Input() visibility: string;

  /**
   * Current license value
   */
  @Input() license: string;

  /**
   * Can we change visibility? (disabled on groups)
   */
  @Input() canChangeVisibility: boolean = true;

  /**
   * Visibility emitter
   */
  @Output('onVisibility') onVisibilityEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  /**
   * License emitter
   */
  @Output('onLicense') onLicenseEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  /**
   * Visibility items list
   */
  visibilityItems: Array<{ text: string; value: string }> = ACCESS.map(
    ({ text, value }) => ({
      text,
      value: `${value}`,
    })
  );

  /**
   * License items list
   */
  licenseItems: Array<{ text: string; value: string }> = LICENSES;

  /**
   * Sends the visibility changed emitter
   * @param $event
   */
  onVisibilityClick($event) {
    if (!this.canChangeVisibility) {
      return;
    }

    this.onVisibilityEmitter.emit($event);
  }

  /**
   * Sends the visibility license emitter
   * @param $event
   */
  onLicenseClick($event) {
    this.onLicenseEmitter.emit($event);
  }
}

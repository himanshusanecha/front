import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ACCESS, LICENSES } from '../../../../services/list-options';

@Component({
  selector: 'm-composer__titleBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'title-bar.component.html',
})
export class TitleBarComponent {
  @Input() id: string;

  @Input() visibility: string;

  @Input() license: string;

  @Input() canChangeVisibility: boolean = true;

  @Output('onVisibility') onVisibilityEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  @Output('onLicense') onLicenseEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  visibilityItems: Array<{ text: string; value: string }> = ACCESS.map(
    ({ text, value }) => ({
      text,
      value: `${value}`,
    })
  );

  licenseItems: Array<{ text: string; value: string }> = LICENSES;

  onVisibilityClick($event) {
    if (!this.canChangeVisibility) {
      return;
    }

    this.onVisibilityEmitter.emit($event);
  }

  onLicenseClick($event) {
    this.onLicenseEmitter.emit($event);
  }
}

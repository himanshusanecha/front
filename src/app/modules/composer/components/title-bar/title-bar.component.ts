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

  @Output('onVisibility') onVisibilityEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  @Output('onLicense') onLicenseEmitter: EventEmitter<
    string
  > = new EventEmitter<string>();

  visibilityOptions = ACCESS;

  licenseOptions = LICENSES;

  onVisibilityClick($event) {
    this.onVisibilityEmitter.emit($event);
  }

  onLicenseClick($event) {
    this.onLicenseEmitter.emit($event);
  }
}

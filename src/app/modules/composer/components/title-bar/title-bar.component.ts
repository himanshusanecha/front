import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

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
}

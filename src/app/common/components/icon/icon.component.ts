import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconSource = 'md' | 'ion';

@Component({
  selector: 'm-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'icon.component.html',
})
export class IconComponent {
  @Input() from: IconSource = 'md';
  @Input() iconId: string;
}

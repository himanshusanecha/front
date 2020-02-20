import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'm-composer__progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'progress.component.html',
})
export class ProgressComponent {
  @Input() inProgress: boolean = false;
  @Input() progress: number = 0;

  get currentProgressWidth() {
    if (!this.progress) {
      return '0';
    }

    return `${this.progress * 100}%`;
  }
}

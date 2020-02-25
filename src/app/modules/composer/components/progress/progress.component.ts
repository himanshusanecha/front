import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'm-composer__progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'progress.component.html',
})
export class ProgressComponent {
  @Input() inProgress: boolean = false;

  @Input() progress: number = 0;

  get progressPct() {
    return (this.progress || 0) * 100;
  }

  get active() {
    return this.inProgress && this.progressPct < 99; // First 99%
  }

  get indeterminate() {
    return this.inProgress && this.progressPct >= 99; // Last 1%
  }

  get currentProgressWidth() {
    if (!this.inProgress || this.indeterminate) {
      return void 0;
    }

    return `${this.progressPct}%`;
  }
}

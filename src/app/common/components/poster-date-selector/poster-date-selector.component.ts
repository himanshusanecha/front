import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'm-poster-date-selector',
  template: `
    <div class="m-poster-date-selector--input" [class.selected]="hasDateSelected()" mdl-datetime-picker [date]="date" (dateChange)="onDateChange($event)">
      <input type="text" [ngModel]="date | date:dateFormat" (ngModelChange)="onDateChange($event)" [hidden]="true">
      <i class="material-icons">date_range</i>
      <span></span>
    </div>
  `,
  providers: [DatePipe]
})

export class PosterDateSelectorComponent {
  @Input() date: string;
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() dateFormat: string = 'short';

  onDateChange(newDate) {
    this.date = newDate;
    this.dateChange.emit(newDate);
  }

  hasDateSelected() {
    return this.date && this.date !== '';
  }
}

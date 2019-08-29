import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'm-poster-date-selector',
  templateUrl: 'poster-date-selector.component.html',
  providers: [DatePipe],
})
export class PosterDateSelectorComponent {
  @Input() date: string;
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() dateFormat: string = 'short';

  tooltipDate: string;

  onDateChange(newDate) {
    this.date = this.tooltipDate = newDate;
    newDate = new Date(newDate).getTime();
    newDate = Math.floor(+newDate / 1000);
    this.dateChange.emit(newDate);
  }

  hasDateSelected() {
    return this.tooltipDate && this.tooltipDate !== '';
  }
}

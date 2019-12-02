import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Date picker / selector.
 */
@Component({
  moduleId: module.id,
  selector: 'm-date-selector',
  template: `
    <label class="m-dateSelector__label" *ngIf="label">{{ label }} </label>
    <input
      class="m-dateSelector__input"
      [ngClass]="{ 'm-dateSelector__input--hidden': hideInput }"
      [owlDateTimeTrigger]="dt"
      [owlDateTime]="dt"
      [min]="min"
      [max]="max"
      [(ngModel)]="date"
      (ngModelChange)="onDateChange($event)"
    />
    <owl-date-time [pickerType]="calendarType" #dt></owl-date-time>
    <m-tooltip
      *ngIf="tooltipIcon"
      icon="{{ tooltipIcon }}"
      [owlDateTimeTrigger]="dt"
      i18n-label="{{ i18n }}"
    >
      {{ tooltipText }}
    </m-tooltip>
  `,
})
export class DateSelectorComponent {
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() dateFormat: string = 'short'; // legacy. TODO: implement localization.
  @Input() label: string; // label for input.

  @Input() hideInput = false; // text input showing the date.
  @Input() calendarType = 'calendar'; // timer/calendar/both.

  @Input() i18n?: string; // i18n string to accompany tooltip text.
  @Input() tooltipIcon?: string; // tooltip icon.
  @Input() tooltipText?: string; // tooltip text.

  protected _date: Date;

  @Input('date') // parse input into Date object.
  set date(value) {
    this._date = new Date(`${value}`);
  }

  get date(): Date {
    return this._date;
  }

  protected _min: Date;

  @Input('min') // parse input into Date object.
  set min(value) {
    this._min = new Date(`${value}`);
  }

  get min(): Date {
    return this._min;
  }

  protected _max: Date;

  @Input('max') // parse input into Date object.
  set max(value) {
    this._max = new Date(`${value}`);
  }

  get max(): Date {
    return this._max;
  }

  /**
   * Called when date changes.
   * @param newDate - the new date.
   */
  public onDateChange(newDate): void {
    this.dateChange.emit(newDate);
  }
}

import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { default as DateTimePicker } from 'material-datetime-picker';
import * as moment from "moment";

@Directive({
  selector: '[mdl-datetime-picker]',
})
export class MaterialDateTimePickerDirective {
  @Input() date;
  @Input() dateFormat: string = 'MM/DD/YY, h:mm';
  @Input() useUTC: boolean = false;
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();
  private open: boolean = false;
  private picker;

  readonly DEFAULT_FORMAT = 'MM/DD/YY, h:mm';

  @HostListener('click')
  @HostListener('keydown.enter')
  onHostClick() {
    if (!this.open) {
      this.picker = new DateTimePicker()
        .on('submit', this.submitCallback.bind(this))
        .on('close', this.close.bind(this));
      this.open = true;
      this.picker.open();
    }
  }

  private submitCallback(value) {
    let formatted;

    if (this.useUTC) {
      // get date without timezone
      const noTimezone = value.format(this.DEFAULT_FORMAT);
      // create a new UTC moment with the noTimezone date
      const withTimezone = moment.utc(noTimezone, this.DEFAULT_FORMAT);
      // get UTC date
      formatted = withTimezone.format(this.dateFormat);
    } else {
      formatted = value.format(this.dateFormat);
    }

    this.dateChange.emit(formatted);
    this.close();
  }

  private close() {
    this.picker.off('submit', this.submitCallback);
    this.picker.off('close', this.close);
    this.open = false;
  }
}

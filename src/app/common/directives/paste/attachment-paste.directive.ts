import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: '[m-attachment-paste]' })
export class AttachmentPasteDirective {
  @Output('onFilePaste')
  onFilePaste: EventEmitter<File> = new EventEmitter<File>();

  private focused: boolean = false;

  @HostListener('focus') onFocus() {
    this.focused = true;
  }

  @HostListener('focusout') onFocusOut() {
    this.focused = false;
  }

  @HostListener('window:paste', ['$event']) onPaste(event: ClipboardEvent) {
    if (this.focused) {
      for (let index in event.clipboardData.items) {
        const item: DataTransferItem = event.clipboardData.items[index];

        if (item.kind === 'file') {
          this.onFilePaste.emit(item.getAsFile());
          break;
        }
      }
    }
  }
}

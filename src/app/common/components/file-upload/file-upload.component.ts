import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { UniqueId } from '../../../helpers/unique-id.helper';

export type FileUploadSelectEvent = File | File[] | null;

@Component({
  selector: 'm-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'file-upload.component.html',
})
export class FileUploadComponent {
  @Input() wrapperClass: string = '';
  @Input() accept: string = '*.*';
  @Input() multiple: boolean = false;
  @Output('onSelect') onSelectEmitter: EventEmitter<
    FileUploadSelectEvent
  > = new EventEmitter<FileUploadSelectEvent>();

  id: string = UniqueId.generate('m-file-upload');

  onSelect(file: HTMLInputElement): void {
    if (!file || !file.files) {
      this.onSelectEmitter.next(this.multiple ? [] : null);
      return;
    }

    if (this.multiple) {
      this.onSelectEmitter.next(Array.from(file.files));
    } else {
      this.onSelectEmitter.next(file.files[0] || null);
    }
  }
}

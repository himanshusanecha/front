import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UniqueId } from '../../../helpers/unique-id.helper';

@Component({
  selector: 'm-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'file-upload.component.html',
})
export class FileUploadComponent {
  @Input() wrapperClass: string = '';
  id: string = UniqueId.generate('m-file-upload');

  onSelect(file, $event) {}
}

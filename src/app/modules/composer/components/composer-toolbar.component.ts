import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FileUploadSelectEvent } from '../../../common/components/file-upload/file-upload.component';
import { ButtonComponentAction } from '../../../common/components/button-v2/button.component';

@Component({
  selector: 'm-composer__toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'composer-toolbar.component.html',
})
export class ComposerToolbarComponent {
  @Input() attachment: any;

  @Input() inProgress: boolean = false;

  @Output('onAttachmentSelect') onAttachmentSelectEmitter: EventEmitter<
    FileUploadSelectEvent
  > = new EventEmitter<FileUploadSelectEvent>();

  @Output('onDeleteAttachment') onDeleteAttachmentEmitter: EventEmitter<
    void
  > = new EventEmitter<void>();

  @Output('onPost') onPostEmitter: EventEmitter<
    ButtonComponentAction
  > = new EventEmitter<ButtonComponentAction>();

  onAttachmentSelect(file: FileUploadSelectEvent): void {
    this.onAttachmentSelectEmitter.emit(file);
  }

  onDeleteAttachmentClick(event?: MouseEvent): void {
    this.onDeleteAttachmentEmitter.emit();
  }

  onNsfwClick(event?: MouseEvent): void {
    // TODO: NSFW popup
  }

  onMonetizationClick(event?: MouseEvent): void {
    // TODO: Monetization popup
  }

  onTagsClick(event?: MouseEvent): void {
    // TODO: Tags popup
  }

  onPost(buttonComponentAction: ButtonComponentAction): void {
    this.onPostEmitter.emit(buttonComponentAction);
  }

  onSchedulerClick(event?: MouseEvent): void {
    // TODO: Scheduler popup
  }
}

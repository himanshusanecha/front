import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FileUploadComponent,
  FileUploadSelectEvent,
} from '../../../../common/components/file-upload/file-upload.component';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import {
  AttachmentSubjectValue,
  ComposerService,
} from '../../composer.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'm-composer__toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'toolbar.component.html',
})
export class ToolbarComponent {
  @Output('onPost') onPostEmitter: EventEmitter<
    ButtonComponentAction
  > = new EventEmitter<ButtonComponentAction>();

  @ViewChild('fileUploadComponent', { static: false })
  fileUploadComponent: FileUploadComponent;

  constructor(protected service: ComposerService) {}

  /**
   * Attachment subject from service
   */
  get attachment$(): BehaviorSubject<AttachmentSubjectValue> {
    return this.service.attachment$;
  }

  /**
   * inProgress subject from service
   */
  get inProgress$(): BehaviorSubject<boolean> {
    return this.service.inProgress$;
  }

  /**
   * canPost subject from service
   */
  get canPost$() {
    return this.service.canPost$;
  }

  /**
   * Emits the new attachment
   * @param $event
   */
  onAttachmentSelect($event: FileUploadSelectEvent): void {
    if (!($event instanceof File)) {
      // Unsupported attachment type
      console.warn('Composer/Toolbar: Unsupported attachment type', $event);
      return;
    } else if (!$event) {
      // Most likely pressed Esc on dialog
      return;
    }

    this.service.attachment$.next($event);
  }

  /**
   * Resets file upload component and attachment
   * @param $event
   */
  onDeleteAttachmentClick($event?: MouseEvent): void {
    // TODO: Use themed async modals
    if (!confirm('Are you sure?')) {
      return;
    }

    if (this.fileUploadComponent) {
      this.fileUploadComponent.reset();
    }

    // TODO: Delete unused attachment from server
    this.service.attachment$.next(null);
  }

  /**
   * Shows NSFW popup
   * @param $event
   */
  onNsfwClick($event?: MouseEvent): void {
    // TODO: NSFW popup
    // TODO: Spec test
  }

  /**
   * Shows monetization popup
   * @param $event
   */
  onMonetizationClick($event?: MouseEvent): void {
    // TODO: Monetization popup
    // TODO: Spec test
  }

  /**
   * Shows tags popup
   * @param $event
   */
  onTagsClick($event?: MouseEvent): void {
    // TODO: Tags popup
    // TODO: Spec test
  }

  /**
   * Shows scheduler popup
   * @param $event
   */
  onSchedulerClick($event?: MouseEvent): void {
    // TODO: Scheduler popup
    // TODO: Spec test
  }

  /**
   * Emits post event
   * @param buttonComponentAction
   */
  onPost(buttonComponentAction: ButtonComponentAction): void {
    this.onPostEmitter.emit(buttonComponentAction);
  }
}

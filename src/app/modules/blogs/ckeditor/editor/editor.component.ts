/**
 * @author Ben Hayward
 * @desc Wrapper for CKEditor5 text editor.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AttachmentService } from '../../../../services/attachment';
declare var require: any;

@Component({
  selector: 'm-blog__editor',
  host: {
    class: 'm-blog',
  },
  templateUrl: 'editor.component.html',
})
export class BlogEditorComponent {
  /**
   * Content to place into the editor on load.
   */
  @Input() content: string;

  /**
   * Emitted when content changes.
   */
  @Output() contentChanged: EventEmitter<Event> = new EventEmitter<Event>();

  Editor: any;

  constructor(
    @Inject(PLATFORM_ID) protected platformId: Object,
    private attachment: AttachmentService
  ) {}

  ngOnInit() {
    // Render on browser side.
    if (isPlatformBrowser(this.platformId)) {
      // Must be required here for client-side loading.
      const MindsEditor = require('@bhayward93/ckeditor5-build-minds');
      this.Editor = MindsEditor;
      this.Editor.config = {
        uploadHandler: async file => {
          const response = this.attachment.upload(await file);
          return `http://localhost:8080/fs/v1/thumbnail/${await response}/xlarge`;
        },
      };
    }
  }

  /**
   * Called on content change. Emits current content value.
   * @param Event - change event.
   */
  onContentChanged($event: Event): void {
    this.contentChanged.emit($event);
  }
}
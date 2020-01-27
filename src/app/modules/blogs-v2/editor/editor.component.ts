/**
 * @author Ben Hayward
 * @desc Wrapper for CKEditor5 text editor.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

import * as BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

@Component({
  selector: 'm-blog__editor',
  host: {
    class: 'm-blog',
  },
  templateUrl: 'editor.component.html',
})
export class BlogEditorComponent {
  @Input() content: string;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter<string>();

  public Editor: BalloonEditor = BalloonEditor;

  // TODO: Manually adjust configuration when custom built.
  editorConfig: Object = {
    /**
      plugins: [ Alignment ],
      alignment: {
        options: [ 'left', 'right' ]
      },
      toolbar: [
        'heading',
        '|',
        'bulletedList',
        'numberedList',
        'alignment',
        'undo',
        'redo',
        'bold',
        'italic',
        'bulletedList',
        'numberedList',
        'blockQuote',
      ],
    */
  };

  /**
   * Called on content change. Emits current content value.
   * @param Event - change event.
   */
  onContentChanged($event: Event): void {
    this.contentChanged.emit(this.content);
  }
}

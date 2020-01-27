import {
  Component,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable } from 'rxjs';

import { MindsTitle } from '../../../services/ux/title';
import { ACCESS, LICENSES } from '../../../services/list-options';
import { Client, Upload } from '../../../services/api';
import { Session } from '../../../services/session';
import { InlineEditorComponent } from '../../../common/components/editors/inline-editor.component';
import { WireThresholdInputComponent } from '../../wire/threshold-input/threshold-input.component';
import { HashtagsSelectorComponent } from '../../hashtags/selector/selector.component';
import { Tag } from '../../hashtags/types/tag';
import { InMemoryStorageService } from '../../../services/in-memory-storage.service';
import { DialogService } from '../../../common/services/confirm-leave-dialog.service';

// import * as BalloonEditor from '../../../common/ckeditor5-editor-balloon/src/ballooneditor'
import * as BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

@Component({
  selector: 'm-blog__editor',
  host: {
    class: 'm-blog',
  },
  templateUrl: 'editor.component.html',
})
export class BlogEditorComponent {
  minds = window.Minds;

  public Editor = BalloonEditor;

  editorConfig = {
    // plugins: [ Alignment ],
    // alignment: {
    //   options: [ 'left', 'right' ]
    // },
    // toolbar: [
    //   'heading',
    //   '|',
    //   'bulletedList',
    //   'numberedList',
    //   'alignment',
    //   'undo',
    //   'redo',
    //   'bold',
    //   'italic',
    //   'bulletedList',
    //   'numberedList',
    //   'blockQuote',
    // ],
  };

  @Input() content: string;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter<string>();

  onContentChanged(change): void {
    // console.log('editor : emiting change...');
    // console.dir(change);
    this.contentChanged.emit(change);
  }
}

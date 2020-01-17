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
import * as BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

@Component({
  moduleId: module.id,
  selector: 'minds-blog-editor',
  host: {
    class: 'm-blog',
  },
  templateUrl: 'editor.html',
})
export class BlogEditor {
  minds = window.Minds;

  public Editor = BalloonEditor;

  // TODO: Add type
  @Input() content: string;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter<string>();

  onContentChanged(change) {
    console.log('editor : emiting change');
    this.contentChanged.emit(change);
  }
}

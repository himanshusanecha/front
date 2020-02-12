import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UniqueId } from '../../helpers/unique-id.helper';
import { ButtonComponentAction } from '../../common/components/button-v2/button.component';
import { ComposerService } from './composer.service';
import { FileUploadSelectEvent } from '../../common/components/file-upload/file-upload.component';

@Component({
  selector: 'm-composer',
  providers: [ComposerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'composer.component.html',
})
export class ComposerComponent implements OnInit, OnDestroy {
  id: string = UniqueId.generate('m-composer');
  poppedOut: boolean = false;

  constructor(public service: ComposerService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onPost($event: ButtonComponentAction) {}

  popOut() {
    // this.poppedOut = true;
  }
}

// use combineLatest with

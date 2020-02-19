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

  get message$() {
    return this.service.message$;
  }

  set message(message: string) {
    this.service.message$.next(message);
  }

  get attachment$() {
    return this.service.attachment$;
  }

  set attachment(attachment: File | null) {
    this.service.attachment$.next(attachment);
  }

  get nsfw$() {
    return this.service.nsfw$;
  }

  set nsfw(nsfw: number[]) {
    this.service.nsfw$.next(nsfw);
  }

  get monetization$() {
    return this.service.monetization$;
  }

  set monetization(monetization: any) {
    this.service.monetization$.next(monetization);
  }

  get tags$() {
    return this.service.tags$;
  }

  set tags(tags: string[]) {
    this.service.tags$.next(tags);
  }

  get scheduler$() {
    return this.service.scheduler$;
  }

  set scheduler(scheduler: any) {
    this.service.scheduler$.next(scheduler);
  }

  get inProgress$() {
    return this.service.inProgress$;
  }

  get progress$() {
    return this.service.progress$;
  }

  ngOnInit(): void {
    // TODO: Initialize based on bindings

    this.message = '';
    this.attachment = null;
    this.nsfw = null;
    this.monetization = null;
    this.scheduler = null;
  }

  ngOnDestroy(): void {
    // TODO: Destroy subscriptions, if any
    // TODO: Delete unused attachment
  }

  onMessageChange(message: string) {
    this.message = message;
  }

  onAttachmentSelect(file: File | null): void {
    if (!file) {
      return;
    }

    this.attachment = file;
  }

  onDeleteAttachment(): void {
    // TODO: Use themed async modals
    if (!confirm('Are you sure?')) {
      return;
    }

    // TODO: Delete unused attachment
    this.attachment = null;
  }
  async onPost(event: ButtonComponentAction) {
    // TODO: Check event.type, etc

    try {
      const response = await this.service.post();
    } catch (e) {
      console.log(e);
      // TODO: Display errors nicely and with a clear language
    }
  }

  popOut() {
    // this.poppedOut = true;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { UniqueId } from '../../../../helpers/unique-id.helper';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import { ComposerService } from '../../composer.service';

@Component({
  selector: 'm-composer__base',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'base.component.html',
})
export class BaseComponent {
  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  id: string = UniqueId.generate('m-composer');

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

  get schedule$() {
    return this.service.schedule$;
  }

  set schedule(schedule: any) {
    this.service.schedule$.next(schedule);
  }

  get inProgress$() {
    return this.service.inProgress$;
  }

  get progress$() {
    return this.service.progress$;
  }

  get attachmentError$() {
    return this.service.attachmentError$;
  }

  get preview$() {
    return this.service.preview$;
  }

  get canPost$() {
    return this.service.canPost$;
  }

  onMessageChange(message: string) {
    this.message = message;
  }

  onAttachmentSelect(file: File | null): void {
    if (!file) {
      return;
    }

    this.attachment$.next(file);
  }

  onDeleteAttachment(): void {
    // TODO: Use themed async modals
    if (!confirm('Are you sure?')) {
      return;
    }

    // TODO: Delete unused attachment from server
    this.attachment$.next(null);
  }

  onVisibilitySelect($event): void {
    // TODO: Send to service
  }

  onLicenseSelect($event): void {
    // TODO: Send to service
  }

  async onPost(event: ButtonComponentAction) {
    // TODO: Check event.type, etc

    try {
      const activity = await this.service.post();

      this.onPostEmitter.next(activity);

      // TODO: Reset composer
    } catch (e) {
      console.log(e);
      // TODO: Display errors nicely and with a clear language
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    return true;
  }
}

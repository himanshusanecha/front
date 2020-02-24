import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UniqueId } from '../../../../helpers/unique-id.helper';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import { ComposerService } from '../../composer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'm-composer__base',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'base.component.html',
})
export class BaseComponent implements OnInit, OnDestroy {
  @Input('activity') set _activity(activity: any) {
    this.service.load(activity);
  }

  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  id: string = UniqueId.generate('m-composer');

  protected onPostModalSubscription: Subscription;

  constructor(public service: ComposerService) {}

  // Modal

  set opts({ onPost }) {
    if (this.onPostModalSubscription) {
      this.onPostModalSubscription.unsubscribe();
    }

    if (onPost) {
      this.onPostModalSubscription = this.onPostEmitter.subscribe(onPost);
    }
  }

  set data({ activity }) {
    this.service.load(activity);
  }

  //

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

  ngOnInit(): void {
    this.service.reset();
  }

  ngOnDestroy(): void {
    if (this.onPostModalSubscription) {
      this.onPostModalSubscription.unsubscribe();
    }

    // TODO: Destroy subscriptions, if any
    // TODO: Delete unused attachment
  }

  load(activity: any) {
    this.service.load(activity);
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

  async onPost(event: ButtonComponentAction) {
    // TODO: Check event.type, etc

    try {
      const response = await this.service.post();

      this.onPostEmitter.next(response);

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

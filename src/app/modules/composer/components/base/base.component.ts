import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Output,
  ViewChild,
} from '@angular/core';
import { UniqueId } from '../../../../helpers/unique-id.helper';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import { ComposerService } from '../../services/composer.service';
import { PopupService } from '../popup/popup.service';
import { PopupComponent } from '../popup/popup.component';
import { TextAreaComponent } from '../text-area/text-area.component';

@Component({
  selector: 'm-composer__base',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'base.component.html',
  providers: [PopupService],
})
export class BaseComponent implements AfterViewInit {
  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('popupComponent', { static: true }) popupComponent: PopupComponent;

  @ViewChild('textAreaComponent', { static: true })
  textAreaComponent: TextAreaComponent;

  textareaId: string = UniqueId.generate('m-composer__textarea');

  constructor(
    protected service: ComposerService,
    protected popup: PopupService,
    protected injector: Injector
  ) {}

  ngAfterViewInit(): void {
    this.popup.setUp(this.popupComponent, this.injector);
  }

  get attachmentPreview$() {
    return this.service.attachmentPreview$;
  }

  get richEmbedPreview$() {
    return this.service.richEmbedPreview$;
  }

  set nsfw(nsfw: number[]) {
    this.service.nsfw$.next(nsfw);
  }

  set monetization(monetization: any) {
    this.service.monetization$.next(monetization);
  }

  set tags(tags: string[]) {
    this.service.tags$.next(tags);
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

  focus() {
    this.textAreaComponent.focus();
  }

  async onPost(event: ButtonComponentAction) {
    try {
      const activity = await this.service.post();

      this.onPostEmitter.next(activity);
    } catch (e) {
      console.log(e);
      // TODO: Display errors nicely and with a clear language
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    // TODO: Ask if there's an attachment or something else
    return true;
  }
}

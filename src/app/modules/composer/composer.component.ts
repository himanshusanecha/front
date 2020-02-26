import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ComposerService } from './composer.service';
import { ModalService } from './components/modal/modal.service';
import { BaseComponent } from './components/base/base.component';

@Component({
  providers: [ComposerService],
  selector: 'm-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'composer.component.html',
})
export class ComposerComponent {
  @Input() embedded: boolean = false;

  @Input('activity') set _activity(activity: any) {
    if (activity) {
      this.service.load(activity);
    }
  }

  @Input('accessId') set _accessId(accessId: any) {
    if (typeof accessId !== 'undefined') {
      this.service.setAccessId(accessId);
    }
  }

  @Input('containerGuid') set _containerGuid(containerGuid: any) {
    if (typeof containerGuid !== 'undefined') {
      this.service.setContainerGuid(containerGuid);
    }
  }

  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Output('onPostError') onPostErrorEmitter: EventEmitter<
    any
  > = new EventEmitter<any>();

  modalOpen: boolean = false;

  @ViewChild('popOutBaseComposer', { static: false })
  protected popOutBaseComposer: BaseComponent;

  @ViewChild('embeddedBaseComposer', { static: false })
  protected embeddedBaseComposer: BaseComponent;

  constructor(
    protected composerModalService: ModalService,
    protected service: ComposerService /* NOTE: Used for DI. DO NOT REMOVE OR CHANGE !!! */,
    protected cd: ChangeDetectorRef,
    protected injector: Injector
  ) {}

  async onTriggerClick($event: MouseEvent) {
    this.modalOpen = true;
    this.detectChanges();

    try {
      const response = await this.composerModalService
        .setInjector(this.injector)
        .present()
        .toPromise();

      if (response) {
        this.onPostEmitter.emit(response);
      }
    } catch (e) {
      console.error('Composer.onTriggerClick', e);
      this.onPostErrorEmitter.emit(e);
    }

    this.modalOpen = false;
    this.detectChanges();
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.popOutBaseComposer) {
      return this.popOutBaseComposer.canDeactivate();
    }

    if (this.embeddedBaseComposer) {
      return this.popOutBaseComposer.canDeactivate();
    }

    return true;
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

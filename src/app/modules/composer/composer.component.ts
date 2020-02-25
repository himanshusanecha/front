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
import { ComposerModalService } from './composer-modal.service';
import { ComposerService } from './composer.service';
import { BaseComponent } from './components/base/base.component';

@Component({
  providers: [ComposerService],
  selector: 'm-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'composer.component.html',
})
export class ComposerComponent {
  @Input() activity: any;

  @Input() containerGuid: any;

  @Input() accessId: any;

  @Input() embedded: boolean = false;

  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Output('onPostError') onPostErrorEmitter: EventEmitter<
    any
  > = new EventEmitter<any>();

  modalOpen: boolean = false;

  protected firstModalOpen: boolean = true;

  @ViewChild('popOutBaseComposer', { static: false })
  protected popOutBaseComposer: BaseComponent;

  @ViewChild('embeddedBaseComposer', { static: false })
  protected embeddedBaseComposer: BaseComponent;

  constructor(
    protected composerModalService: ComposerModalService,
    protected composerService: ComposerService /* NOTE: Used for DI. DO NOT REMOVE !!! */,
    protected cd: ChangeDetectorRef,
    protected injector: Injector
  ) {}

  async onTriggerClick($event: MouseEvent) {
    try {
      this.modalOpen = true;
      this.detectChanges();

      const response = await this.composerModalService
        .setInjector(this.injector)
        .present(this.firstModalOpen ? this.activity : void 0);

      this.firstModalOpen = false;

      if (response) {
        this.onPostEmitter.emit(response);
      }
    } catch (e) {
      console.error('Composer Placeholder', e);
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

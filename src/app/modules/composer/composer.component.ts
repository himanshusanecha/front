import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { ComposerModalService } from './composer-modal.service';
import { ComposerService } from './composer.service';

@Component({
  providers: [ComposerService],
  selector: 'm-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'composer.component.html',
})
export class ComposerComponent {
  @Input() activity: any;

  @Input() embedded: boolean = false;

  @Output('onPost') onPostEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Output('onPostError') onPostErrorEmitter: EventEmitter<
    any
  > = new EventEmitter<any>();

  modalOpen: boolean = false;

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

      this.onPostEmitter.emit(
        await this.composerModalService
          .setInjector(this.injector)
          .present(this.activity)
      );
    } catch (e) {
      console.error('Composer Placeholder', e);
      this.onPostErrorEmitter.emit(e);
    }

    this.modalOpen = false;
    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { CommonModule } from '../../common/common.module';
import { FormsModule } from '@angular/forms';
import { ModalService } from './components/modal/modal.service';
import { ComposerComponent } from './composer.component';
import { ModalComponent } from './components/modal/modal.component';
import { BaseComponent } from './components/base/base.component';
import { MediaPreviewComponent } from './components/media-preview/media-preview.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';

/**
 * Exported components
 */
const COMPONENTS = [ComposerComponent, ModalComponent];

/**
 * Components used internally
 */
const INTERNAL_COMPONENTS = [
  BaseComponent,
  MediaPreviewComponent,
  ProgressComponent,
  ToolbarComponent,
  TitleBarComponent,
];

const PROVIDERS = [ModalService];

/**
 * Module definition
 */
@NgModule({
  imports: [NgCommonModule, FormsModule, CommonModule],
  declarations: [...INTERNAL_COMPONENTS, ...COMPONENTS],
  exports: COMPONENTS,
  entryComponents: COMPONENTS,
  providers: PROVIDERS,
})
export class ComposerModule {}

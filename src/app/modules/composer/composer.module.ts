import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { BaseComponent } from './components/base/base.component';
import { CommonModule } from '../../common/common.module';
import { FormsModule } from '@angular/forms';
import { MediaPreviewComponent } from './components/media-preview/media-preview.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ComposerComponent } from './composer.component';
import { ComposerModalService } from './composer-modal.service';

/**
 * Exported components
 */
const COMPONENTS = [ComposerComponent, BaseComponent];

/**
 * Components used internally
 */
const INTERNAL_COMPONENTS = [
  BaseComponent,
  MediaPreviewComponent,
  ProgressComponent,
  ToolbarComponent,
];

const PROVIDERS = [ComposerModalService];

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

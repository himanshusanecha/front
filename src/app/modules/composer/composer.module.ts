import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { ComposerComponent } from './composer.component';
import { CommonModule } from '../../common/common.module';
import { FormsModule } from '@angular/forms';
import { MediaPreviewComponent } from './components/media-preview/media-preview.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

/**
 * Exported components
 */
const COMPONENTS = [ComposerComponent];

/**
 * Components used internally
 */
const INTERNAL_COMPONENTS = [
  MediaPreviewComponent,
  ProgressComponent,
  ToolbarComponent,
];

/**
 * Module definition
 */
@NgModule({
  imports: [NgCommonModule, FormsModule, CommonModule],
  declarations: [...INTERNAL_COMPONENTS, ...COMPONENTS],
  exports: COMPONENTS,
})
export class ComposerModule {}

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { ComposerComponent } from './composer.component';
import { CommonModule } from '../../common/common.module';
import { FormsModule } from '@angular/forms';
import { ComposerToolbarComponent } from './components/composer-toolbar.component';

/**
 * Exported components
 */
const COMPONENTS = [ComposerComponent];

/**
 * Components used internally
 */
const INTERNAL_COMPONENTS = [ComposerToolbarComponent];

/**
 * Module definition
 */
@NgModule({
  imports: [NgCommonModule, FormsModule, CommonModule],
  declarations: [...INTERNAL_COMPONENTS, ...COMPONENTS],
  exports: COMPONENTS,
})
export class ComposerModule {}

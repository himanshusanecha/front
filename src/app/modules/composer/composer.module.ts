import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { CommonModule } from '../../common/common.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { ModalService } from './components/modal/modal.service';
import { ComposerComponent } from './composer.component';
import { ModalComponent } from './components/modal/modal.component';
import { BaseComponent } from './components/base/base.component';
import { MediaPreviewComponent } from './components/media-preview/media-preview.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { PopupComponent } from './components/popup/popup.component';
import { NsfwComponent } from './components/popup/nsfw/nsfw.component';
import { MonetizeComponent } from './components/popup/monetize/monetize.component';
import { TagsComponent } from './components/popup/tags/tags.component';
import { ScheduleComponent } from './components/popup/schedule/schedule.component';

/**
 * Exported components
 */
const COMPONENTS = [
  ComposerComponent,
  ModalComponent,
  NsfwComponent,
  MonetizeComponent,
  TagsComponent,
  ScheduleComponent,
];

/**
 * Components used internally
 */
const INTERNAL_COMPONENTS = [
  BaseComponent,
  MediaPreviewComponent,
  ProgressComponent,
  ToolbarComponent,
  TitleBarComponent,
  PopupComponent,
];

const PROVIDERS = [ModalService];

/**
 * Module definition
 */
@NgModule({
  imports: [NgCommonModule, FormsModule, CommonModule, HashtagsModule],
  declarations: [...INTERNAL_COMPONENTS, ...COMPONENTS],
  exports: COMPONENTS,
  entryComponents: COMPONENTS,
  providers: PROVIDERS,
})
export class ComposerModule {}

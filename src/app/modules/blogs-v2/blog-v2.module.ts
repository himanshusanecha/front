import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '../../common/common.module';

import { CanDeactivateGuardService } from '../../services/can-deactivate-guard';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { BlogEditorComponent } from './editor/editor.component';
import { BlogEdit } from './edit/edit';
import { WireModule } from '../wire/wire.module';
import { CommentsModule } from '../comments/comments.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { LegacyModule } from '../legacy/legacy.module';

const routes: Routes = [
  {
    path: 'blog-v2/edit/:guid',
    component: BlogEdit,
    canDeactivate: [CanDeactivateGuardService],
  },
];

@NgModule({
  imports: [
    NgCommonModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    WireModule,
    HashtagsModule,
    CommentsModule,
    LegacyModule,
  ],
  declarations: [BlogEditorComponent, BlogEdit],
  exports: [
    BlogEditorComponent,
    BlogEdit,
    WireModule,
    HashtagsModule,
    CommentsModule,
  ],
  entryComponents: [BlogEditorComponent],
})
export class BlogV2Module {}

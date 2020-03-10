import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ComposerService } from '../../composer.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'm-composer__textArea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'text-area.component.html',
})
export class TextAreaComponent {
  @Input() inputId: string = '';

  titleCache: string = '';

  @ViewChild('titleInput', { static: false }) titleInput: ElementRef<
    HTMLInputElement
  >;

  @ViewChild('messageInput', { static: false }) messageInput: ElementRef<
    HTMLTextAreaElement
  >;

  constructor(
    protected service: ComposerService,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {}

  get message$() {
    return this.service.message$;
  }

  get title$() {
    return this.service.title$;
  }

  get attachment$() {
    return this.service.attachment$;
  }

  focus() {
    if (this.messageInput.nativeElement && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.messageInput.nativeElement.focus(), 100);
    }
  }

  onMessageChange(message: string) {
    this.service.message$.next(message);
  }

  onTitleChange(title: string) {
    this.service.title$.next(title);
  }

  toggleTitle() {
    const currentTitle = this.service.title$.getValue();

    if (currentTitle !== null) {
      this.titleCache = currentTitle;
      this.service.title$.next(null);
    } else {
      this.service.title$.next(this.titleCache || '');

      if (this.titleInput.nativeElement && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.titleInput.nativeElement.focus(), 100);
      }
    }
  }
}

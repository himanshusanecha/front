import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { ComposerService } from '../../composer.service';

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

  constructor(protected service: ComposerService) {}

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
    if (this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
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

      if (this.titleInput.nativeElement) {
        this.titleInput.nativeElement.focus();
      }
    }
  }
}

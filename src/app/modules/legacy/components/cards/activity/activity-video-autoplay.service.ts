import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { ScrollService } from '../../../../../services/ux/scroll';

@Injectable()
export class ActivityVideoAutoplayService implements OnDestroy {
  protected element: HTMLElement;

  protected entity;

  protected visibility$: Subscription;

  protected visibilitySubject: Subject<boolean> = new Subject();

  protected scroll$: Subscription;

  protected visible: boolean = false;

  protected onViewFn: (entity) => void;

  protected onStopViewingFn: (entity) => void;

  protected enabled: boolean = true;

  constructor(protected scroll: ScrollService) {
    this.init();
  }

  setElementRef(elementRef: ElementRef | null) {
    this.element = (elementRef && elementRef.nativeElement) || void 0;
    return this;
  }

  setEntity(entity) {
    this.entity = entity || void 0;
    return this;
  }

  onView(fn: (entity) => void) {
    this.onViewFn = fn;
    return this;
  }

  onStopViewing(fn: (entity) => void) {
    this.onStopViewingFn = fn;
    return this;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  init() {
    this.visibility$ = this.visibilitySubject.subscribe(() => {
      if (this.entity && this.visible) {
        if (this.onViewFn) {
          this.onViewFn(this.entity);
        } else {
          console.warn('Missing onView handler for Activity');
        }
      } else {
        if (this.onStopViewingFn) {
          this.onStopViewingFn(this.entity);
        } else {
          console.warn('Missing onStopViewingFn handler for Activity');
        }
      }
    });

    this.scroll$ = this.scroll.listenForView().subscribe(() => {
      this.checkVisibility();
    });
  }

  checkVisibility() {
    if (!this.element) {
      console.warn('Missing element ref');
      return;
    }

    if (!this.element.offsetHeight || !this.enabled) {
      return;
    }

    const rect = this.element.getBoundingClientRect();

    // 33% of the window
    const offsetRange = this.scroll.view.clientHeight / 5;

    const offsetTop = this.scroll.view.scrollTop + offsetRange;
    const offsetBottom = offsetTop + offsetRange;

    const y1 = rect.top;
    const y2 = offsetTop;
    if (y1 + rect.height < y2 || y1 > offsetBottom) {
      this.visible = false;
      this.visibilitySubject.next(this.visible);
    } else {
      this.visible = true;
      this.visibilitySubject.next(this.visible);
    }
  }

  ngOnDestroy() {
    this.scroll.unListen(this.scroll$);

    if (this.visibility$) {
      this.visibility$.unsubscribe();
    }
  }
}

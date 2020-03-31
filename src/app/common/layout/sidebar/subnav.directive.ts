import {
  Directive,
  ElementRef,
  HostBinding,
  Renderer2,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

const MIN_FULL_NAV_WIDTH = 1172; // TODO make this a constant

@Directive({
  selector: '[m-sidebarNavigation__subnav]',
})
export class SidebarNavigationSubnavDirective {
  parentEl: Element;
  parentMouseEnterListener;
  parentMouseLeaveListener;

  @HostBinding('class.m-sidebarNavigation__subnav--popover')
  get shouldShowPopover() {
    return (
      this.isHovering &&
      (!this.parentEl.classList.contains('m-sidebarNavigation__item--active') ||
        window.innerWidth <= MIN_FULL_NAV_WIDTH)
    );
  }

  isHovering = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) return;
    this.parentEl = this.el.nativeElement.parentElement;
    this.parentMouseEnterListener = this.renderer.listen(
      this.parentEl,
      'mouseenter',
      event => {
        const rect = this.parentEl.getBoundingClientRect();
        this.isHovering = true;
        if (this.shouldShowPopover) {
          this.renderer.setStyle(
            this.el.nativeElement,
            'left',
            rect.left + rect.width + 'px'
          );
          this.renderer.setStyle(this.el.nativeElement, 'top', rect.top + 'px');
        }
        this.detectChanges();
      }
    );
    this.parentMouseLeaveListener = this.renderer.listen(
      this.parentEl,
      'mouseleave',
      event => {
        this.isHovering = false;
        this.renderer.setStyle(this.el.nativeElement, 'left', null);
        this.renderer.setStyle(this.el.nativeElement, 'top', null);
        this.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    if (this.parentMouseEnterListener) this.parentMouseEnterListener.unlisten();
    if (this.parentMouseLeaveListener) this.parentMouseLeaveListener.unlisten();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

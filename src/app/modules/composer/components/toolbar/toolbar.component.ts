import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  AttachmentSubjectValue,
  ComposerService,
} from '../../composer.service';
import {
  FileUploadComponent,
  FileUploadSelectEvent,
} from '../../../../common/components/file-upload/file-upload.component';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import { PopupService } from '../popup/popup.service';
import { NsfwComponent } from '../popups/nsfw/nsfw.component';
import { MonetizeComponent } from '../popups/monetize/monetize.component';
import { TagsComponent } from '../popups/tags/tags.component';
import { ScheduleComponent } from '../popups/schedule/schedule.component';

/**
 * Toolbar component. Interacts directly with the service.
 */
@Component({
  selector: 'm-composer__toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'toolbar.component.html',
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * On Post event emitter
   */
  @Output('onPost') onPostEmitter: EventEmitter<
    ButtonComponentAction
  > = new EventEmitter<ButtonComponentAction>();

  /**
   * Upload component ref
   */
  @ViewChild('fileUploadComponent', { static: false })
  fileUploadComponent: FileUploadComponent;

  /**
   * Toolbar main <div> element
   */
  @ViewChild('toolbarWrapper', { static: true }) toolbarWrapper: ElementRef<
    HTMLDivElement
  >;

  /**
   * Show narrow style
   */
  narrow: boolean = false;

  /**
   * Window resize event observable
   */
  protected windowResize$: Subject<void> = new Subject<void>();

  /**
   * Window resize event subscription
   */
  protected windowResizeSubscription: Subscription;

  constructor(
    protected service: ComposerService,
    protected popup: PopupService,
    protected cd: ChangeDetectorRef
  ) {}

  /**
   * Handles Init event
   * @internal
   */
  ngOnInit(): void {
    this.windowResizeSubscription = this.windowResize$
      .pipe(debounceTime(250))
      .subscribe(() => this.calcNarrow());
  }

  /**
   * Handles View Init event
   * @internal
   */
  ngAfterViewInit(): void {
    this.calcNarrow();
  }

  /**
   * Handles window resize event
   * @internal
   */
  @HostListener('window:resize') onWindowResize() {
    this.windowResize$.next();
  }

  /**
   * Triggers when change detection runs
   */
  ngOnChanges() {
    this.windowResize$.next();
  }

  /**
   * Handles Destroy event
   * @internal
   */
  ngOnDestroy(): void {
    this.windowResizeSubscription.unsubscribe();
  }

  /**
   * Calculates if the toolbar should be "narrow" (no labels)
   */
  calcNarrow() {
    if (
      this.toolbarWrapper.nativeElement &&
      this.toolbarWrapper.nativeElement.clientWidth
    ) {
      const narrow = this.toolbarWrapper.nativeElement.clientWidth <= 550;

      if (narrow !== this.narrow) {
        this.narrow = narrow;
        this.detectChanges(); // Be VERY CAREFUL as this runs on ngOnChanges, as well
      }
    }
  }

  /**
   * Attachment subject from service
   */
  get attachment$(): BehaviorSubject<AttachmentSubjectValue> {
    return this.service.attachment$;
  }

  /**
   * inProgress subject from service
   */
  get inProgress$(): BehaviorSubject<boolean> {
    return this.service.inProgress$;
  }

  /**
   * canPost subject from service
   */
  get canPost$() {
    return this.service.canPost$;
  }

  /**
   * Emits the new attachment
   * @param $event
   */
  onAttachmentSelect($event: FileUploadSelectEvent): void {
    if (!($event instanceof File)) {
      // Unsupported attachment type
      console.warn('Composer/Toolbar: Unsupported attachment type', $event);
      return;
    } else if (!$event) {
      // Most likely pressed Esc on dialog
      return;
    }

    this.service.attachment$.next($event);
  }

  /**
   * Resets file upload component and attachment
   * @param $event
   */
  onDeleteAttachmentClick($event?: MouseEvent): void {
    // TODO: Use themed async modals
    if (!confirm('Are you sure?')) {
      return;
    }

    if (this.fileUploadComponent) {
      this.fileUploadComponent.reset();
    }

    // TODO: Delete unused attachment from server
    this.service.attachment$.next(null);
  }

  /**
   * Shows NSFW popup
   * @param $event
   */
  async onNsfwClick($event?: MouseEvent): Promise<void> {
    await this.popup
      .create(NsfwComponent)
      .present()
      .toPromise(/* Promise is needed to boot-up the Observable */);
  }

  /**
   * Shows monetization popup
   * @param $event
   */
  async onMonetizeClick($event?: MouseEvent): Promise<void> {
    await this.popup
      .create(MonetizeComponent)
      .present()
      .toPromise(/* Promise is needed to boot-up the Observable */);
  }

  /**
   * Shows tags popup
   * @param $event
   */
  async onTagsClick($event?: MouseEvent): Promise<void> {
    await this.popup
      .create(TagsComponent)
      .present()
      .toPromise(/* Promise is needed to boot-up the Observable */);
  }

  /**
   * Shows scheduler popup
   * @param $event
   */
  async onSchedulerClick($event?: MouseEvent): Promise<void> {
    await this.popup
      .create(ScheduleComponent)
      .present()
      .toPromise(/* Promise is needed to boot-up the Observable */);
  }

  /**
   * Emits post event
   * @param buttonComponentAction
   */
  onPost(buttonComponentAction: ButtonComponentAction): void {
    this.onPostEmitter.emit(buttonComponentAction);
  }

  /**
   * Triggers change detection
   */
  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

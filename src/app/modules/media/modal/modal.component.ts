import { Component, OnInit, OnDestroy, Input, HostListener, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Event, NavigationStart } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Session } from '../../../services/session';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { AnalyticsService } from '../../../services/analytics';
import { MindsVideoComponent } from '../components/video/video.component';

@Component({
  selector: 'm-media--modal',
  templateUrl: 'modal.component.html',
  animations: [
    // Fade in media when done loading
    trigger('simpleFadeAnimation', [
      state('in', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(800)
      ])
    ])
  ]
})

export class MediaModalComponent implements OnInit, OnDestroy {
  minds = window.Minds;
  entity: any = {};
  inProgress: boolean = true;

  isFullscreen: boolean = false;
  navigatedAway: boolean = false;
  fullscreenHovering: boolean = false; // Used for fullscreen button transformation

  screenWidth: number;
  screenHeight: number;
  modalWidth: number;
  stageWidth: number;
  stageHeight: number;
  mediaWidth: number;
  mediaHeight: number;
  contentWidth: number;
  stageWidthPaddingThreshold: number;
  maxStageWidth: number;
  maxHeight: number;
  minStageHeight: number;
  minStageWidth: number;

  title: string = '';
  thumbnail: string = '';
  boosted: boolean = false;

  // Used for backdrop click detection hack
  isOpen: boolean = false;
  isOpenTimeout: any = null;

  routerSubscription: Subscription;

  @Input('entity') set data(entity) {
    this.entity = entity;
    this.entity.width = 0;
    this.entity.height = 0;
  }


  @ViewChild( MindsVideoComponent, { static: false }) videoComponent: MindsVideoComponent;

  constructor(
    public session: Session,
    public analyticsService: AnalyticsService,
    private overlayModal: OverlayModalService,
    private router: Router,
    private location: Location,
  ) {
  }

  ngOnInit() {

    // Prevent dismissal of modal when it's just been opened
    this.isOpenTimeout = setTimeout(() => this.isOpen = true, 50);

    this.analyticsService.send('pageview', {url: `/media/${this.entity.entity_guid}?ismodal=true`});

    this.boosted = this.entity.boosted || this.entity.p2p_boosted;

    // Set title
    if ( !this.entity.title ) {
      if ( !this.entity.message ) {
        this.title = `${this.entity.ownerObj.name}'s post`;
      } else {
        this.title = this.entity.message;
      }
    } else {
      this.title = this.entity.title;
    }

    // Change the url to point to media page so user can easily share link
    // (but don't actually redirect)
    this.location.replaceState(`/media/${this.entity.entity_guid}`);

    // When user clicks a link from inside the modal
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {

        if (!this.navigatedAway) {
          this.navigatedAway = true;

          // Fix browser history so back button doesn't go to media page
          this.location.replaceState(this.entity.modal_source_url);

          // Go to the intended destination
          this.router.navigate([event.url]);

          this.dismissModal();
        }
      }

    });

    // TO DO? handle giant screens by setting max on screenwidth and height and window size?

    // Set fixed dimensions (i.e. those that don't change when window changes)
    this.screenWidth = screen.width;
    this.screenHeight = screen.height;
    this.contentWidth = Math.max(Math.round(this.screenWidth * 0.25), 300);
    this.minStageHeight = Math.round((this.screenHeight * 0.6) - 20);
    this.maxHeight = Math.round(this.screenHeight * 0.8);
    this.stageWidthPaddingThreshold = this.screenWidth * 0.4 + 44;
    this.minStageWidth = this.stageWidthPaddingThreshold + 40;

    if (this.entity.custom_type === 'batch') {
      // Image
      this.entity.width = this.entity.custom_data[0].width;
      this.entity.height = this.entity.custom_data[0].height;
      this.thumbnail = `${this.minds.cdn_url}fs/v1/thumbnail/${this.entity.entity_guid}/xlarge`;
    } else {
      // Video
      this.entity.width = this.entity.custom_data.dimensions.width;
      this.entity.height = this.entity.custom_data.dimensions.height;
      this.thumbnail = this.entity.custom_data.thumbnail_src; // Not currently used
    }

    this.entity.aspectRatio = this.entity.width / this.entity.height;
    this.calculateDimensions();
  }

  // Recalculate height/width when window resizes
  @HostListener('window:resize', ['$resizeEvent'])
    onResize(resizeEvent) {
      this.calculateDimensions();
    }

  calculateDimensions() {
    const windowWidth: number = window.innerWidth;
    const windowHeight: number = window.innerHeight;

    if ( !this.isFullscreen ) {

      // Set heights as tall as possible
      this.setStageHeightWithinRange(window.innerHeight);
      this.setHeights();

      // After heights are set, check that scaled width isn't too wide or narrow
      this.maxStageWidth = Math.max(windowWidth - this.contentWidth - 40, this.minStageWidth);
      if ( this.mediaWidth >= this.maxStageWidth ) {
        // Too wide :(
        this.rescaleHeightsForMaxWidth();
      } else if ( this.mediaWidth > this.stageWidthPaddingThreshold ) {
        // Not too wide and not too narrow :)
        this.stageWidth = this.mediaWidth;
      } else {
        // Too narrow :(
        // If black stage background is visible on left/right, each strip should be at least 20px wide
        this.stageWidth = this.minStageWidth;

        // Continue to resize height after reaching min width
        this.handleNarrowWindow(window.innerWidth);
      }

      // If black stage background is visible on top/bottom, each strip should be at least 20px high
      const heightDiff = this.stageHeight - this.mediaHeight;
      if ( 0 < heightDiff && heightDiff <= 40){
        this.stageHeight += 40;
      }

    } else { // isFullscreen
      this.stageWidth = windowWidth;
      this.stageHeight = windowHeight;

      // Set mediaHeight as tall as possible but not taller than instrinsic height
      this.mediaHeight = this.entity.height < windowHeight ? this.entity.height : windowHeight;
      this.mediaWidth = this.scaleWidth();

      if ( this.mediaWidth > windowWidth ) {
        // Width was too wide, need to rescale heights so width fits
        this.mediaWidth = windowWidth;
        this.mediaHeight = this.scaleHeight();
      }
    }
    this.modalWidth = this.stageWidth + this.contentWidth;
  }


  setStageHeightWithinRange(windowHeight) {
  // Initialize stageHeight as % of windowHeight
  this.stageHeight = Math.round(windowHeight * 0.94);

  // Ensure stageHeight is not taller than max (a % of screenHeight)
  this.stageHeight = Math.min(this.stageHeight, this.maxHeight);

  // Ensure stageHeight is not shorter than min (a % of screenHeight)
  this.stageHeight = Math.max(this.stageHeight, this.minStageHeight);

  // Scale width according to aspect ratio
  this.mediaWidth = this.scaleWidth();
  }


  setHeights() {
    // Set mediaHeight as tall as stage but no larger than intrinsic height
    if (this.entity.height >= this.stageHeight) {
      // Fit media inside stage
      this.mediaHeight = this.stageHeight;
    } else {
      // Media is shorter than stage
      this.mediaHeight = this.entity.height;
      this.stageHeight = this.minStageHeight;
    }

    // Scale width according to aspect ratio
    this.mediaWidth = this.scaleWidth();
  }

  rescaleHeightsForMaxWidth() {
    // Media is too wide, set width to max and rescale heights
    this.mediaWidth = this.maxStageWidth;
    this.stageWidth = this.maxStageWidth;

    this.mediaHeight = this.scaleHeight();
    this.stageHeight = Math.max(this.mediaHeight, this.minStageHeight);
  }

  handleNarrowWindow(windowWidth) {
    // When at minStageWidth and windowWidth falls below threshold,
    // shrink vertically until it hits minStageHeight

    // When window is narrower than this, start to shrink height
    const verticalShrinkWidthThreshold = this.mediaWidth + this.contentWidth + 82;

    const widthDiff = verticalShrinkWidthThreshold - windowWidth;
    // Is window narrow enough to start shrinking vertically?
    if ( widthDiff >= 1 ) {
      // What mediaHeight would be if it shrunk proportionally to difference in width?
      const mediaHeightPreview = Math.round((this.mediaWidth - widthDiff) / this.entity.aspectRatio);

      // Shrink media if mediaHeight is still above min
      if (mediaHeightPreview > this.minStageHeight) {
        this.mediaWidth -= widthDiff;
        this.mediaHeight = this.scaleHeight();
        this.stageHeight = this.mediaHeight;
      } else {
        this.stageHeight = this.minStageHeight;
        this.mediaHeight = Math.min(this.minStageHeight, this.entity.height);
        this.mediaWidth = this.scaleWidth();
      }
    }
  }

  scaleHeight() {
    return Math.round(this.mediaWidth / this.entity.aspectRatio);
  }
  scaleWidth() {
    return Math.round(this.mediaHeight * this.entity.aspectRatio);
  }

  // Listen for fullscreen change event in case user enters/exits full screen without clicking button
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullscreenChange(event) {
    this.calculateDimensions();
    if ( !document.fullscreenElement &&
      !document['webkitFullScreenElement'] &&
      !document['mozFullScreenElement'] &&
      !document['msFullscreenElement'] ) {
      this.isFullscreen = false;
    } else {
      this.isFullscreen = true;
    }
  }

  toggleFullscreen() {
    const elem = document.querySelector('.m-mediaModal__stageWrapper');
    this.fullscreenHovering = false;
    this.calculateDimensions();

    // If fullscreen is not already enabled
    if ( !document['fullscreenElement'] &&
      !document['webkitFullScreenElement'] &&
      !document['mozFullScreenElement'] &&
      !document['msFullscreenElement'] ) {
      // Request full screen
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem['webkitRequestFullscreen']) {
        elem['webkitRequestFullscreen']();
      } else if (elem['mozRequestFullScreen']) {
        elem['mozRequestFullScreen']();
      } else if (elem['msRequestFullscreen']) {
        elem['msRequestFullscreen']();
      }
      this.isFullscreen = true;
      return;
    }

    // If fullscreen is already enabled, exit it
    if ( document.exitFullscreen ) {
      document.exitFullscreen();
    } else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document['msExitFullscreen']) {
      document['msExitFullscreen']();
    }
    this.isFullscreen = false;
  }

  // Make sure progress bar updates when video controls are visible
  onMouseEnterStage() {
    this.videoComponent.modalHover = true;
    this.videoComponent.onMouseEnter();
  }

  // Stop updating progress bar when controls aren't visible
  onMouseLeaveStage() {
    this.videoComponent.modalHover = false;
    this.videoComponent.onMouseLeave();
  }

  getOwnerIconTime() {
    const session = this.session.getLoggedInUser();
    if (session && session.guid === this.entity.ownerObj.guid) {
      return session.icontime;
    } else {
      return this.entity.ownerObj.icontime;
    }
  }

  // Dismiss modal when backdrop is clicked and modal is open
  @HostListener('document:click', ['$event']) clickedBackdrop($event){
    if (this.isOpen) {
      this.dismissModal();
    }
  }

  // Don't dismiss modal when clicking somewhere other than backdrop
  clickedModal($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  dismissModal() {
    this.overlayModal.dismiss();
  }

  ngOnDestroy() {
    if (this.isOpenTimeout) {
      clearTimeout(this.isOpenTimeout);
    }

    // If the modal was closed without a redirect, replace media page url
    // with original source url and fix browser history so back button
    // doesn't go to media page
    if (!this.navigatedAway) {
      this.location.replaceState(this.entity.modal_source_url);
    }
  }
}

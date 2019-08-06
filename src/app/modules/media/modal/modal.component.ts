import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Event, NavigationStart } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Session } from '../../../services/session';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { AnalyticsService } from '../../../services/analytics';
import isMobile from '../../../helpers/is-mobile';
import isMobileOrTablet from '../../../helpers/is-mobile-or-tablet';


@Component({
  selector: 'm-media--modal',
  templateUrl: 'modal.component.html',
  animations: [
    // Fade in image when it's done loading
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
  isTablet: boolean = false;

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

  title: string = '';
  thumbnail: string = '';
  boosted: boolean = false;

  isOpen: boolean = false; // Used for backdrop click detection hack
  isOpenTimeout: any = null; // Used for backdrop click detection hack

  routerSubscription: Subscription;

  @Input('entity') set data(entity) {
    this.entity = entity;
  }

  constructor(
    public session: Session,
    private overlayModal: OverlayModalService,
    private router: Router,
    private location: Location,
    public analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    // Prevent dismissal of modal when it's just been opened
    this.isOpenTimeout = setTimeout(() => this.isOpen = true, 50);

    this.analyticsService.send('pageview', {url: `/media/${this.entity.entity_guid}?ismodal=true`});

    // this.isTablet = isMobileOrTablet() && !isMobile();

    this.thumbnail = `${this.minds.cdn_url}fs/v1/thumbnail/${this.entity.entity_guid}/xlarge`;
    this.boosted = this.entity.boosted || this.entity.p2p_boosted;

    // Set title
    if ( !this.entity.title ) {
      if ( !this.entity.message ) {
        // ? is there ever a case where there is a message but no title?
        this.title = `${this.entity.ownerObj.name}'s post`;
      } else {
        this.title = this.entity.message;
      }
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

          this.overlayModal.dismiss();
        }
      }

    });

    // Dimensions are in px
    this.entity.width = this.entity.custom_data[0].width;
    this.entity.height = this.entity.custom_data[0].height;
    this.entity.aspectRatio = this.entity.width / this.entity.height;
    this.entity.isPortrait = this.entity.aspectRatio < 1;
    console.log(this.entity);

    this.screenWidth = screen.width;
    this.screenHeight = screen.height;
    this.contentWidth = Math.round(this.screenWidth * 0.25);
    this.minStageHeight = Math.round((this.screenHeight * 0.6) - 20); // 520px
    this.maxHeight = Math.round(this.screenHeight * 0.8); // ~723px
    this.stageWidthPaddingThreshold = this.screenWidth * 0.4 + 44; // 620

    this.calculateDimensions();
  }

  // Change media containers' height/width on window resize
  @HostListener('window:resize', ['$resizeEvent'])
    onResize(resizeEvent) {
      this.calculateDimensions();
    }

  calculateDimensions() {
    // This can be simplified but it works
    const windowWidth: number = window.innerWidth;
    const windowHeight: number = window.innerHeight;

    if ( !this.isFullscreen ) {
    // Set stageHeight as % of windowHeight
    this.stageHeight = Math.round(windowHeight * 0.94);

    // Ensure stageHeight is between min and max (max. is % of screenHeight)
    if ( this.stageHeight > this.maxHeight ) {
      this.stageHeight = this.maxHeight;
    } else if ( this.stageHeight < this.minStageHeight ) {
      // Stage height should be no lower than minimum
      this.stageHeight = this.minStageHeight;
    }


    // Set image height as hight as stageHeight but no larger than intrinsic height
    if (this.entity.height >= this.stageHeight) {
      this.mediaHeight = this.stageHeight;
    } else {
      this.mediaHeight = this.entity.height;
      this.stageHeight = this.minStageHeight;
    }
    this.mediaWidth = Math.round(this.mediaHeight * this.entity.aspectRatio);

    // If width is lower than threshold, add extra padding
    const minStageWidth = this.stageWidthPaddingThreshold + 40; // 660
    // TODO rename minStageWidth.  Here it's 660. but technically also it goes down to 621

    let maxStageWidth: number = windowWidth - 400;
    // Don't let maxStageWidth go below minStageWidth
    if ( maxStageWidth <= minStageWidth ) {
      maxStageWidth = minStageWidth;
    }

    // Reset mediaWidth and stageWidth if needed
    // If image is too wide, set width to max and rescale imageHeight and stageHeight
      if ( this.mediaWidth >= maxStageWidth ) {
        this.mediaWidth = maxStageWidth;
        this.stageWidth = maxStageWidth;

        // Rescale media based on new mediaWidth
        this.mediaHeight = Math.round(this.mediaWidth / this.entity.aspectRatio);
        if ( this.mediaHeight >= this.minStageHeight ) {
          this.stageHeight = this.mediaHeight;
        } else {
          this.stageHeight = this.minStageHeight;
        }
      } else if ( this.mediaWidth > this.stageWidthPaddingThreshold  ) {
        this.stageWidth = this.mediaWidth;
      } else {
        // When stageWidth goes below threshold, increase horizontal padding up to 20px minimum
        this.stageWidth = minStageWidth;
      }

    } else { // Fullscreen
      this.stageWidth = windowWidth;
      this.stageHeight = windowHeight;

      // Set mediaHeight as tall as possible but not taller than instrinsic height
      this.mediaHeight = this.entity.height < windowHeight ? this.entity.height : windowHeight;
      this.mediaWidth = Math.round(this.mediaHeight * this.entity.aspectRatio);

      // Width was too wide, need to rescale
      if ( this.mediaWidth > windowWidth ) {
        this.mediaWidth = windowWidth;
        this.mediaHeight = Math.round(this.mediaWidth / this.entity.aspectRatio);
      }
    }

    this.modalWidth = this.stageWidth + this.contentWidth;
  }

  getOwnerIconTime() {
    const session = this.session.getLoggedInUser();
    if (session && session.guid === this.entity.ownerObj.guid) {
      return session.icontime;
    } else {
      return this.entity.ownerObj.icontime;
    }
  }

  // Listen for fullscreen change event in case user enters/exits full screen without clicking button
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullscreenChange(event) {
    this.calculateDimensions();
    if (!document.fullscreenElement && !document['webkitFullScreenElement'] && !document['mozFullScreenElement'] && !document['msFullscreenElement']) {
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
    if (!document['fullscreenElement'] && !document['webkitFullScreenElement'] && !document['mozFullScreenElement'] && !document['msFullscreenElement']) {
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
    if (document.exitFullscreen) {
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

  // Dismiss modal when backdrop is clicked and modal is open
  @HostListener('document:click', ['$event']) clickedBackdrop($event){
    if (this.isOpen) {
      this.dismiss();
    }
  }

  // Don't dismiss modal when modal is clicked
  clickedModal($event) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('***modal clicked...dont dismiss');
  }

  dismiss() {
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


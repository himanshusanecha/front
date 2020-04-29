import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Injector,
  SkipSelf,
} from '@angular/core';
import { YoutubeMigrationService } from '../youtube-migration.service';
import { Session } from '../../../../services/session';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OverlayModalService } from '../../../../services/ux/overlay-modal';
import { YoutubeMigrationSetupModalComponent } from '../setup-modal/setup-modal.component';

@Component({
  selector: 'm-youtubeMigration__unmigratedVideos',
  templateUrl: './unmigrated-videos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubeMigrationUnmigratedVideosComponent
  implements OnInit, OnDestroy {
  @SkipSelf() private injector: Injector;

  init: boolean = false;
  videos: any = [];
  unmigratedVideosSubscription: Subscription;

  constructor(
    protected youtubeService: YoutubeMigrationService,
    protected session: Session,
    protected route: ActivatedRoute,
    protected overlayModal: OverlayModalService,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.unmigratedVideosSubscription = this.youtubeService.unmigratedVideos$.subscribe(
      unmigratedVideos => {
        this.videos = unmigratedVideos;
        this.init = true;
        this.detectChanges();
      }
    );

    this.route.queryParamMap.subscribe(params => {
      if (params.get('status') === 'setup') {
        this.openSetupModal();
      }
    });
  }

  ngOnDestroy() {
    this.unmigratedVideosSubscription.unsubscribe();
  }

  openYoutubeWindow($event): void {
    const url: string = $event.video.url;
    window.open(url, '_blank');
  }

  openSetupModal(): void {
    this.overlayModal
      .create(
        YoutubeMigrationSetupModalComponent,
        null,
        {
          wrapperClass: 'm-modalV2__wrapper',
        },
        this.injector
      )
      .present();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

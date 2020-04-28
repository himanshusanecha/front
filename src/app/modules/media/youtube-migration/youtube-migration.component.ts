import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YoutubeMigrationService } from './youtube-migration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Session } from '../../../services/session';
import { FeaturesService } from '../../../services/features.service';

@Component({
  selector: 'm-youtubeMigration',
  templateUrl: './youtube-migration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubeMigrationComponent implements OnInit, OnDestroy {
  init: boolean = false;
  connectedSubscription: Subscription;
  selectedChannelSubscription: Subscription;
  isConnected: boolean;
  channelTitle: string = '';
  channelId: string = '';
  refreshInterval: any;

  constructor(
    protected youtubeService: YoutubeMigrationService,
    protected featuresService: FeaturesService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected session: Session,
    protected cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {}

  ngOnInit() {
    if (!this.featuresService.has('yt-importer')) {
      this.router.navigate(['settings/canary/other']);
      return;
    }

    // Initialize connected observable
    this.youtubeService.isConnected();

    this.connectedSubscription = this.youtubeService.connected$.subscribe(
      connected => {
        this.isConnected = connected;
        // console.log('888 isconnected??', this.isConnected);
        // Initialize video list observables
        if (this.isConnected) {
          // TODO populate multi-channel dropdown with channels
          // this.channels = this.youtubeService.getChannels();
          this.youtubeService.getChannels();
        } else {
          this.init = true;
          this.detectChanges();
        }

        const destination = this.isConnected ? 'dashboard' : 'connect';
        this.router.navigate([destination], { relativeTo: this.route });
        this.detectChanges();
      }
    );

    this.selectedChannelSubscription = this.youtubeService.selectedChannel$.subscribe(
      channel => {
        console.log(
          '888 interval is connected?channel?',
          this.isConnected,
          channel
        );
        if (this.isConnected) {
          this.youtubeService.getAllVideos(channel.id);
          this.channelTitle = channel.title;

          // TODOOJM handle the daily limit
          // refresh only when click transfer all
          // or click import

          // if (this.refreshInterval) {
          //   clearInterval(this.refreshInterval);
          // }
          // if (isPlatformBrowser(this.platformId)) {
          //   this.refreshInterval = setInterval(() => {
          //     console.log('888 getting all vids interval');
          //     this.youtubeService.getAllVideos(channel.id);
          //   }, 5000);
          // }
          this.init = true;
        }
        this.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.connectedSubscription) {
      this.connectedSubscription.unsubscribe();
    }
    if (this.selectedChannelSubscription) {
      this.selectedChannelSubscription.unsubscribe();
    }
  }

  /**
   * Go back to the settings 'Other' menu
   */
  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route.firstChild });
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

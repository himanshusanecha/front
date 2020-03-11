import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MindsVideoPlayerComponent } from '../../media/components/video-player/player.component';
import { ScrollService } from '../../../services/ux/scroll';
import { Session } from '../../../services/session';

@Injectable()
export class VideoAutoplayService implements OnDestroy {
  protected scroll$: Subscription;

  protected visible: boolean = false;

  protected enabled: boolean = true;

  protected userPlaying: MindsVideoPlayerComponent;

  protected currentlyPlaying: MindsVideoPlayerComponent;

  protected players: MindsVideoPlayerComponent[] = [];

  constructor(protected scroll: ScrollService, protected session: Session) {
    this.init();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  registerPlayer(player: MindsVideoPlayerComponent) {
    this.players.push(player);
    return this;
  }

  init() {
    this.scroll$ = this.scroll.listenForView().subscribe(() => {
      this.checkVisibility();
    });
  }

  checkVisibility() {
    if (!this.enabled) {
      return;
    }

    // 33% of the window
    const offsetRange = this.scroll.view.clientHeight / 5;

    const offsetTop = this.scroll.view.scrollTop + offsetRange;
    const offsetBottom = offsetTop + offsetRange;

    for (const item of this.players) {
      const htmlElement = item.elementRef.nativeElement;

      if (!htmlElement) {
        continue;
      }

      const rect = htmlElement.getBoundingClientRect();

      const y1 = rect.top;
      const y2 = offsetTop;
      if (y1 + rect.height < y2 || y1 > offsetBottom) {
        this.stopPlaying(item);
      } else {
        this.tryAutoplay(item);
      }
    }
  }

  tryAutoplay(player: MindsVideoPlayerComponent): void {
    if (!this.userPlaying || !this.userPlaying.isPlaying()) {
      if (this.currentlyPlaying && this.currentlyPlaying !== player) {
        this.currentlyPlaying.stop();
      }
      if (player && !player.isPlaying()) {
        player.mute();
        player.play();
        this.currentlyPlaying = player;
        player.autoplaying = true;
      } else {
        console.warn('player is not defined');
      }
    }
  }

  stopPlaying(player: MindsVideoPlayerComponent): void {
    if (!this.userPlaying && player) {
      player.stop();
      player.autoplaying = false;
    }
  }

  userPlay(player: MindsVideoPlayerComponent): void {
    const user = this.session.getLoggedInUser();
    if (user.plus && !user.disable_autoplay_videos) {
      this.userPlaying = player;
    }
  }

  ngOnDestroy() {
    this.scroll.unListen(this.scroll$);
  }
}

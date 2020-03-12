import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MindsVideoPlayerComponent } from '../../video-player/player.component';
import { ScrollService } from '../../../../../services/ux/scroll';
import { Session } from '../../../../../services/session';

@Injectable()
export class VideoAutoplayService implements OnDestroy {
  protected scroll$: Subscription;

  protected visible: boolean = false;

  protected enabled: boolean = true;

  protected userPlaying: MindsVideoPlayerComponent;

  protected currentlyPlaying: MindsVideoPlayerComponent;

  protected players: MindsVideoPlayerComponent[] = [];

  constructor(protected scroll: ScrollService, protected session: Session) {
    const user = this.session.getLoggedInUser();

    this.setEnabled(user.plus && !user.disable_autoplay_videos);

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
    const offsetRange = this.scroll.view.clientHeight / 3;
    const clientTop = this.scroll.view.getBoundingClientRect().top;

    const offsetTop = clientTop + this.scroll.view.scrollTop + offsetRange;
    const offsetBottom = offsetTop + offsetRange;
    // const offsetBottom = this.scroll.view.clientHeight + this.scroll.view.scrollTop;

    let foundSuitablePlayer: boolean = false;

    // do this only once
    this.players.sort((a, b) => {
      const rect1 = a.elementRef.nativeElement.getBoundingClientRect();
      const rect2 = a.elementRef.nativeElement.getBoundingClientRect();

      return rect1.top - rect2.top;
    });

    for (const item of this.players) {
      const htmlElement = item.elementRef.nativeElement;

      if (!htmlElement) {
        continue;
      }

      // if we already triggered playback in this loop, the rest should just stop
      if (foundSuitablePlayer) {
        this.stopPlaying(item);
        continue;
      }

      const rect = htmlElement.getBoundingClientRect();

      const y1 = rect.top;
      const y2 = offsetTop;
      if (y1 + rect.height < y2 || y1 > offsetBottom) {
        this.stopPlaying(item);
      } else {
        this.tryAutoplay(item);
        foundSuitablePlayer = true;
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

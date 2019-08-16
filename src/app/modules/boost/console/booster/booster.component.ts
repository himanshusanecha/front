import { Component, ComponentFactoryResolver, ViewRef, ChangeDetectorRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedsService } from '../../../../common/services/feeds.service';
import { BoostConsoleType } from '../console.component';
import { Client } from '../../../../services/api';
import { Session } from '../../../../services/session';
import { PosterComponent } from '../../../newsfeed/poster/poster.component';
import { merge } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'm-boost-console-booster',
  templateUrl: 'booster.component.html'
})
export class BoostConsoleBooster {

  inProgress: boolean = false;
  loaded: boolean = false;

  posts: any[] = [];
  media: any[] = [];

  feed$: Observable<BehaviorSubject<Object>[]>;
  componentRef;
  componentInstance: PosterComponent;

  @Input('type') type: BoostConsoleType;

  @ViewChild('poster', { read: ViewContainerRef, static: false }) poster: ViewContainerRef;

  constructor(
    public client: Client,
    public session: Session,
    private route: ActivatedRoute,
    public ownerFeedsService: FeedsService,
    public personalFeedsService: FeedsService,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
  ) { }

  /**
   * subscribes to route parent url and loads component.
   */
  ngOnInit() {
    this.route.parent.url.subscribe(segments => {
      this.type = <BoostConsoleType>segments[0].path;
      this.load(true);
    });
  }

  /**
   * Loads the infinite feed, merging two pipelines into one.
   * @param { boolean } refresh - is the state refreshing?
   */
  load(refresh?: boolean) {
    if (!refresh) {
      return;
    }

    if (refresh) {
      this.ownerFeedsService.clear();
      this.personalFeedsService.clear();
    }

    this.inProgress = true;

    this.ownerFeedsService
      .setEndpoint(`api/v1/entities/owner`)
      .setLimit(12)
      .fetch();

    this.personalFeedsService
      .setEndpoint('api/v1/newsfeed/personal')
      .setLimit(12)
      .fetch();

    this.feed$ = this.ownerFeedsService.feed.pipe(
      merge(this.personalFeedsService.feed)
    );

    this.inProgress = false;
  }

  /**
   * To be called by infinite-feed to load more data from two pipes.
   */
  loadNext() {
   this.loadFeed(this.ownerFeedsService);
   this.loadFeed(this.personalFeedsService);
  }

  /**
   * Reloads an individual feed.
   * @param feed - the feed to reload.
   */
  loadFeed(feed: FeedsService) {
    if (feed.canFetchMore
      && !feed.inProgress.getValue()
      && feed.offset.getValue()
    ) {
      feed.fetch(); // load the next 150 in the background
    }
    feed.loadMore();
  }

  /**
   * If both have more data
   */
  haveMoreData() {
    return ((!this.ownerFeedsService.inProgress && this.ownerFeedsService.hasMore)
      || (!this.personalFeedsService.inProgress && this.personalFeedsService.hasMore));
  }

  /**
   * Detects changes if view is not destroyed.
   */
  detectChanges() {
    if (!(this.cd as ViewRef).destroyed) {
      this.cd.markForCheck();
      this.cd.detectChanges();
    }
  }

  /**
   * Detaches change detector on destroy
   */
  ngOnDestroy() {
    this.cd.detach();
  }
}

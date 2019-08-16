import { Component, ComponentFactoryResolver, ViewRef, ChangeDetectorRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedsService } from '../../../../common/services/feeds.service';
import { BoostConsoleType } from '../console.component';
import { Client } from '../../../../services/api';
import { Session } from '../../../../services/session';
import { PosterComponent } from '../../../newsfeed/poster/poster.component';
import { merge } from 'rxjs/operators';

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

  @Input('type') type: BoostConsoleType;
  feed;
  componentRef;
  componentInstance: PosterComponent;

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

  ngOnInit() {
    this.route.parent.url.subscribe(segments => {
      this.type = <BoostConsoleType>segments[0].path;
      this.load(true);
    });
  }

  async load(refresh?: boolean) {
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

    this.feed = this.ownerFeedsService.feed.pipe(
      merge(this.personalFeedsService.feed)
    );

    this.inProgress = false;
  }

  loadNext() {
   this.loadFeed(this.ownerFeedsService);
   this.loadFeed(this.personalFeedsService);
  }

  loadFeed(feed) {
    if (feed.canFetchMore
      && !feed.inProgress.getValue()
      && feed.offset.getValue()
    ) {
      feed.fetch(); // load the next 150 in the background
    }
    feed.loadMore();
  }

  async haveMoreData() {
    return this.ownerFeedsService.inProgress || this.personalFeedsService.inProgress;
  }

  detectChanges() {
    if (!(this.cd as ViewRef).destroyed) {
      this.cd.markForCheck();
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}

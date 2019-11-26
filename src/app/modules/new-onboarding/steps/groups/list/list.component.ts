import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Client } from '../../../../../services/api/client';
import { Storage } from '../../../../../services/storage';
import { FeedsService } from '../../../../../common/services/feeds.service';
import { first } from 'rxjs/operators';

type EntityType = 'group' | 'user';

@Component({
  selector: 'm-group__list',
  templateUrl: 'list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupListComponent implements OnInit {
  @Input() entityType: EntityType = 'user';
  minds = window.Minds;
  inProgress: boolean = false;
  error: string;

  entities: any[] = [];

  constructor(
    public feedsService: FeedsService,
    protected cd: ChangeDetectorRef,
    private client: Client,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.feedsService.feed.subscribe(async entities => {
      if (!entities.length) {
        return;
      }
      this.entities = [];
      for (const entity of entities) {
        if (entity) {
          this.entities.push(await entity.pipe(first()).toPromise());
        }
      }
      this.detectChanges();
    });

    this.load();
  }

  async load(refresh: boolean = false, forceSync: boolean = false) {
    if (refresh) {
      this.feedsService.clear();
    }

    this.inProgress = true;
    this.detectChanges();

    try {
      const hashtags = '';
      const period = '30d';
      const all = '';
      const query = '';
      const nsfw = [];

      this.feedsService
        .setEndpoint(`api/v2/feeds/global/top/channels`)
        .setParams({
          hashtags,
          period,
          all,
          query,
          nsfw,
        })
        .setLimit(12)
        .setCastToActivities(true)
        .fetch();
    } catch (e) {
      console.error('SortedComponent', e);
    }

    this.inProgress = false;
    this.detectChanges();
  }

  async pass(suggestion, e) {
    e.preventDefault();
    e.stopPropagation();
    this.entities.splice(this.entities.indexOf(suggestion), 1);
    this.storage.set(
      `user:suggestion:${suggestion.entity_guid}:removed`,
      suggestion.entity_guid
    );
    await this.client.put(`api/v2/suggestions/pass/${suggestion.entity_guid}`);
    this.detectChanges();
  }

  remove(suggestion) {
    this.entities.splice(this.entities.indexOf(suggestion), 1);
    this.storage.set(
      `user:suggestion:${suggestion.entity_guid}:removed`,
      suggestion.entity_guid
    );
    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

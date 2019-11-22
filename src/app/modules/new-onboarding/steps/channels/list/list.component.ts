import { Component, Input, OnInit } from '@angular/core';
import { Client } from '../../../../../services/api/client';
import { Storage } from '../../../../../services/storage';

type EntityType = 'group' | 'user';

@Component({
  selector: 'm-channel__list',
  templateUrl: 'list.component.html',
})
export class ChannelListComponent implements OnInit {
  @Input() entityType: EntityType = 'user';
  minds = window.Minds;
  suggestions: Array<any> = [];
  lastOffset = 0;
  inProgress: boolean = false;
  error: string;

  constructor(private client: Client, private storage: Storage) {}

  async ngOnInit() {
    this.load();
  }

  async load() {
    this.error = null;
    this.inProgress = true;
    let limit: number = 5;

    if (this.suggestions.length) {
      limit = 1;
    }

    // Subscribe can not rely on next batch, so load further batch
    this.lastOffset = this.suggestions.length ? this.lastOffset + 11 : 0;

    try {
      const response: any = await this.client.get(
        `api/v2/suggestions/${this.entityType}`,
        {
          limit,
          offset: this.lastOffset,
        }
      );
      for (const suggestion of response.suggestions) {
        const removed = this.storage.get(
          `user:suggestion:${suggestion.entity_guid}:removed`
        );
        if (!removed) {
          this.suggestions.push(suggestion);
        }
      }
    } catch (err) {
      this.error = err.message;
    } finally {
      this.inProgress = false;
    }
  }

  async pass(suggestion, e) {
    e.preventDefault();
    e.stopPropagation();
    this.suggestions.splice(this.suggestions.indexOf(suggestion), 1);
    this.storage.set(
      `user:suggestion:${suggestion.entity_guid}:removed`,
      suggestion.entity_guid
    );
    await this.client.put(`api/v2/suggestions/pass/${suggestion.entity_guid}`);

    // load more
    this.load();
  }

  remove(suggestion) {
    this.suggestions.splice(this.suggestions.indexOf(suggestion), 1);
    this.storage.set(
      `user:suggestion:${suggestion.entity_guid}:removed`,
      suggestion.entity_guid
    );
    // load more
    this.load();
  }
}

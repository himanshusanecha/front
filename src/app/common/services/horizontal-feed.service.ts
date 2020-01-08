import { Injectable } from '@angular/core';
import { Client } from '../../services/api/client';
import { EntitiesService } from './entities.service';

export type HorizontalFeedContext = 'container';

@Injectable()
export class HorizontalFeedService {
  constructor(protected client: Client, protected entities: EntitiesService) {}

  async get(
    context: HorizontalFeedContext,
    entity: any
  ): Promise<{ prev; next }> {
    if (!entity) {
      return {
        prev: void 0,
        next: void 0,
      };
    }

    switch (context) {
      case 'container':
        const endpoint = `api/v2/feeds/container/${entity.owner_guid}/all`;
        const params = {
          sync: 1,
          as_activities: 1,
          force_public: 1,
          limit: 1,
          //from_timestamp: entity.time_created,
        };

        return {
          prev: void 0,
          next: await this.fetch(endpoint, params),
        };

      default:
        throw new Error('Unknown Horizontal Feed context');
    }
  }

  async fetch(endpoint: string, params: any): Promise<any> {
    const response = (await this.client.get(endpoint, params, {
      cache: true,
    })) as any;

    if (!response || !response.entities || !response.entities.length) {
      return void 0;
    }

    const feedSyncEntity = response.entities[0];

    if (feedSyncEntity.entity) {
      return feedSyncEntity.entity;
    }

    return this.entities.single(feedSyncEntity.urn).toPromise();
  }
}

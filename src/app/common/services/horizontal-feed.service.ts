import { EventEmitter, Injectable } from '@angular/core';
import { Client } from '../../services/api/client';
import { EntitiesService } from './entities.service';

export type HorizontalFeedContext = 'container';

export interface HorizontalFeedObject {
  index: number;
  entity: any;
}

export type HorizontalFeedResponse = HorizontalFeedObject | null;

interface HorizontalFeedPool {
  entities: any[];
  moreData: boolean;
}

interface HorizontalFeedPools {
  prev: HorizontalFeedPool;
  next: HorizontalFeedPool;
}

interface HorizontalFeedChange {
  context: HorizontalFeedContext;
  cursor: number;
  lastUpdate: number;
}

/**
 * This service allow retrieving entities to navigate through a horizontal feed whose entities will be loaded
 * one by one in specialized components.
 *
 * @todo: RxJS cursor-like get()
 * @todo: Support other kind of context
 */
@Injectable()
export class HorizontalFeedService {
  protected context: HorizontalFeedContext;

  protected baseEntity: any;

  protected limit: number = 600;

  protected cursor: number = 0;

  protected pools: HorizontalFeedPools = {
    next: {
      entities: [],
      moreData: true,
    },
    prev: {
      entities: [],
      moreData: true,
    },
  };

  protected onChangeEmitter: EventEmitter<
    HorizontalFeedChange
  > = new EventEmitter<HorizontalFeedChange>();

  constructor(protected client: Client, protected entities: EntitiesService) {}

  /**
   * Sets the current context and resets
   * @param context
   */
  setContext(context: HorizontalFeedContext): HorizontalFeedService {
    console.debug(`setContext(${context})`);
    this.context = context;
    this.reset();
    return this;
  }

  /**
   * Sets the base entity and resets
   * @param entity
   */
  setBaseEntity(entity: any): HorizontalFeedService {
    console.debug(`setBaseEntity()`, entity);
    this.baseEntity = entity;
    this.reset();
    return this;
  }

  /**
   * Sets the total limit of entities per-side
   * @param limit
   */
  setLimit(limit: number): HorizontalFeedService {
    console.debug(`setLimit(${limit})`);
    this.limit = limit;
    return this;
  }

  /**
   * Reset the cursor and caches
   */
  reset(): HorizontalFeedService {
    console.debug('reset()');

    this.cursor = 0;

    this.pools = {
      next: {
        entities: [],
        moreData: true,
      },
      prev: {
        entities: [],
        moreData: true,
      },
    };

    if (this.context) {
      this._emitChange();
    }

    return this;
  }

  async go(index: number): Promise<HorizontalFeedResponse> {
    console.debug(`go(${index})`, 'before fetch()');
    await this.fetch();
    console.debug(`go(${index})`, 'after fetch()');

    if (!(await this.has(index))) {
      console.debug(`go(${index})`, 'has() is falsey');
      return null;
    }

    this.cursor = index;

    this._emitChange();

    if (index === 0) {
      console.debug(`go(${index})`, 'index is 0, returning base entity');
      return {
        index,
        entity: this.baseEntity,
      };
    }

    const entities =
      index < 0 ? this.pools.prev.entities : this.pools.next.entities;

    console.debug(`go(${index})`, 'got entities array', entities);

    // TODO: Setup resolvable observables in batches when fetching

    const entity = entities[Math.abs(index) - 1] || null;

    console.debug(`go(${index})`, 'entity is', entity);

    if (entity && entity.entity) {
      return {
        index,
        entity: entity.entity,
      };
    }

    console.debug(`go(${index})`, 'resolving entity', entity.urn);

    const resolvedEntity = await this.entities
      .setCastToActivities(true)
      .single(entity.urn)
      .toPromise();

    // ------------------------------------------------------------

    console.debug(`go(${index})`, 'returning resolved entitt', resolvedEntity);

    return {
      index: index,
      entity: resolvedEntity,
    };
  }

  async has(index: number, lazy: boolean = false): Promise<boolean> {
    if (!lazy) {
      console.debug(`has(${index})`, 'before fetch()');
      await this.fetch();
      console.debug(`has(${index})`, 'after fetch()');
    }

    if (!this.baseEntity) {
      return false;
    } else if (index === 0) {
      console.debug(`has(${index})`, 'index is 0');
      return Boolean(this.baseEntity);
    } else if (Math.abs(index) < this.limit) {
      console.debug(`has(${index})`, 'index is non-zero');
      const entities =
        index < 0 ? this.pools.prev.entities : this.pools.next.entities;

      return typeof entities[Math.abs(index) - 1] !== 'undefined';
    }

    console.debug(`has(${index})`, 'index is out of bounds');
    return false;
  }

  prev(): Promise<HorizontalFeedResponse> {
    return this.go(this.cursor - 1);
  }

  hasPrev(lazy: boolean = false): Promise<boolean> {
    return this.has(this.cursor - 1, lazy);
  }

  next(): Promise<HorizontalFeedResponse> {
    return this.go(this.cursor + 1);
  }

  hasNext(lazy: boolean = false): Promise<boolean> {
    return this.has(this.cursor + 1, lazy);
  }

  onChange(): EventEmitter<HorizontalFeedChange> {
    return this.onChangeEmitter;
  }

  protected _emitChange(): void {
    console.log('_emitChange()', 'emitting');

    this.onChangeEmitter.next({
      context: this.context,
      cursor: this.cursor,
      lastUpdate: +Date.now(),
    });
  }

  async fetch(): Promise<void> {
    console.debug(`fetch()`, 'start');

    if (!this.baseEntity) {
      console.debug(`fetch()`, 'no base entity');

      this.pools = {
        next: {
          entities: [],
          moreData: false,
        },
        prev: {
          entities: [],
          moreData: false,
        },
      };

      return;
    }

    switch (this.context) {
      case 'container':
        console.debug(`fetch()`, 'context: container');

        const baseEntity = this.baseEntity;
        const guid = baseEntity.container_guid || baseEntity.owner_guid;
        const endpoint = `api/v2/feeds/container/${guid}/all`;

        const params = {
          sync: 1,
          as_activities: 1,
          force_public: 1,
          limit: this.limit,
        };

        console.debug(`fetch()`, 'base server request:', endpoint, params);

        // TODO: Make this less convoluted
        const [prev, next] = await Promise.all([
          this.pools.prev.moreData
            ? this._fetchFromServer(endpoint, {
                ...params,
                reverse_sort: 1,
                from_timestamp: baseEntity.time_created * 1000 + 1,
              })
            : Promise.resolve(null),
          this.pools.next.moreData
            ? this._fetchFromServer(endpoint, {
                ...params,
                from_timestamp: baseEntity.time_created * 1000 - 1,
              })
            : Promise.resolve(null),
        ]);

        console.debug(`fetch()`, 'got pools', prev, next);

        let changed = false;

        if (prev !== null) {
          this.pools.prev = {
            entities: prev,
            moreData: false,
          };

          changed = true;
        }

        if (next !== null) {
          this.pools.next = {
            entities: next,
            moreData: false,
          };

          changed = true;
        }

        if (changed) {
          this._emitChange();
        }

        break;

      default:
        throw new Error('Unknown Horizontal Feed context');
    }
  }

  protected async _fetchFromServer(
    endpoint: string,
    params: any
  ): Promise<any[]> {
    const response = (await this.client.get(endpoint, params, {
      cache: true,
    })) as any;

    if (!response || !response.entities || !response.entities.length) {
      return [];
    }

    return response.entities;
  }
}

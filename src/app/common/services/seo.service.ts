import { Injectable } from '@angular/core';
import { MindsUser } from '../../interfaces/entities';
import { MetaService, MIN_METRIC_FOR_ROBOTS } from './meta.service';

/**
 * SEO meta headers service
 */
@Injectable()
export class SeoService {
  /**
   * Constructor
   * @param meta
   */
  constructor(protected meta: MetaService) {}

  /**
   * Guess an entity type and sets SEO meta headers
   * @param entity
   */
  set(entity: MindsUser | string): void {
    if (typeof entity === 'string') {
      this.meta.setTitle(entity);
      return;
    }

    switch (entity.type) {
      case 'user':
        this.setUser(entity);
        break;
      default:
        console.warn('Unknown Entity for SEO', entity);
    }
  }

  /**
   * Sets SEO meta headers for a User entity
   * @param user
   */
  protected setUser(user: MindsUser) {
    const url = `/${user.username.toLowerCase()}`;
    this.meta
      .setTitle(`${user.name} (@${user.username})`)
      .setDescription(user.briefdescription || `Subscribe to @${user.username}`)
      .setOgUrl(url)
      .setCanonicalUrl(url)
      .setOgImage(user.avatar_url.master, {
        width: 2000,
        height: 1000,
      })
      .setRobots(
        user['subscribers_count'] < MIN_METRIC_FOR_ROBOTS ? 'noindex' : 'all'
      );

    if (user.is_mature || user.nsfw.length) {
      this.meta.setNsfw(true);
    }
  }
}

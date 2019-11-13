import { Injectable } from '@angular/core';
import { SiteService } from './site.service';
import { Client } from '../../services/api/client';

@Injectable()
export class SsoService {
  protected readonly minds = window.Minds;

  constructor(protected site: SiteService, protected client: Client) {}

  isRequired(): boolean {
    return this.site.isProDomain;
  }

  async connect() {
    try {
      const response: any = await this.client.postRaw(
        `${this.minds.site_url}api/v2/sso/connect`
      );
    } catch (e) {
      console.error(e);
    }
  }
}

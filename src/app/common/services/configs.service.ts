import { Injectable } from '@angular/core';
import { Client } from '../api/client.service';
import { RequestUrlService } from './request-url.service';

@Injectable()
export class ConfigsService {
  private configs = {};

  constructor(private client: Client, private requestUrl: RequestUrlService) {}

  async loadFromRemote() {
    console.log(this.requestUrl.get());

    try {
      this.configs = await this.client.get('api/v1/minds/config');
    } catch (err) {
      console.error(err);
    }
  }

  get(key) {
    return this.configs[key] || null;
  }

  set(key, value): void {
    this.configs[key] = value;
  }
}

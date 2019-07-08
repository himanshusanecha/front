import { EventEmitter, Injectable } from '@angular/core';
import { Client } from '../../services/api/client';

@Injectable()
export class ActivityService {

  activityChanged: EventEmitter<{attribute: string, entity: any}> = new EventEmitter<{attribute: string, entity: any}>();

  constructor(
    private client: Client
  ) {}

  triggerChange(attribute: string, entity: any) {
    this.activityChanged.emit({
      'attribute': attribute,
      'entity': entity
    });
  }

  async toggleAllowComments(entity: any, areAllowed: boolean) {
    const payload = {
      allowed: areAllowed
    };
    const oldValue = entity.allowComments;
    try {
      await this.client.post(`api/v2/permissions/comments/${entity.guid}`, payload);
      return areAllowed;
    } catch (ex) {
      console.error('Error posting activity comment permissions', ex);
      return oldValue;
    }
  }

}

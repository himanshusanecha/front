import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Session } from '../../../services/session';
import { Client } from '../../../services/api';

@Component({
  selector: 'm-join',
  template: `
    <div
      class="m-join__subscribe"
      (click)="subscribe($event)"
      *ngIf="!_entity.subscribed"
    >
      <i class="material-icons">
        add
      </i>
    </div>

    <div
      class="m-join__subscribed"
      (click)="unSubscribe($event)"
      *ngIf="_entity.subscribed"
    >
      <i class="material-icons">
        check
      </i>
    </div>
  `,
})
export class JoinComponent {
  _entity: any = {
    subscribed: false,
  };
  @Output('subscribed') onSubscribed: EventEmitter<any> = new EventEmitter();

  constructor(public session: Session, public client: Client) {}

  @Input('entity')
  set entity(value: any) {
    this._entity = value;
  }

  async subscribe(e) {
    e.preventDefault();
    e.stopPropagation();

    this._entity.subscribed = true;
    this.onSubscribed.next();

    try {
      const response: any = await this.client.post(
        'api/v1/subscribe/' + this._entity.guid,
        {}
      );
      if (response && response.error) {
        throw 'error';
      }

      this._entity.subscribed = true;
    } catch (e) {
      this._entity.subscribed = false;
    }
  }

  async unSubscribe(e) {
    e.preventDefault();
    e.stopPropagation();
    this._entity.subscribed = false;

    try {
      const response: any = await this.client.delete(
        'api/v1/subscribe/' + this._entity.guid,
        {}
      );
      this._entity.subscribed = false;
    } catch (e) {
      this._entity.subscribed = true;
    }
  }
}

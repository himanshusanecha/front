import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Session } from '../../../services/session';
import { Client } from '../../../services/api';
import { GroupsService } from '../../groups/groups-service';

@Component({
  selector: 'm-join',
  template: `
    <div class="m-join__subscribe" (click)="add($event)" *ngIf="!isMember()">
      <i class="material-icons">
        add
      </i>
    </div>

    <div class="m-join__subscribed" (click)="leave($event)" *ngIf="isMember()">
      <i class="material-icons">
        check
      </i>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinComponent {
  _entity: any = {
    subscribed: false,
  };
  @Output('subscribed') onSubscribed: EventEmitter<any> = new EventEmitter();

  constructor(
    public session: Session,
    public client: Client,
    public groupsService: GroupsService,
    public cd: ChangeDetectorRef
  ) {}

  @Input('entity')
  set entity(value: any) {
    this._entity = value;
    this.detectChanges();
  }

  add(e) {
    e.preventDefault();
    e.stopPropagation();

    switch (this._entity.type) {
      case 'user':
        this.subscribe();
        break;
      case 'group':
        this.joinGroup();
        break;
    }
  }

  leave(e) {
    e.preventDefault();
    e.stopPropagation();

    switch (this._entity.type) {
      case 'user':
        this.unSubscribe();
        break;
      case 'group':
        this.leaveGroup();
        break;
    }
  }

  isMember() {
    switch (this._entity.type) {
      case 'user':
        return this._entity.subscribed;
      case 'group':
        return this._entity['is:member'];
    }
  }

  private async joinGroup() {
    this._entity['is:member'] = true;
    this.onSubscribed.next();
    this.detectChanges();

    try {
      await this.groupsService.join(this._entity);
    } catch (e) {
      this._entity['is:member'] = false;
      this.detectChanges();
    }
  }

  private async leaveGroup() {
    this._entity['is:member'] = false;

    this.onSubscribed.next();

    this.detectChanges();

    try {
      await this.groupsService.leave(this._entity);
    } catch (e) {
      this._entity['is:member'] = true;
      this.detectChanges();
    }
  }

  private async subscribe() {
    this._entity.subscribed = true;
    this.onSubscribed.next();

    this.detectChanges();

    try {
      const response: any = await this.client.post(
        'api/v1/subscribe/' + this._entity.guid,
        {}
      );
      if (response && response.error) {
        throw 'error';
      }
    } catch (e) {
      this._entity.subscribed = false;
      this.detectChanges();
    }
  }

  private async unSubscribe() {
    this._entity.subscribed = false;

    this.detectChanges();

    try {
      const response: any = await this.client.delete(
        'api/v1/subscribe/' + this._entity.guid,
        {}
      );
    } catch (e) {
      this._entity.subscribed = true;
      this.detectChanges();
    }
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

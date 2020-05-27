import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { Client } from '../../../services/api/client';
import { Session } from '../../../services/session';
import { SignupModalService } from '../../modals/signup/service';
import { ConfigsService } from '../../../common/services/configs.service';
import { WireModalService } from '../wire-modal.service';

@Component({
  moduleId: module.id,
  selector: 'm-wire--lock-screen',
  templateUrl: 'wire-lock-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WireLockScreenComponent implements OnInit {
  @Input() entity: any;
  @Output('entityChange') update: EventEmitter<any> = new EventEmitter<any>();

  @Input() preview: any;

  showSubmittedInfo: boolean = false;
  inProgress: boolean = false;
  contentType: string;
  isGif: boolean = false;

  constructor(
    public session: Session,
    private client: Client,
    private cd: ChangeDetectorRef,
    private wireModal: WireModalService,
    private modal: SignupModalService,
    private configs: ConfigsService
  ) {}

  ngOnInit() {
    this.contentType = this.getContentType();
  }

  getContentType(): string {
    if (!this.entity) {
      return '';
    }
    const e = this.entity;
    if (e.perma_url && e.entity_guid) {
      return 'blog';
    }
    if (e.custom_type === 'video') {
      return 'video';
    }
    if (e.custom_type === 'batch') {
      // TODOOJM custom_data[0].gif
      return 'image';
    }
    return 'status';
  }

  unlock() {
    if (this.preview) {
      return;
    }

    if (!this.session.isLoggedIn()) {
      this.modal.open();

      return;
    }

    this.showSubmittedInfo = false;
    this.inProgress = true;
    this.detectChanges();

    this.client
      .get('api/v1/wire/threshold/' + this.entity.guid)
      .then((response: any) => {
        if (response.hasOwnProperty('activity')) {
          this.update.next(response.activity);
          this.detectChanges();
        } else if (response.hasOwnProperty('entity')) {
          this.update.next(response.entity);
          this.detectChanges();
        } else {
          this.showWire();
        }
        this.inProgress = false;
        this.detectChanges();
      })
      .catch(e => {
        this.inProgress = false;
        this.detectChanges();
        console.error('got error: ', e);
      });
  }

  async showWire() {
    if (this.preview) {
      return;
    }

    await this.wireModal
      .present(this.entity, {
        default: this.entity.wire_threshold,
      })
      .toPromise();

    this.wireSubmitted();
  }

  wireSubmitted() {
    this.showSubmittedInfo = true;
    this.detectChanges();
  }

  isOwner() {
    return this.entity.ownerObj.guid === this.session.getLoggedInUser().guid;
  }

  getBackground() {
    if (!this.entity || this.contentType === 'status') {
      return null;
    }
    let image;

    if (this.contentType === 'image') {
      image =
        this.configs.get('cdn_assets_url') +
        // 'fs/v1/paywall/preview/' +
        'fs/v1/thumbnail/' +
        this.entity.guid;
      // +
      // '/xlarge'
    }

    return `url(${image})`;
  }

  private detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

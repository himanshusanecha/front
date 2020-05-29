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
import getEntityContentType from '../../../helpers/entity-content-type';

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

  init: boolean = false;
  showSubmittedInfo: boolean = false;
  inProgress: boolean = false;
  contentType: string;
  hasTeaser: boolean = false;
  paywallType: 'plus' | 'tier' | 'ppv' = 'ppv';
  tierName: string | null;

  constructor(
    public session: Session,
    private client: Client,
    private cd: ChangeDetectorRef,
    private wireModal: WireModalService,
    private modal: SignupModalService,
    private configs: ConfigsService
  ) {}

  ngOnInit() {
    if (!this.entity) {
      return;
    }
    this.contentType = getEntityContentType(this.entity);
    if (this.contentType === 'video' || this.contentType === 'blog') {
      this.hasTeaser = true;
    }
    this.getPaywallType();
    this.init = true;
    this.detectChanges();
  }

  // This is temporary until we get this.entity.support_tier
  getPaywallType(): void {
    // this.paywallType = 'plus';
    // this.paywallType = 'tier';
    this.paywallType = 'ppv';
  }

  unlock($event) {
    $event.stopPropagation();

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

  private detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

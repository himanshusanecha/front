import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign } from "../campaigns.type";
import { CampaignsService } from '../campaigns.service';
import { Subscription } from 'rxjs';

@Component({
  providers: [CampaignsService],
  selector: 'm-boost-campaigns-creator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'creator.component.html',
})
export class BoostCampaignsCreatorComponent implements OnInit, OnDestroy {

  isEditing: boolean = false;

  urn: string;

  campaign: Campaign;

  inProgress: boolean = false;

  currentError: string = '';

  protected route$: Subscription;

  constructor(
    protected service: CampaignsService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.reset();

    this.route$ = this.route.params.subscribe(params => {
      if (params.urn && this.urn !== params.urn) {
        this.urn = params.urn;
        this.load();
      }
    });
  }

  ngOnDestroy() {
    this.route$.unsubscribe();
  }

  async load() {
    if (!this.urn) {
      this.isEditing = false;
      this.reset();
      this.detectChanges();
      return;
    }

    this.isEditing = true;
    this.campaign = void 0;
    this.inProgress = true;
    this.detectChanges();

    try {
      const campaign = await this.service.get(this.urn);

      this.campaign = campaign;
    } catch (e) {
      console.error('BoostCampaignsCreatorComponent', e);
      this.currentError = (e && e.message) || 'Unknown error. Check your browser console.';
      this.campaign = void 0;
    }

    this.inProgress = false;
    this.detectChanges();
  }

  reset() {
    this.campaign = {
      name: '',
      type: 'newsfeed',
      budget: 5,
      entity_urns: [],
      hashtags: '',
      start: Date.now(),
      end: Date.now() + (5 * 24 * 60 * 60 * 1000),
      impressions: 0,
    };

    this.currentError = '';

    this.calcImpressions();
  }

  calcImpressions() {
    this.campaign.impressions = (this.campaign.budget || 0) * 1000;
  }

  canSubmit() {
    return this.service.validate(this.campaign);
  }

  get types() {
    return this.service.getTypes();
  }

  async submit() {
    if (!this.canSubmit() || this.inProgress) {
      return;
    }

    this.currentError = '';
    this.inProgress = true;
    this.detectChanges();

    try {
      const campaign = !this.isEditing ?
        await this.service.create(this.campaign) :
        await this.service.update(this.campaign);

      this.router.navigate(['/boost/campaigns/edit', campaign.urn]);
      // NOTE: Keep inProgress true until redirection happens
    } catch (e) {
      console.error('BoostCampaignsCreatorComponent', e);
      this.currentError = (e && e.message) || 'Unknown error. Check your browser console.';
      this.inProgress = false;
    }

    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

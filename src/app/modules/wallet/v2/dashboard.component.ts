import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { WalletDashboardService } from './dashboard.service';
import { Session } from '../../../services/session';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { MindsTitle } from '../../../services/ux/title';
import sidebarMenu from './sidebar-menu.default';
import { Menu } from '../../../common/components/sidebar-menu/sidebar-menu.component';
import { ShadowboxHeaderTab } from '../../../interfaces/dashboard';

@Component({
  selector: 'm-walletDashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDashboardComponent implements OnInit, OnDestroy {
  menu: Menu = sidebarMenu;
  paramsSubscription: Subscription;

  currencies: ShadowboxHeaderTab[];
  activeCurrencyId: string;
  activeViewId: string;
  chartData;

  views: any = {
    tokens: [
      { id: 'overview', label: 'Overview' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'settings', label: 'Settings' },
    ],
    usd: [
      { id: 'transactions', label: 'Transactions' },
      { id: 'settings', label: 'Settings' },
    ],
    eth: [{ id: 'settings', label: 'Settings' }],
    btc: [{ id: 'settings', label: 'Settings' }],
  };

  constructor(
    protected walletService: WalletDashboardService,
    protected session: Session,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    protected title: MindsTitle
  ) {}

  ngOnInit() {
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.title.setTitle('Wallet');
    this.currencies = this.walletService.getCurrencies();

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.activeCurrencyId = params.get('currency');

      if (params.get('view')) {
        this.activeViewId = params.get('view');
      } else {
        this.activeViewId = this.views[this.activeCurrencyId][0];
        this.updateView(this.activeViewId);
      }

      if (this.activeViewId === 'overview') {
        this.chartData = this.currencies.find(
          currency => currency.id === this.activeCurrencyId
        );
      }

      this.detectChanges();
    });
  }

  ngOnDestroy() {
    // No need for this with route params
    // if (this.paramsSubscription) {
    //   this.paramsSubscription.unsubscribe();
    // }
  }

  updateCurrency($event) {
    // this.walletService.updateCurrency($event.tabId);
  }

  updateView(viewId) {
    this.activeViewId = viewId;
    this.router.navigate(['/v2wallet', this.activeCurrencyId, viewId]);

    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}

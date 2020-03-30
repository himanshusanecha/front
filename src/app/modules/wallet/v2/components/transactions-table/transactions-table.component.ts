import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-walletTransactionsTable',
  templateUrl: './transactions-table.component.html',
})
export class WalletTransactionsTableComponent {
  @Input() currency: string;
  @Input() transactions: any;
  @Input() filterApplied: boolean = false;

  typeLabels = {
    'offchain:wire': 'Off-Chain Wire',
    wire: 'On-Chain Wire',
    reward: 'Reward',
    token: 'Purchase',
    withdraw: 'On-Chain Transfer',
    'offchain:boost': 'Off-Chain Boost',
    boost: 'On-Chain Boost',
    pro_earning: 'Pro Earnings',
    payout: 'Payouts',
  };

  constructor() {}

  getTypeLabel(superType) {
    if (this.currency !== 'tokens' && superType === 'wire') {
      // TODOOJM why doesn't it return 'Off0Chain Wire?
      // TODOOJM offchain:wire is stripped from supertype in tx-tokens.comp
      return 'Wire';
    } else {
      return this.typeLabels[superType];
    }
  }
}

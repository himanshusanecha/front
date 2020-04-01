import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Web3WalletService } from '../../blockchain/web3-wallet.service';
import { ApiService } from '../../../common/api/api.service';
import { TokenContractService } from '../../blockchain/contracts/token-contract.service';

@Injectable()
export class PayTokenBalanceService {
  /**
   * Off-chain wallet balance value
   */
  readonly offChainBalance$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  /**
   * On-chain wallet address value
   */
  readonly onChainAddress$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  /**
   * On-chain wallet balance value
   */
  readonly onChainBalance$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  /**
   * Is the on-chain address the receiver wallet?
   */
  readonly isReceiver$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Cap for off-chain Wires value
   */
  readonly wireCap$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Constructor.
   * @param api
   * @param web3Wallet
   * @param tokenContract
   */
  constructor(
    protected api: ApiService,
    protected web3Wallet: Web3WalletService,
    protected tokenContract: TokenContractService
  ) {}

  /**
   * Synchronizes and emit values
   */
  async sync(): Promise<void> {
    const localWallet = await this.web3Wallet.getCurrentWallet();
    const remoteWalletResponse = await this.api
      .get(`api/v2/blockchain/wallet/balance`)
      .toPromise();

    if (remoteWalletResponse) {
      this.wireCap$.next(remoteWalletResponse.wireCap);
      this.offChainBalance$.next(remoteWalletResponse.addresses[1].balance);
    }

    if (localWallet) {
      this.isReceiver$.next(false);
      this.onChainAddress$.next(localWallet);
      this.onChainBalance$.next(
        (await this.tokenContract.balanceOf(localWallet))[0].toString()
      );
    } else if (remoteWalletResponse) {
      this.isReceiver$.next(true);
      this.onChainAddress$.next(remoteWalletResponse.addresses[0].address);
      this.onChainBalance$.next(remoteWalletResponse.addresses[0].balance);
    }
  }
}

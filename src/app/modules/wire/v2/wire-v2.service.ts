import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';
import { MindsUser } from '../../../interfaces/entities';
import { ApiService } from '../../../common/api/api.service';
import { Wallet, WalletV2Service } from '../../wallet/v2/wallet-v2.service';
import { WireService as WireV1Service } from '../wire.service';
import { WireStruc } from '../creator/creator.component';
import { UpgradeOptionInterval } from '../../upgrades/upgrade-options.component';
import { ConfigsService } from '../../../common/services/configs.service';
import { PlusService } from '../../plus/plus.service';
import { ProService } from '../../pro/pro.service';

/**
 * Wire event types
 */
export enum WireEventType {
  Completed = 1,
  Cancelled,
}

/**
 * Wire event
 */
export interface WireEvent {
  type: WireEventType;
  payload?: any;
}

/**
 * Wire reward structure
 */
interface WireReward {
  id: string;
  amount: number;
  description: string;
}

const buildWireRewardEntries = (
  key: string,
  data: Array<any>
): Array<WireReward> =>
  (data || [])
    .map(entry => ({
      id: `${key}:${entry.amount}`,
      amount: entry.amount,
      description: entry.description,
    }))
    .sort((a, b) => a.amount - b.amount);

/**
 * Wire rewards
 */
interface WireRewards {
  description: string;
  count: number;
  tokens: Array<WireReward>;
  usd: Array<WireReward>;
}

/**
 * Upgrade pricing structure
 *  */
export interface WireUpgradePricingOptions {
  monthly: number;
  yearly: number;
}

export interface WireCurrencyOptions {
  tokens: boolean;
  usd: boolean;
  eth: boolean;
  btc: boolean;
}

const DEFAULT_CURRENCY_OPTIONS_VALUE: WireCurrencyOptions = {
  tokens: true,
  usd: false,
  eth: false,
  btc: false,
};

/**
 * Wire types
 */
export type WireType = 'tokens' | 'usd' | 'eth' | 'btc';

/**
 * Default type value
 */
const DEFAULT_TYPE_VALUE: WireType = 'tokens';

/**
 * Upgrade types
 */
export type WireUpgradeType = 'plus' | 'pro';

/**
 * Default upgrade type value
 */
const DEFAULT_UPGRADE_TYPE_VALUE: WireUpgradeType = 'plus';

/**
 * Default isUpgrade flag value
 */
const DEFAULT_IS_UPGRADE_VALUE: boolean = false;

/**
 * Default upgrade type value
 */
const DEFAULT_UPGRADE_INTERVAL_VALUE: UpgradeOptionInterval = 'yearly';

/**
 * Default empty upgrade pricing options
 * (to be populated from configs later)
 */
const DEFAULT_WIRE_UPGRADE_PRICING_OPTIONS: WireUpgradePricingOptions = {
  monthly: 0,
  yearly: 0,
};

/**
 * Wire token types
 */
export type WireTokenType = 'offchain' | 'onchain';

/**
 * Default token type value
 */
const DEFAULT_TOKEN_TYPE_VALUE: WireTokenType = 'offchain';

/**
 * Default amount value
 */
const DEFAULT_AMOUNT_VALUE: number = 1;

/**
 * Default recurring flag value
 */
const DEFAULT_RECURRING_VALUE: boolean = false;

/**
 * Default empty wire rewards
 */
const DEFAULT_WIRE_REWARDS_VALUE: WireRewards = {
  description: '',
  count: 0,
  tokens: [],
  usd: [],
};

/**
 * Data payload. Must match definition below.
 * @see {DataArray}
 */
interface Data {
  entityGuid: string;
  type: WireType;
  upgradeType: WireUpgradeType;
  isUpgrade: boolean;
  upgradeInterval: UpgradeOptionInterval;
  upgradePricingOptions: WireUpgradePricingOptions;
  tokenType: WireTokenType;
  amount: number;
  recurring: boolean;
  owner: MindsUser | null;
  usdPaymentMethodId: string;
  wallet: Wallet;
}

/**
 * Data payload as sorted array. Must match above definition.
 * @see {Data}
 */
type DataArray = [
  string,
  WireType,
  WireUpgradeType,
  boolean,
  UpgradeOptionInterval,
  WireUpgradePricingOptions,
  WireTokenType,
  number,
  boolean,
  MindsUser,
  string,
  Wallet
];

/**
 * Data validation.
 */
interface DataValidation {
  isValid: boolean;
  isErrorVisible?: boolean;
  error?: string;
}

/**
 * Wire v2 service, using v1 Wire as low-level implementation
 */
@Injectable()
export class WireV2Service implements OnDestroy {
  /**
   * The entity that's going to receive the payment
   */
  readonly entityGuid$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  /**
   * Wire type subject
   */
  readonly type$: BehaviorSubject<WireType> = new BehaviorSubject<WireType>(
    DEFAULT_TYPE_VALUE
  );

  /**
   * Wire upgrade type subject
   */
  readonly upgradeType$: BehaviorSubject<WireUpgradeType> = new BehaviorSubject<
    WireUpgradeType
  >(DEFAULT_UPGRADE_TYPE_VALUE);

  /**
   * Wire type subject
   */
  readonly isUpgrade$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    DEFAULT_IS_UPGRADE_VALUE
  );

  /**
   * Wire upgrade interval subject
   */
  readonly upgradeInterval$: BehaviorSubject<
    UpgradeOptionInterval
  > = new BehaviorSubject<UpgradeOptionInterval>(
    DEFAULT_UPGRADE_INTERVAL_VALUE
  );

  /**
   * Wire upgrade pricing options subject
   */
  readonly upgradePricingOptions$: BehaviorSubject<
    WireUpgradePricingOptions
  > = new BehaviorSubject<WireUpgradePricingOptions>(
    DEFAULT_WIRE_UPGRADE_PRICING_OPTIONS
  );

  /**
   * Wire token type subject
   */
  readonly tokenType$: BehaviorSubject<WireTokenType> = new BehaviorSubject<
    WireTokenType
  >(DEFAULT_TOKEN_TYPE_VALUE);

  /**
   * Amount subject
   */
  readonly amount$: BehaviorSubject<number> = new BehaviorSubject<number>(
    DEFAULT_AMOUNT_VALUE
  );

  /**
   * Recurring flag subject
   */
  readonly recurring$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    DEFAULT_RECURRING_VALUE
  );

  /**
   * USD payload subject (card selector payment ID)
   */
  readonly usdPaymentMethodId$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('');

  /**
   * User resolver that's going to asynchronously re-sync the reward tiers (state)
   */
  readonly ownerResolver$: BehaviorSubject<MindsUser | null> = new BehaviorSubject<MindsUser | null>(
    null
  );

  /**
   * User that's going to receive the payment (might be the same as the entity itself) (state)
   */
  readonly owner$: BehaviorSubject<MindsUser | null> = new BehaviorSubject<MindsUser | null>(
    null
  );

  /**
   * Wire Rewards (Shop support tiers)
   */
  readonly wireRewards$: BehaviorSubject<WireRewards> = new BehaviorSubject<
    WireRewards
  >(DEFAULT_WIRE_REWARDS_VALUE);

  /**
   * Sum of the accumulated Wires in the last 30 days, per currency
   */
  readonly sums$: BehaviorSubject<{
    [key: string]: string;
  }> = new BehaviorSubject<{ [key: string]: string }>({});

  /**
   * "In Progress" flag subject (state)
   */
  readonly inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  protected readonly currencyOptions$: BehaviorSubject<
    WireCurrencyOptions
  > = new BehaviorSubject<WireCurrencyOptions>(DEFAULT_CURRENCY_OPTIONS_VALUE);

  /**
   * Validate data observable
   */
  readonly validation$: Observable<DataValidation>;

  /**
   * Wire payload observable
   */
  protected readonly wirePayload$: Observable<WireStruc>;

  /**
   * Wire payload snapshot
   */
  protected wirePayload: WireStruc;

  /**
   * Wire snapshot subscription
   */
  protected readonly wirePayloadSnapshotSubscription: Subscription;

  /**
   * Observer subscription that emits passed User, then refresh its rewards data
   */
  protected ownerResolverSubscription: Subscription;

  /**
   * Prices for upgrades to Pro/Plus
   */
  readonly upgrades: any;

  isPlus: boolean;
  isPro: boolean;

  /**
   * Constructor. Initializes data payload observable subscription.
   * @param wallet
   * @param api
   * @param v1Wire
   */
  constructor(
    public wallet: WalletV2Service,
    protected api: ApiService,
    protected v1Wire: WireV1Service,
    private plusService: PlusService,
    private proService: ProService,
    configs: ConfigsService
  ) {
    this.upgrades = configs.get('upgrades');

    // Combine state
    const wireData$ = combineLatest([
      this.entityGuid$,
      this.type$,
      this.upgradeType$,
      this.isUpgrade$,
      this.upgradeInterval$,
      this.upgradePricingOptions$,
      this.tokenType$,
      this.amount$,
      this.recurring$,
      this.owner$.pipe(
        distinctUntilChanged(),
        tap(owner => {
          // Reset the currency options when the owner obj changes
          this.currencyOptions$.next({
            tokens: true,
            usd: owner && owner.merchant && owner.merchant.id,
            eth: owner && !!owner.eth_wallet,
            btc: owner && !!owner.btc_address,
          });
        })
      ),
      this.usdPaymentMethodId$,
      this.wallet.wallet$,
    ]).pipe(
      map(
        ([
          entityGuid,
          type,
          upgradeType,
          isUpgrade,
          upgradeInterval,
          upgradePricingOptions,
          tokenType,
          amount,
          recurring,
          owner,
          usdPaymentMethodId,
          wallet,
        ]: DataArray): Data => ({
          entityGuid,
          type,
          upgradeType,
          isUpgrade,
          upgradeInterval,
          upgradePricingOptions,
          tokenType,
          amount,
          recurring,
          owner,
          usdPaymentMethodId,
          wallet,
        })
      )
    );

    // Wire payload observable
    this.wirePayload$ = wireData$.pipe(
      map((data: Data): WireStruc => this.buildWirePayload(data))
    );

    // Wire data validation
    this.validation$ = wireData$.pipe(
      map((data: Data): DataValidation => this.validate(data))
    );

    // Build Wire payload snapshot
    this.wirePayloadSnapshotSubscription = this.wirePayload$.subscribe(
      wirePayload => (this.wirePayload = wirePayload)
    );

    // Resolves the owner from the cached entity, then re-sync from the server and fetch the rewards sums
    this.ownerResolverSubscription = this.ownerResolver$.subscribe(owner => {
      // Emit cached owner
      this.owner$.next(owner);

      if (owner && owner.guid) {
        // Re-sync owner and rewards

        this.api
          .get(`api/v1/wire/rewards/${owner.guid}`)
          .toPromise()
          .then(({ merchant, eth_wallet, wire_rewards, sums }) => {
            // TODO: Prone to race conditions and non-cancellable, find a better rxjs-ish way
            const currentOwnerValue = this.owner$.getValue();

            if (!currentOwnerValue || currentOwnerValue.guid !== owner.guid) {
              // Stale response, do nothing
              return;
            }

            // Update owner
            owner.merchant = merchant;
            owner.eth_wallet = eth_wallet;
            owner.wire_rewards = wire_rewards;

            // Update rewards
            const tokenRewards = buildWireRewardEntries(
              'tokens',
              wire_rewards.rewards.tokens
            );

            const usdRewards = buildWireRewardEntries(
              'usd',
              wire_rewards.rewards.money
            );

            this.wireRewards$.next({
              description: wire_rewards.description || '',
              count: tokenRewards.length + usdRewards.length,
              tokens: tokenRewards,
              usd: usdRewards,
            });

            // Emit
            this.owner$.next(owner);
            this.sums$.next(sums);
          });
      }
    });

    // Sync balances
    this.wallet.getTokenAccounts();

    this.getIsPlus().then(isPlus => {
      this.isPlus = isPlus;
    });

    this.getIsPlus().then(isPro => {
      this.isPro = isPro;
    });
  }

  /**
   * Destroy lifecycle hook
   */
  ngOnDestroy(): void {
    if (this.wirePayloadSnapshotSubscription) {
      this.wirePayloadSnapshotSubscription.unsubscribe();
    }

    if (this.ownerResolverSubscription) {
      this.ownerResolverSubscription.unsubscribe();
    }
  }

  /**
   * Sets the entity and the owner of it
   * @param entity
   */
  setEntity(entity: any): WireV2Service {
    // Set the entity
    let guid: string = '';

    if (entity && entity.guid) {
      guid = entity.guid;
    } else if (entity && entity.entity_guid) {
      guid = entity.entity_guid;
    }

    // Set the owner
    let owner: MindsUser | null = null;

    if (entity && entity.type === 'user') {
      owner = { ...entity };
    } else if (entity && entity.ownerObj) {
      owner = { ...entity.ownerObj };
    }

    // Emit
    this.entityGuid$.next(guid);
    this.ownerResolver$.next(owner);

    return this;
  }

  /**
   * Sets the Wire type
   * @param type
   */
  setType(type: WireType): WireV2Service {
    this.type$.next(type);

    if (!this.canRecur(type, this.tokenType$.getValue())) {
      this.recurring$.next(false);
    }

    this.setUpgradePricingOptions(type, this.upgradeType$.value);

    return this;
  }

  /**
   * Sets whether the wire is paying for a channel upgrade
   * and assumes the upgrade is recurring
   * @param isUpgrade
   */
  setIsUpgrade(isUpgrade: boolean): WireV2Service {
    this.isUpgrade$.next(isUpgrade);
    this.recurring$.next(true);

    return this;
  }

  /**
   * Sets the upgrade type
   * @param upgradeType
   */
  setUpgradeType(upgradeType: WireUpgradeType): WireV2Service {
    this.upgradeType$.next(upgradeType);
    this.setUpgradePricingOptions(this.type$.value, upgradeType);
    return this;
  }

  /**
   * Sets the upgrade time interval
   * @param upgradeInterval
   */
  setUpgradeInterval(upgradeInterval: UpgradeOptionInterval): WireV2Service {
    // Update the amount when the interval changes
    let upgradePrice = this.upgrades[this.upgradeType$.value][upgradeInterval][
      this.type$.value
    ];
    if (upgradeInterval === 'yearly') {
      upgradePrice = upgradePrice;
    }

    this.setAmount(upgradePrice);

    this.upgradeInterval$.next(upgradeInterval);
    return this;
  }

  /**
   * Sets the upgrade pricing options for the selected
   * upgrade type and currency
   */
  setUpgradePricingOptions(
    type: WireType,
    upgradeType: WireUpgradeType
  ): WireV2Service {
    // If it's an upgrade, calculate the pricing options
    // for the selected currency
    let upgradePricingOptions;

    if (this.isUpgrade$.value) {
      upgradePricingOptions = {
        monthly: this.upgrades[upgradeType]['monthly'][type],
        yearly: this.upgrades[upgradeType]['yearly'][type],
      };
      this.upgradePricingOptions$.next(upgradePricingOptions);
    }
    return this;
  }

  /**
   * Sets the Wire token type
   * @param tokenType
   */
  setTokenType(tokenType: WireTokenType): WireV2Service {
    this.tokenType$.next(tokenType);

    if (!this.canRecur(this.type$.getValue(), tokenType)) {
      this.recurring$.next(false);
    }

    return this;
  }

  /**
   * Sets the Wire amount
   * @param amount
   */
  setAmount(amount: number): WireV2Service {
    this.amount$.next(amount);
    return this;
  }

  /**
   * Sets the Wire recurring flag
   * @param recurring
   */
  setRecurring(recurring: boolean): WireV2Service {
    const canRecur =
      this.canRecur(this.type$.getValue(), this.tokenType$.getValue()) ||
      this.isUpgrade$.getValue();

    this.recurring$.next(canRecur && recurring);
    return this;
  }

  /**
   * Sets the "In Progress" flag
   * @param inProgress
   */
  setInProgress(inProgress: boolean): WireV2Service {
    this.inProgress$.next(inProgress);
    return this;
  }

  /**
   * Sets the USD payload data
   * @param paymentMethodId
   */
  setUsdPaymentMethodId(paymentMethodId: string): WireV2Service {
    this.usdPaymentMethodId$.next(paymentMethodId);
    return this;
  }

  /**
   * Reset the behaviors to its original subjects
   */
  reset(): WireV2Service {
    // Data
    this.setType(DEFAULT_TYPE_VALUE);
    this.setTokenType(DEFAULT_TOKEN_TYPE_VALUE);
    this.setAmount(DEFAULT_AMOUNT_VALUE);
    this.setRecurring(DEFAULT_RECURRING_VALUE);

    // State
    this.setInProgress(false);

    //
    return this;
  }

  /**
   * Checks if a Wire type can have a recurring subscription
   * @param type
   * @param tokenType
   */
  canRecur(type: WireType, tokenType: WireTokenType): boolean {
    return (type === 'tokens' && tokenType === 'offchain') || type === 'usd';
  }

  /**
   * Validates the data
   * @param data
   */
  protected validate(data: Data): DataValidation {
    const valid = (): DataValidation => ({ isValid: true });

    const invalid = (error?: string, isErrorVisible?: boolean) => ({
      isValid: false,
      error,
      isErrorVisible,
    });

    if (!data || !data.entityGuid) {
      return invalid();
    }

    if (this.isUpgrade$.value) {
      if (this.upgradeType$.value === 'pro' && this.isPro) {
        return invalid('You are already a Pro member', true);
      }
      if (this.upgradeType$.value === 'plus' && this.isPlus) {
        return invalid('You are already a Minds+ member', true);
      }
    }

    if (data.amount <= 0) {
      return invalid('Amount should be greater than zero', false);
    }

    const username = data.owner ? `@${data.owner.username}` : 'This channel';

    switch (data.type) {
      case 'tokens':
      case 'eth':
        if (data.type === 'tokens' && data.tokenType === 'offchain') {
          // Off-chain
          if (data.wallet.loaded && data.amount > data.wallet.limits.wire) {
            return invalid(
              `Cannot spend more than ${data.wallet.limits.wire} tokens today`,
              true
            );
          } else if (
            data.wallet.loaded &&
            data.amount > data.wallet.offchain.balance
          ) {
            return invalid(
              `Cannot spend more than ${data.wallet.offchain.balance} tokens`,
              true
            );
          }
        } else {
          // On-chain & Eth
          if (!data.owner || !data.owner.eth_wallet) {
            return invalid(
              `${username} has not configured their Ethereum wallet yet`,
              true
            );
          }
        }
        break;

      case 'usd':
        if (!data.owner || !data.owner.merchant || !data.owner.merchant.id) {
          return invalid(
            `${username} is not able to receive USD at the moment`,
            true
          );
        }
        break;

      case 'btc':
        if (!data.owner || !data.owner.btc_address) {
          return invalid(
            `${username} has not configured their Bitcoin address yet`,
            true
          );
        }
        break;
    }

    return valid();
  }

  /**
   * Builds the Wire payload, suit for v1 Wire service
   * @param data
   */
  protected buildWirePayload(data: Data): WireStruc {
    const wire: Partial<WireStruc> = {
      guid: data.entityGuid,
      amount: data.amount,
      recurring: Boolean(
        this.canRecur(data.type, data.tokenType) && data.recurring
      ),
    };

    switch (data.type) {
      case 'tokens':
        wire.payloadType = data.tokenType;

        if (data.tokenType === 'offchain') {
          wire.payload = {};
        } else if (data.tokenType === 'onchain') {
          wire.payload = {
            receiver: data.owner && data.owner.eth_wallet,
            address: '',
          };
        }
        break;

      case 'usd':
        wire.payloadType = 'usd';
        wire.payload = {
          paymentMethodId: data.usdPaymentMethodId,
        };
        break;

      case 'eth':
        wire.payloadType = 'eth';
        wire.payload = {
          receiver: data.owner && data.owner.eth_wallet,
          address: '',
        };
        break;

      case 'btc':
        wire.payloadType = 'btc';
        wire.payload = {
          receiver: data.owner && data.owner.btc_address,
        };
        break;
    }

    if (data.isUpgrade && data.upgradeInterval) {
      wire.recurringInterval = data.upgradeInterval;
    }

    return wire as WireStruc;
  }

  /**
   * Submits the Wire
   */
  async submit(): Promise<any> {
    if (!this.wirePayload) {
      throw new Error(`There's nothing to send`);
    }

    this.inProgress$.next(true);

    try {
      const response = await this.v1Wire.submitWire(this.wirePayload);
      this.inProgress$.next(false);

      return response;
    } catch (e) {
      this.inProgress$.next(false);
      // Re-throw
      throw e;
    }
  }

  /**
   * Checks user's plus status
   */
  async getIsPlus(): Promise<boolean> {
    return await this.plusService.isActive();
  }

  /**
   * Checks user's plus status
   */
  async getIsPro(): Promise<boolean> {
    return await this.proService.isActive();
  }
}

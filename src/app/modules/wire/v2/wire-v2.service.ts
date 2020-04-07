import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { WireService as WireV1Service } from '../wire.service';
import { map } from 'rxjs/operators';
import { WireStruc } from '../creator/creator.component';
import { MindsUser } from '../../../interfaces/entities';
import { ApiService } from '../../../common/api/api.service';
import { WalletV2Service } from '../../wallet/v2/wallet-v2.service';

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
 * Wire types
 */
type WireType = 'tokens' | 'usd' | 'eth' | 'btc';

/**
 * Wire types that can have a recurring subscription
 */
export const CAN_RECUR: Array<WireType> = ['tokens', 'usd'];

/**
 * Default type value
 */
const DEFAULT_TYPE_VALUE: WireType = 'tokens';

/**
 * Wire token types
 */
type WireTokenType = 'offchain' | 'onchain';

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
 * Data payload
 */
interface Data {
  entityGuid: string;
  type: WireType;
  tokenType: WireTokenType;
  amount: number;
  recurring: boolean;
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

  /**
   * Wire v1 payload
   */
  protected v1Payload: WireStruc;

  /**
   * Observer subscription that continuously builds the payload
   */
  protected payloadSubscription: Subscription;

  /**
   * Observer subscription that emits passed User, then refresh its rewards data
   */
  protected ownerResolverSubscription: Subscription;

  /**
   * Constructor. Initializes data payload observable subscription.
   * @param wallet
   * @param api
   * @param v1Wire
   */
  constructor(
    public wallet: WalletV2Service,
    protected api: ApiService,
    protected v1Wire: WireV1Service
  ) {
    // Generates the payload
    this.payloadSubscription = combineLatest([
      this.entityGuid$,
      this.type$,
      this.tokenType$,
      this.amount$,
      this.recurring$,
    ])
      .pipe(
        map(
          ([entityGuid, type, tokenType, amount, recurring]): Data => ({
            entityGuid,
            type,
            tokenType,
            amount,
            recurring,
          })
        )
      )
      .subscribe((data: Data) => this.buildV1Payload(data));

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
  }

  /**
   * Destroy lifecycle hook
   */
  ngOnDestroy(): void {
    if (this.payloadSubscription) {
      this.payloadSubscription.unsubscribe();
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

    //
    return this;
  }

  /**
   * Sets the Wire type
   * @param type
   */
  setType(type: WireType): WireV2Service {
    this.type$.next(type);

    if (!this.canRecur(type)) {
      this.recurring$.next(false);
    }

    return this;
  }

  /**
   * Sets the Wire token type
   * @param tokenType
   */
  setTokenType(tokenType: WireTokenType): WireV2Service {
    this.tokenType$.next(tokenType);
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
    this.recurring$.next(recurring);
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
   * Builds the v1 Wire payload
   * @param data
   */
  protected buildV1Payload(data: Data) {
    const payload: Partial<WireStruc> = {
      guid: data.entityGuid,
      amount: data.amount,
      recurring: Boolean(data.recurring),
    };

    switch (data.type) {
      case 'tokens':
        payload.payloadType = data.tokenType;
        // TODO: Wire Payload
        break;
      case 'usd':
        payload.payloadType = 'usd';
        // TODO: Wire Payload
        break;
      case 'eth':
        payload.payloadType = 'eth';
        // TODO: Wire Payload
        break;
      case 'btc':
        payload.payloadType = 'btc';
        // TODO: Wire Payload
        break;
    }

    this.v1Payload = payload as WireStruc;
  }

  /**
   * Submits the Wire
   */
  async submit(): Promise<any> {
    if (!this.v1Payload) {
      throw new Error(`There's nothing to send`);
    }

    this.inProgress$.next(true);

    try {
      console.log(this.v1Payload);
      this.inProgress$.next(false);
      return {};
      //return await this.wire.submitWire(this.payload);
    } catch (e) {
      this.inProgress$.next(false);
      // Re-throw
      throw e;
    }
  }

  /**
   * Checks if a Wire type can have a recurring subscription
   * @param type
   */
  canRecur(type: WireType): boolean {
    return CAN_RECUR.indexOf(type) > -1;
  }
}

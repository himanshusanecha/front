import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { WireService } from '../wire.service';
import { map } from 'rxjs/operators';
import { WireStruc } from '../creator/creator.component';
import { MindsUser } from '../../../interfaces/entities';
import { ApiService } from '../../../common/api/api.service';
import { PayTokenBalanceService } from './token-balance.service';

/**
 * Pay event types
 */
export enum PayEventType {
  Completed = 1,
  Cancelled,
}

/**
 * Pay event
 */
export interface PayEvent {
  type: PayEventType;
  payload?: any;
}

/**
 * Pay types
 */
type PayType = 'tokens' | 'usd' | 'eth' | 'btc';

/**
 * Default type value
 */
const DEFAULT_PAY_TYPE_VALUE: PayType = 'tokens';

/**
 * Pay token types
 */
type PayTokenType = 'offchain' | 'onchain';

/**
 * Default token type value
 */
const DEFAULT_PAY_TOKEN_TYPE_VALUE: PayTokenType = 'offchain';

/**
 * Default amount value
 */
const DEFAULT_PAY_AMOUNT_VALUE: number = 0;

/**
 * Default recurring flag value
 */
const DEFAULT_PAY_RECURRING_VALUE: boolean = false;

/**
 * Data payload
 */
interface Data {
  entityGuid: string;
  type: PayType;
  tokenType: PayTokenType;
  amount: number;
  recurring: boolean;
}

/**
 * Pay service, using Wire as low-level implementation
 */
@Injectable()
export class PayService implements OnDestroy {
  /**
   * The entity that's going to receive the payment
   */
  readonly entityGuid$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  /**
   * Pay type subject
   */
  readonly type$: BehaviorSubject<PayType> = new BehaviorSubject<PayType>(
    DEFAULT_PAY_TYPE_VALUE
  );

  /**
   * Pay token type subject
   */
  readonly tokenType$: BehaviorSubject<PayTokenType> = new BehaviorSubject<
    PayTokenType
  >(DEFAULT_PAY_TOKEN_TYPE_VALUE);

  /**
   * Amount subject
   */
  readonly amount$: BehaviorSubject<number> = new BehaviorSubject<number>(
    DEFAULT_PAY_AMOUNT_VALUE
  );

  /**
   * Recurring flag subject
   */
  readonly recurring$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    DEFAULT_PAY_RECURRING_VALUE
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
   * Sum of the accumulated Pay (wires) in the last 30 days, per currency
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
   * Wire payload
   */
  protected payload: WireStruc;

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
   * @param tokenBalance
   * @param api
   * @param wire
   */
  constructor(
    public tokenBalance: PayTokenBalanceService,
    protected api: ApiService,
    protected wire: WireService
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
      .subscribe((data: Data) => this.buildPayload(data));

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

            // Emit
            this.owner$.next(owner);
            this.sums$.next(sums);
          });
      }
    });

    // Sync balances
    this.tokenBalance.sync();
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
  setEntity(entity: any): PayService {
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
   * Sets the Pay type
   * @param type
   */
  setType(type: PayType): PayService {
    this.type$.next(type);
    return this;
  }

  /**
   * Sets the Pay token type
   * @param tokenType
   */
  setTokenType(tokenType: PayTokenType): PayService {
    this.tokenType$.next(tokenType);
    return this;
  }

  /**
   * Sets the Pay amount
   * @param amount
   */
  setAmount(amount: number): PayService {
    this.amount$.next(amount);
    return this;
  }

  /**
   * Sets the Pay recurring flag
   * @param recurring
   */
  setRecurring(recurring: boolean): PayService {
    this.recurring$.next(recurring);
    return this;
  }

  /**
   * Sets the "In Progress" flag
   * @param inProgress
   */
  setInProgress(inProgress: boolean): PayService {
    this.inProgress$.next(inProgress);
    return this;
  }

  /**
   * Reset the behaviors to its original subjects
   */
  reset(): PayService {
    // Data
    this.setType(DEFAULT_PAY_TYPE_VALUE);
    this.setTokenType(DEFAULT_PAY_TOKEN_TYPE_VALUE);
    this.setAmount(DEFAULT_PAY_AMOUNT_VALUE);
    this.setRecurring(DEFAULT_PAY_RECURRING_VALUE);

    // State
    this.setInProgress(false);

    //
    return this;
  }

  /**
   * Builds the Wire payload
   * @param data
   */
  protected buildPayload(data: Data) {
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

    return payload as WireStruc;
  }

  /**
   * Submits the Wire
   */
  async submit(): Promise<any> {
    if (!this.payload) {
      throw new Error(`There's nothing to send`);
    }
    this.inProgress$.next(true);

    try {
      console.log(this.payload);
      this.inProgress$.next(false);
      //return await this.wire.submitWire(this.payload);
    } catch (e) {
      this.inProgress$.next(false);
      // Re-throw
      throw e;
    }
  }
}

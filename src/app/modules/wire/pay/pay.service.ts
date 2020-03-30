import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { WireService } from '../wire.service';
import { map } from 'rxjs/operators';
import { WireStruc } from '../creator/creator.component';

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
   * Constructor. Initializes data payload observable subscription.
   * @param wire
   */
  constructor(protected wire: WireService) {
    this.payloadSubscription = combineLatest([
      this.type$,
      this.tokenType$,
      this.amount$,
      this.recurring$,
    ])
      .pipe(
        map(
          ([type, tokenType, amount, recurring]): Data => ({
            type,
            tokenType,
            amount,
            recurring,
          })
        )
      )
      .subscribe((data: Data) => this.buildPayload(data));
  }

  /**
   * Destroy lifecycle hook
   */
  ngOnDestroy(): void {
    if (this.payloadSubscription) {
      this.payloadSubscription.unsubscribe();
    }
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
      // guid
      amount: data.amount,
      recurring: Boolean(data.recurring),
    };

    switch (data.type) {
      case 'tokens':
        payload.payloadType = data.tokenType;
        break;
      case 'usd':
        payload.payloadType = 'usd';
        break;
      case 'eth':
        payload.payloadType = 'eth';
        break;
      case 'btc':
        payload.payloadType = 'btc';
        break;
    }

    return payload as WireStruc;
  }

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

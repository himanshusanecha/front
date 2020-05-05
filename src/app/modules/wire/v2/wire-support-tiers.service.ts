import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchAll } from 'rxjs/operators';
import { ApiResponse, ApiService } from '../../../common/api/api.service';

export interface SupportTier {
  urn: string;
  entity_guid: string;
  currency: string;
  guid: string;
  amount: number;
  name: string;
  description: string;
}

@Injectable()
export class WireSupportTiersService {
  /**
   *
   */
  readonly entityGuid$: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );

  /**
   *
   */
  readonly supportTier$: Observable<Array<SupportTier>>;

  /**
   * Constructor. Set observables.
   * @param api
   */
  constructor(protected api: ApiService) {
    // Fetch Support Tiers list
    this.supportTier$ = this.entityGuid$.pipe(
      distinctUntilChanged(),
      map(
        (entityGuid: string): Observable<ApiResponse> =>
          entityGuid
            ? this.api.get(`api/v3/wire/supporttiers/${entityGuid}`)
            : of(null)
      ),
      switchAll(),
      map(response =>
        this.parseApiResponse((response && response.support_tiers) || [])
      )
    );
  }

  /**
   *
   * @param entityGuid
   */
  setEntityGuid(entityGuid: string) {
    this.entityGuid$.next(entityGuid);
  }

  /**
   *
   * @param supportTiers
   */
  protected parseApiResponse(
    supportTiers: Array<SupportTier>
  ): Array<SupportTier> {
    return supportTiers.sort((a, b) => {
      if (a.currency === b.currency) {
        return a.amount - b.amount;
      }

      return a.currency < b.currency ? -1 : 1;
    });
  }
}

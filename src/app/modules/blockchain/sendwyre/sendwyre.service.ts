import { Injectable } from '@angular/core';
import { Session } from '../../../services/session';
import { SiteService } from '../../../common/services/site.service';

/**
 * Interface for SendWyre config object
 */
export interface SendWyreConfig {
  paymentMethod: string;
  accountId: string;
  dest: string;
  destCurrency: string;
  sourceAmount: string;
  redirectUrl: string;
  failureRedirectUrl: string;
}

/**
 * Service to handle redirection to SendWyre pay.
 * @author Ben Hayward
 */
@Injectable()
export class SendWyreService {
  /**
   * Amount to be purchased in USD
   */
  public amountUsd: string = '0';

  /**
   * SendWyre base URL
   */
  private baseUrl: string = 'https://pay.sendwyre.com/';

  /**
   * Config to be parsed into query string
   */
  private args: SendWyreConfig = {
    paymentMethod: 'debit-card',
    accountId: 'AC_TNCD9GVCFA9',
    dest: `ethereum:${this.session.getLoggedInUser().eth_wallet}`,
    destCurrency: 'ETH',
    sourceAmount: this.amountUsd,
    redirectUrl: `${this.site.baseUrl}token`,
    failureRedirectUrl: `${this.site.baseUrl}token?purchaseFailed=true`,
  };

  constructor(public session: Session, public site: SiteService) {}

  /**
   * Redirects to SendWyre
   * @param amount - amount of USD to be purchased.
   */
  public redirect(amount: number): void {
    this.amountUsd = amount.toString();
    window.location.assign(this.getUrl(this.args));
  }

  /**
   * Gets the url.
   * @param { SendWyreConfig } args - config object
   * @returns { string }.- the URL.
   */
  public getUrl(args: Object): string {
    return this.baseUrl + this.buildArgs(args);
  }

  /**
   * Builds query string from SendWyre config.
   * @param { SendWyreConfig } - config object.
   * @returns { string } - built query string e.g. ?foo=1&bar=2
   */
  private buildArgs(args: Object): string {
    let queryString = '?';
    for (let [key, value] of Object.entries(args)) {
      if (key && value) {
        queryString = queryString + `${key}=${value}&`;
      }
    }
    return queryString.substring(0, queryString.length - 1);
  }
}

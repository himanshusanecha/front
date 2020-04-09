/**
 * SendWyre popup component.
 * @author Ben Hayward
 */
import { Component, Input } from '@angular/core';
import { Session } from '../../../services/session';
import { SiteService } from '../../../common/services/site.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

@Component({
  selector: 'm-sendWyre',
  template: `
    <div class="m-sendWyre-container">
      <iframe [src]="getUrl(args)"></iframe>
    </div>
  `,
})
export class SendWyreComponent {
  /**
   * Amount to be purchased in USD
   */
  @Input() amountUsd: string = '0';

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
    dest: this.session.getLoggedInUser().eth_wallet,
    destCurrency: 'ETH',
    sourceAmount: this.amountUsd,
    redirectUrl: this.site.baseUrl,
    failureRedirectUrl: `${this.site.baseUrl}token`,
  };

  constructor(
    public session: Session,
    public site: SiteService,
    public sanitizer: DomSanitizer
  ) {
    // console.log(`SendWyre | url is ${this.getUrl(this.args)}`);
  }

  /**
   * Gets the url.
   * @param { SendWyreConfig } args - config object.
   */
  public getUrl(args: Object): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.baseUrl + this.buildArgs(this.args)
    );
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

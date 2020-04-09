import { SendWyreService, SendWyreConfig } from './sendwyre.service';
import { sessionMock } from '../../../../tests/session-mock.spec';
import { MockService } from '../../../utils/mock';
import { SiteService } from '../../../common/services/site.service';

describe('BlockchainService', () => {
  let service: SendWyreService;

  const siteServiceMock: any = MockService(SiteService, {
    props: {
      isProDomain: { get: () => false },
      pro: { get: () => false },
    },
  });

  const sendWyreConfigMock: SendWyreConfig = {
    paymentMethod: 'debit-card',
    accountId: 'X',
    dest: `0x`,
    destCurrency: 'ETH',
    sourceAmount: '40',
    redirectUrl: `https://minds.com/token`,
    failureRedirectUrl: `https://minds.com/token?purchaseFailed=true`,
  };

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
    service = new SendWyreService(sessionMock, siteServiceMock);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be instantiated', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect the user when buy called', () => {
    service.redirect(40);
    expect(service.amountUsd).toBe('40');
  });

  it('should build args into querystring', () => {
    const expectedString =
      'https://pay.sendwyre.com/?paymentMethod' +
      '=debit-card&accountId=X&dest=0x&destCurrency=ETH&sourceAmount' +
      '=40&redirectUrl=https://minds.com/token&failureRedirectUrl=' +
      'https://minds.com/token?purchaseFailed=true';
    expect(service.getUrl(sendWyreConfigMock)).toBe(expectedString);
  });
});

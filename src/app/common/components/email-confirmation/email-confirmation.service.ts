import { Injectable } from '@angular/core';
import { Client } from '../../../services/api/client';

@Injectable()
export class EmailConfirmationService {
  constructor(protected client: Client) {}

  async send(): Promise<boolean> {
    const response = (await this.client.post(
      'api/v2/email/confirmation/resend',
      {}
    )) as any;

    return Boolean(response && response.sent);
  }
}

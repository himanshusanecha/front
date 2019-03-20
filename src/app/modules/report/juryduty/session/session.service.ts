import { Client } from "../../../../services/api";
import { Injectable } from "@angular/core";
import { REASONS } from '../../../../services/list-options';

@Injectable()
export class JurySessionService {

  constructor(
    private client: Client,
  ) {

  }

  async getList(opts) {
    return await this.client.get('api/v2/moderation/jury/' + opts.juryType);
  }

  async overturn(report) {
    const juryType = report.is_appeal ? 'appeal' : 'initial';
    return await this.client.post(`api/v2/moderation/jury/${juryType}/${report.entity_guid}`, {
      decision: 'overturn',
    });
  }

  async uphold(report) {
    const juryType = report.is_appeal ? 'appeal' : 'initial';
    return await this.client.post(`api/v2/moderation/jury/${juryType}/${report.entity_guid}`, {
      decision: juryType === 'appeal' ? 'uphold' : this.getActionId(report),
    });
  }

  private getActionId(report) {
    let id = report.reason_code;
    switch (report.reason_code) {
      case 1:
        id = "1." + report.sub_reason_code;
        break;
      case 2:
        id = "2." + report.sub_reason_code;
        break;
    }
    return id;
  }

  getReasonString(report) {
    let friendlyString = 'removed';
    
    switch (report.reason_code) {
      case 1: 
        friendlyString = 'being illegal (todo)';
        break;
      case 2:
        friendlyString = REASONS[1].reasons[report.sub_reason_code-1].label;
        break;
    }

    return friendlyString;
  }

  getAction(report) {
    let friendlyString = report.entity.type == 'user' ? 'banned' : 'removed';
    
    switch (report.reason_code) {
      case 2: 
        friendlyString = 'marked NSFW';
        break;
    }

    return friendlyString;
  }

}
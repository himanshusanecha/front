import { Component, Injector } from '@angular/core';

import { MessengerEncryptionService } from '../encryption/encryption.service';
import { animations } from '../animations';

@Component({
  moduleId: module.id,
  selector: 'm-messenger--setup',
  templateUrl: 'setup.component.html',
  animations: animations,
})
export class MessengerSetupChat {
  open: boolean = false;
  attentionNeededTrigger: any;

  constructor(public encryption: MessengerEncryptionService) {}

  toggle() {
    this.open = !this.open;
  }

  openPane() {
    this.open = true;
    this.attentionNeededTrigger = Date.now();
  }
}

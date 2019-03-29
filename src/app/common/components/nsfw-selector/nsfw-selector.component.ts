import {
  Component,
  EventEmitter,
  Input,
  Output, 
} from '@angular/core';
import { 
  NSFWSelectorCreatorService,
  NSFWSelectorConsumerService,
  NSFWSelectorEditingService,
} from './nsfw-selector.service';
import { Storage } from '../../../services/storage';

@Component({
  selector: 'm-nsfw-selector',
  templateUrl: 'nsfw-selector.component.html',
  providers: [
    {
      provide: NSFWSelectorEditingService,
      useFactory: (_storage) => new NSFWSelectorEditingService(_storage),
      deps: [ Storage ],
    },
  ],
})

export class NSFWSelectorComponent {
  @Input('service') serviceRef: string = 'consumer';
  @Input('consumer') consumer: false;
  @Output('selected') onSelected: EventEmitter<any> = new EventEmitter();
  @Input() user: any;
  constructor(
    public creatorService: NSFWSelectorCreatorService,
    public consumerService: NSFWSelectorConsumerService,
    private editingService: NSFWSelectorEditingService,
    private storage: Storage,
  ) {
  }

  ngAfterViewInit() {
    this.toggleDefaultNSFW();
  }

  get service() {
    switch (this.serviceRef) {
      case 'editing':
        return this.editingService.build();
        break;
    }
    return this.consumer ? this.consumerService.build() : this.creatorService.build();
  }

  @Input('selected') set selected(selected: Array<number>) {
    for (let i in this.service.reasons) {
      this.service.reasons[i].selected = selected.indexOf(this.service.reasons[i].value) > -1;
    }
  }

  /**
   * Toggles on a reason in the selector -
   * See services for a list of reasons.
   * 
   * @param { array } - one of the objects from the assosciated service.
   */
  toggle(reason) {
    this.service.toggle(reason);

    const reasons = this.service.reasons.filter(r => r.selected);
    this.onSelected.next(reasons);
  }

  /**
   * Toggles on all NSFW tags that the logged in user has on them - 
   * if using the old system of is_mature sets the reason to other.
   */
  toggleDefaultNSFW(){
      let arr: any[] = (this.user && this.user.nsfw.length !== 0) ? this.user.nsfw
        : this.user.is_mature ? [this.service.reasons.length - 1]
        : [];
      arr.map(reason => this.toggle({value:reason}));
  }

  hasSelections(): boolean {
    for (let r of this.service.reasons) {
      if (r.selected)
        return true;
    }
  }

}

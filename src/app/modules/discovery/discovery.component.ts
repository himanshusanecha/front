import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'm-discovery',
  templateUrl: './discovery.component.html',
})
export class DiscoveryComponent implements OnInit {
  plus: boolean = false;
  paramsSubscription: Subscription;

  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    /**
     * Determines sidebar settings
     */
    this.paramsSubscription = this.route.params.subscribe(params => {
      if (params['plus']) {
        this.plus = true;
      }
    });
  }
}

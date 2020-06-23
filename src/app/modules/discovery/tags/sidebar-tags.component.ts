import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoveryTagsService } from './tags.service';

@Component({
  selector: 'm-discovery__sidebarTags',
  templateUrl: './sidebar-tags.component.html',
})
export class DiscoverySidebarTagsComponent {
  limit = 5;
  trending$: Observable<any> = this.service.trending$;
  inProgress$: Observable<boolean> = this.service.inProgress$;

  @Input() plus: boolean = false;
  // TODOPLUS change template title if plus

  constructor(private service: DiscoveryTagsService) {}

  ngOnInit() {
    // TODOPLUS add 'plus' input to loadTags()
    if (!this.service.trending$.value.length) this.service.loadTags();
  }

  seeMore() {
    this.limit = 20;
  }
}

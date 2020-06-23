import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscoveryComponent } from '../discovery.component';

import { DiscoveryModule } from '../discovery.module';
import { DiscoveryPlusComponent } from './plus.component';
import { DiscoveryPlusUpgradeComponent } from './upgrade/upgrade.component';
import { DiscoveryTrendComponent } from '../trends/trend/trend.component';
import { DiscoverySearchComponent } from '../search/search.component';
import { DiscoveryTagsComponent } from '../tags/tags.component';
import { DiscoveryFeedsComponent } from '../feeds/feeds.component';
import { DiscoverySharedModule } from '../discovery-shared.module';
import { SuggestionsModule } from '../../suggestions/suggestions.module';
import { DiscoverySidebarTagsComponent } from '../tags/sidebar-tags.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DiscoveryPlusComponent,
        children: [
          { path: '', redirectTo: 'overview' },
          {
            path: 'overview',
            component: DiscoveryComponent,
            data: { plus: true },
          },
          {
            path: 'trend/:guid',
            component: DiscoveryTrendComponent,
          },
          {
            path: 'search',
            component: DiscoverySearchComponent,
            data: { plus: true },
          },
          {
            path: 'tags',
            component: DiscoveryTagsComponent,
            data: { plus: true },
          },
          {
            path: 'feeds',
            children: [
              { path: '', redirectTo: 'preferred' },
              {
                path: 'preferred',
                component: DiscoveryFeedsComponent,
                data: { plus: true },
              },
              {
                path: 'trending',
                component: DiscoveryFeedsComponent,
                data: { plus: true },
              },
            ],
          },
        ],
      },
    ]),
    NgCommonModule,
    CommonModule,
    SuggestionsModule,
  ],
  declarations: [DiscoveryPlusComponent, DiscoveryPlusUpgradeComponent],
  exports: [DiscoveryPlusComponent],
})
export class DiscoveryPlusModule {}

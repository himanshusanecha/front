import { NgModule } from '@angular/core';

const COMPONENTS = [];

const INTERNAL_COMPONENTS = [];

const PROVIDERS = [];

@NgModule({
  declarations: [...INTERNAL_COMPONENTS, ...COMPONENTS],
  exports: COMPONENTS,
  entryComponents: COMPONENTS,
  providers: PROVIDERS,
})
export class WireV2Module {}

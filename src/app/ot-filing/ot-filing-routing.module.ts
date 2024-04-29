import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtFilingPage } from './ot-filing.page';

const routes: Routes = [
  {
    path: '',
    component: OtFilingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtFilingPageRoutingModule {}

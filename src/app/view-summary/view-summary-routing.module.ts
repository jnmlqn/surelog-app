import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSummaryPage } from './view-summary.page';

const routes: Routes = [
  {
    path: '',
    component: ViewSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewSummaryPageRoutingModule {}

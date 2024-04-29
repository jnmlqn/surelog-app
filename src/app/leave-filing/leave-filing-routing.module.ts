import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaveFilingPage } from './leave-filing.page';

const routes: Routes = [
  {
    path: '',
    component: LeaveFilingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveFilingPageRoutingModule {}

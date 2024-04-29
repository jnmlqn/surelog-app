import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectMembersPage } from './project-members.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectMembersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectMembersPageRoutingModule {}

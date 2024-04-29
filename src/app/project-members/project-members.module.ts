import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ProjectMembersPage } from './project-members.page';

import { ProjectMembersPageRoutingModule } from './project-members-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectMembersPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    ProjectMembersPage
  ]
})
export class ProjectMembersPageModule {}

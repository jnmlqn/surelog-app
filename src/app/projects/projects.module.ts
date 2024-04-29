import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ProjectsPage } from './projects.page';

import { ProjectsPageRoutingModule } from './projects-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectsPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    ProjectsPage
  ]
})
export class ProjectsPageModule {}

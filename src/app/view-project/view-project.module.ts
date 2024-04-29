import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ViewProjectPage } from './view-project.page';

import { ViewProjectPageRoutingModule } from './view-project-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewProjectPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    ViewProjectPage
  ]
})
export class ViewProjectPageModule {}

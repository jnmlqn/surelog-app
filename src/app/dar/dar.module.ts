import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DarPage } from './dar.page';

import { DarPageRoutingModule } from './dar-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DarPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    DarPage
  ]
})
export class DarPageModule {}

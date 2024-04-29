import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LocationPage } from './location.page';

import { LocationPageRoutingModule } from './location-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    LocationPage
  ]
})
export class LocationPageModule {}

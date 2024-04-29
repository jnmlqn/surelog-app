import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OtFilingPage } from './ot-filing.page';

import { OtFilingPageRoutingModule } from './ot-filing-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtFilingPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    OtFilingPage
  ]
})
export class OtFilingPageModule {}

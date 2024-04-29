import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LeaveFilingPage } from './leave-filing.page';

import { LeaveFilingPageRoutingModule } from './leave-filing-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaveFilingPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    LeaveFilingPage
  ]
})
export class LeaveFilingPageModule {}

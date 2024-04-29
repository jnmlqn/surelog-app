import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewSummaryPageRoutingModule } from './view-summary-routing.module';

import { ViewSummaryPage } from './view-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewSummaryPageRoutingModule
  ],
  declarations: [ViewSummaryPage]
})
export class ViewSummaryPageModule {}

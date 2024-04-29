import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SummariesPage } from './summaries.page';

import { SummariesPageRoutingModule } from './summaries-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SummariesPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    SummariesPage
  ]
})
export class SummariesPageModule {}

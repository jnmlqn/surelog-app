import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AttendancePage } from './attendance.page';

import { AttendancePageRoutingModule } from './attendance-routing.module';

import { SharedComponentsModule } from '../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendancePageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [
    AttendancePage
  ]
})
export class AttendancePageModule {}

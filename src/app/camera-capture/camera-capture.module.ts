import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraCapturePageRoutingModule } from './camera-capture-routing.module';

import { CameraCapturePage } from './camera-capture.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CameraCapturePageRoutingModule
  ],
  declarations: [CameraCapturePage]
})
export class CameraCapturePageModule {}

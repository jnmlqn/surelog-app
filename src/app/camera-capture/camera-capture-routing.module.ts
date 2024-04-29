import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CameraCapturePage } from './camera-capture.page';

const routes: Routes = [
  {
    path: '',
    component: CameraCapturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CameraCapturePageRoutingModule {}

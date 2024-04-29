import { CameraPreview , CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-camera-capture',
    templateUrl: './camera-capture.page.html',
    styleUrls: ['./camera-capture.page.scss'],
})
export class CameraCapturePage implements OnInit {

    cameraPosition: string = 'rear';
    is_preview: boolean = false;
    image: string;

    constructor(
        private modalCtrl: ModalController,
    ) {

    }

    ngOnInit() {
        this.startCamera();
    }

    startCamera() {
        this.image = null;
        this.is_preview = false;
        const cameraPreviewOptions: CameraPreviewOptions = {
            position: this.cameraPosition,
            parent: 'cameraPreview',
            className: 'cameraPreview',
            width: window.screen.width,
            height: window.screen.height,
            rotateWhenOrientationChanged: false,
        };
        CameraPreview.start(cameraPreviewOptions);
    }

    flipCamera() {
        this.cameraPosition = (this.cameraPosition == 'rear' ? 'front' : 'rear');
        CameraPreview.stop();
        this.startCamera();
    }

    saveImage() {
        this.modalCtrl.dismiss({
            image: this.image
        });
    }

    async captureImage() {
        const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
            quality: 20
        };
        const result = await CameraPreview.capture(cameraPreviewPictureOptions);
        const base64PictureData = result.value;
        CameraPreview.stop();
        this.image = base64PictureData;
        this.is_preview = true;
    }

    close() {
        CameraPreview.stop();
        this.modalCtrl.dismiss();
    }
}

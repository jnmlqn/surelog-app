import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { CameraCapturePage } from '../camera-capture/camera-capture.page';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { TimeService } from '../services/time/time.service';


@Component({
    selector: 'app-location',
    templateUrl: './location.page.html',
    styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

    location: any = null;
    user: any;
    created_by: string = null;
    active_project: any = null;

    constructor(
        private controller: ControllerService,
        private time: TimeService,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
        private androidPermissions: AndroidPermissions,
        private modalCtrl: ModalController,
        private database: DatabaseService,
    ) {
        
    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.created_by = this.user.id;
        this.initialize();        
    }

    initialize() {
        if(this.user.project_member.length > 0 || this.user.project_authority.length > 0) {
            let active_project: any = localStorage.getItem('active-project');
            if(active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
                this.active_project = JSON.parse(active_project);
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your project location. You may also select a project in My Project/s page if you are the project authority.');
                return;
            }
        } else {
            let active_project: any = localStorage.setItem('active-project', null);
        }

        this.controller.presentLoading('Loading location, please wait...')
        .then((loading) => {
            this.database.getKeyValue(this.keyGenerator())
            .then((res: any) => {
                if(res.rows.length > 0) {
                    loading.dismiss();
                    this.location = JSON.parse(res.rows.item(0).value);
                    this.geocodeLocation(this.location.latitude, this.location.longitude);
                } else {
                    loading.dismiss();
                    this.checkPermission();
                }
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            });
        });
    }

    checkPermission() {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
        .then(
            (result) => {
                if(result.hasPermission) {
                    this.takePicture();
                } else {
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
                    .then((data) => {
                        if(data.hasPermission) {
                            this.takePicture();
                        } else {
                            this.controller.presentAlert('Error', 'Please allow camera access to continue');
                        }
                    })
                    .catch((err) => {
                        this.controller.presentAlert('Error', 'Please allow camera access to continue');
                    });
                }
            },
            (err) => {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
            }
        );
    }

    async takePicture() {       
        const modal = await this.modalCtrl.create({
            component: CameraCapturePage,
        });
        await modal.present();

        let {data} = await modal.onWillDismiss();
        if(data == undefined || data == null) {
            this.controller.presentAlert('Warning', 'You must capture the location image!');
        } else {
            this.controller.presentLoading('Saving, please wait...').then((loading) => {
                this.geolocation.getCurrentPosition()
                .then((resp: any) => {    
                    this.location = {
                        date: this.time.getDate(),
                        project_id: this.active_project ? this.active_project.id : null,
                        image: data.image,
                        latitude: resp.coords.latitude,
                        longitude: resp.coords.longitude,
                        created_by: this.created_by
                    };
                    this.database.saveValue(this.keyGenerator(), JSON.stringify(this.location))
                    .then((res: any) => {
                        this.geocodeLocation(this.location.latitude, this.location.longitude);
                        loading.dismiss();
                    })
                    .catch((error) => {
                        loading.dismiss();
                        this.controller.presentAlert('Error', 'Database error');
                    });
                })
                .catch((error) => {
                    this.controller.presentAlert('Error', 'Error getting location. Please check location access for the app.');
                    loading.dismiss();
                });
            });
        }
    };

    async geocodeLocation(lat, long) {
        let options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 1
        };

        try {
            const geocodeResult = await this.nativeGeocoder.reverseGeocode(lat, long, options);
            this.location.geocodeResult = geocodeResult[0];
        } catch(err) {
            console.log(err);
        }
    }

    keyGenerator() {
        return `location:${this.time.getDate()}:${this.active_project ? this.active_project.id : null}:${this.created_by}`
    }
}

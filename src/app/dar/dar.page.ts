import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { CameraCapturePage } from '../camera-capture/camera-capture.page';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { ModalController } from '@ionic/angular';
import { TimeService } from '../services/time/time.service';

@Component({
    selector: 'app-dar',
    templateUrl: './dar.page.html',
    styleUrls: ['./dar.page.scss'],
})
export class DarPage implements OnInit {

    // adjust this array and object if you need to change the fields
    fields: any = ['weather_condition', 'technical_issues', 'equipment_issues', 'remarks', 'requests'];
    dar: any = {
        data: {
            weather_condition: '',
            technical_issues: '',
            equipment_issues: '',
            remarks: '',
            requests: '',
            images: []
        }
    }
    //

    user: any;
    created_by: string = null;
    active_project: any = null;
    update: boolean = false;

    constructor(
        private controller: ControllerService,
        private time: TimeService,
        private androidPermissions: AndroidPermissions,
        private modalCtrl: ModalController,
        private database: DatabaseService,
    ) {

    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.created_by = this.user.id;

        if(this.user.project_member.length > 0 || this.user.project_authority.length > 0) {
            let active_project: any = localStorage.getItem('active-project');
            if(active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
                this.active_project = JSON.parse(active_project);
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can create/update your project DAR. You may also select a project in My Project/s page if you are the project authority.');
                return;
            }
        } else {
            let active_project: any = localStorage.setItem('active-project', null);
        }

        this.controller.presentLoading('Loading daily activity report, please wait...')
        .then((loading) => {
            this.database.getKeyValue(this.keyGenerator())
            .then((res: any) => {
                if(res.rows.length > 0) {
                    this.update = true;
                    this.dar = JSON.parse(res.rows.item(0).value);
                }
                loading.dismiss();
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            })
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
            // this.controller.presentAlert('Error', 'Error capturing image');
        } else {
            this.dar.data.images.push({
                id: this.controller.generateUUID(),
                image: data.image
            });
        }        
    };

    deleteImage(id) {
        let i = this.controller.findObjectByKey(this.dar.data.images, 'id', id);
        if (i !== null) {
            console.log(i)
            this.dar.data.images.splice(i, 1);
        }
    }

    saveDar() {
        this.controller.presentLoading('Saving, please wait...')
        .then((loading) => {
            if(this.active_project == null && (this.user.project_member.length > 0 || this.user.project_authority.length > 0)) {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your attendance. You may also select a project in My Project/s page if you are the project authority.');
                loading.dismiss();
                return;
            }
            this.dar.date = this.time.getDate();
            this.dar.project_id = (this.active_project ? this.active_project.id : null);
            this.dar.created_by = this.created_by;

            let dbTx: any = null;

            if (this.update) {
                dbTx = this.database.updateValue(this.keyGenerator(), JSON.stringify(this.dar));
            } else {
                dbTx = this.database.saveValue(this.keyGenerator(), JSON.stringify(this.dar));
            }

            dbTx.then((res: any) => {
                this.update = true;
                loading.dismiss();
                this.controller.presentAlert('Success', 'Daily activity report successfully updated!');
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            });
        });
    }

    keyGenerator() {
        return `dar:${this.time.getDate()}:${this.active_project ? this.active_project.id : null}:${this.created_by}`
    }
}

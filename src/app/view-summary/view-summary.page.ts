import { ApiService } from '../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { ModalController } from '@ionic/angular';
import { TimeService } from '../services/time/time.service';

@Component({
    selector: 'app-view-summary',
    templateUrl: './view-summary.page.html',
    styleUrls: ['./view-summary.page.scss'],
})
export class ViewSummaryPage implements OnInit {

    summary: any;
    user: any;

    constructor(
        private modalCtrl: ModalController,
        private api: ApiService,
        private controller: ControllerService,
        private time: TimeService,
        private database: DatabaseService,
    ) {

    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        console.log(this.summary)
    }

    saveSummary() {
        let buttons = [
            {
                text: 'Yes',
                handler: () => {
                    this.controller.presentLoading('Uploading, please wait...')
                    .then((loading) => {
                        this.uploadImages(loading);
                    });
                }
            },
            {
                text: 'No'
            }
        ];

        this.controller.presentAlert('Confirm', 'Please review the summary before uploading. Continue?', buttons);
    }

    deleteSummary() {
        let buttons = [
            {
                text: 'Yes',
                handler: () => {
                    this.controller.presentLoading('Loading daily activity report, please wait...')
                    .then((loading) => {
                        try {
                            this.database.deleteValue(`location:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`)
                            .then(() => {
                                this.database.deleteValue(`attendance:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`)
                                .then(() => {
                                    this.database.deleteValue(`leaves:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`)
                                    .then(() => {
                                        this.database.deleteValue(`overtimes:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`)
                                        .then(() => {
                                            this.database.deleteValue(`dar:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`)
                                            .then(() => {
                                                this.controller.presentAlert('Success', 'Summary deleted successfully');
                                                loading.dismiss();
                                                this.closeModal();
                                            });
                                        });
                                    });
                                });
                            });
                        } catch (e) {
                            loading.dismiss();
                            this.controller.presentAlert('Error', 'Database error');
                        }
                    });
                }
            },
            {
                text: 'No'
            }
        ];

        this.controller.presentAlert('Confirm', 'Are you sure to delete this data?', buttons);
    }

    async uploadImages(loading) {
        let error = false;

        // upload location image
        if(this.summary.location.image_path == null || this.summary.location.image_path == undefined || this.summary.location.image_path == '') {
            await this.api.post('application/upload-image/location', {image: this.summary.location.image}).toPromise()
            .then((res: any) => {
                this.summary.location.image_path = res.data;
            })
            .catch((err: any) => {
                error = err;
            });
           
            if(this.catchError(error, loading)) return;
        }

        // upload attendance images
        for (const att of this.summary.attendance) {
            // upload time in image
            if((att.time_in_image_path == null || att.time_in_image_path == undefined || att.time_in_image_path == '') && att.time_in_image !== null) {
                await this.api.post('application/upload-image/attendance', {image: att.time_in_image}).toPromise()
                .then((res: any) => {
                    att.time_in_image_path = res.data;
                })
                .catch((err: any) => {
                    error = err;
                });
               
                if(this.catchError(error, loading)) break;
            }

            // upload time out image
            if((att.time_out_image_path == null || att.time_out_image_path == undefined || att.time_out_image_path == '') && att.time_out_image !== null) {
                await this.api.post('application/upload-image/attendance', {image: att.time_out_image}).toPromise()
                .then((res: any) => {
                    att.time_out_image_path = res.data;
                })
                .catch((err: any) => {
                    error = err;
                });
               
                if(this.catchError(error, loading)) break;
            }
        }

        // upload dar images
        for (const img of this.summary.dar.data.images) {
            // upload time in image
            if(img.image_path == null || img.image_path == undefined || img.image_path == '') {
                await this.api.post('application/upload-image/dar', {image: img.image}).toPromise()
                .then((res: any) => {
                    img.image_path = res.data;
                })
                .catch((err: any) => {
                    error = err;
                });
               
                if(this.catchError(error, loading)) break;
            }
        }

        this.initializeData(loading);
    }

    catchError(error, loading) {
        if(error) {
            this.controller.showErrorAlert(error);
            loading.dismiss();
            return true;
        }

        return false
    }

    initializeData(loading) {
        // remove base64 string from data object
        let data: any = JSON.stringify(this.summary);
        data = JSON.parse(data);

        delete data.project;

        data.location.image = data.location.image_path;
        delete data.location.image_path;

        for (const att of data.attendance) {
            att.time_in_image = att.time_in_image_path;
            delete att.time_in_image_path;

            att.time_out_image = att.time_out_image_path;
            delete att.time_out_image_path;
        }

        for (const img of data.dar.data.images) {
            img.image = img.image_path;
            delete img.image_path;
        }

        data.date = this.summary.location.date;
        data.project_id = this.summary.project ? this.summary.project.id : null;
        data.user_id = this.user.id;
        //

        this.uploadAttendance(loading, data);
    }

    uploadAttendance(loading, data) {
        this.api.post('attendance/send', data)
        .subscribe(
            (res: any) => {
                this.summary.location.sent = true;
                this.updateDatabase(loading, res);                
            },
            (err: any) => {
                this.controller.showErrorAlert(err);
                loading.dismiss();
            }
        );
    }

    updateDatabase(loading, res) {
        for (const att of this.summary.attendance) {
            att.sent = true;
        }
        
        for (const leave of this.summary.leaves) {
            leave.sent = true;
        }

        for (const overtime of this.summary.overtimes) {
            overtime.sent = true;
        }

        for (const img of this.summary.dar.data.images) {
            img.sent = true;
        }

        try {
            this.database.updateValue(`location:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`, JSON.stringify(this.summary.location))
            .then(() => {
                this.database.updateValue(`attendance:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`, JSON.stringify(this.summary.attendance))
                .then(() => {
                    this.database.updateValue(`leaves:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`, JSON.stringify(this.summary.leaves))
                    .then(() => {
                        this.database.updateValue(`overtimes:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`, JSON.stringify(this.summary.overtimes))
                        .then(() => {
                            this.database.updateValue(`dar:${this.summary.location.date}:${this.summary.location.project_id}:${this.user.id}`, JSON.stringify(this.summary.dar))
                            .then(() => {
                                loading.dismiss();
                                this.controller.presentAlert('Success', res.message);
                            });
                        });
                    });
                });
            });
        } catch (e) {
            loading.dismiss();
            this.controller.presentAlert('Error', 'Data successfully sent but database update failed');
        }
    }

    close() {
        this.modalCtrl.dismiss();
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }
}

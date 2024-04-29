import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AttendanceService } from '../services/attendance/attendance.service';
import { CameraCapturePage } from '../camera-capture/camera-capture.page';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { ProjectMembersPage } from '../project-members/project-members.page';
import { TimeService } from '../services/time/time.service';
import { ViewAttendancePage } from '../view-attendance/view-attendance.page';

@Component({
    selector: 'app-attendance',
    templateUrl: './attendance.page.html',
    styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

    user: any;
    created_by: string = null;
    active_project: any = null;
    day_type: any = null;
    attendance: any = [];
    date: string;
    location: any = null;
    update: boolean = false;

    constructor(
        private att_srvc: AttendanceService,
        private controller: ControllerService,
        private time: TimeService,
        private modalCtrl: ModalController,
        private geolocation: Geolocation,
        private androidPermissions: AndroidPermissions,
        private database: DatabaseService,
    ) {
    }

    ngOnInit() {
        this.date = this.time.getDate();
        this.user = JSON.parse(localStorage.getItem('user'));
        this.created_by = this.user.id;
        this.day_type = JSON.parse(localStorage.getItem('day-type'));
    }    

    ionViewWillEnter() {
        if (this.user.project_member.length > 0 || this.user.project_authority.length > 0) {
            let active_project: any = localStorage.getItem('active-project');
            if (active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
                this.active_project = JSON.parse(active_project);
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your attendance. You may also select a project in My Project/s page if you are the project authority.');
                return;
            }
        } else {
            let active_project: any = localStorage.setItem('active-project', null);
        }

        // check if there's a captured location for the day
        this.controller.presentLoading('Loading location, please wait...')
        .then((loading) => {
            this.database.getKeyValue(`location:${this.date}:${this.active_project ? this.active_project.id : null}:${this.created_by}`)
            .then((res: any) => {
                if(res.rows.length > 0) {
                    loading.dismiss();
                    this.location = JSON.parse(res.rows.item(0).value);
                    this.displayAttendance();
                } else {
                    loading.dismiss();
                    let buttons = [
                        {
                            text: 'Okay',
                            handler: (data) => {
                                this.controller.changePage('/location');
                            }
                        }
                    ];

                    this.controller.presentAlert('Warning', 'Please capture your location first', buttons);
                }
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            })
        });
    }

    selectDayType() {
        let data = null;
        let buttons = [
            {
                text: 'Regular',
                handler: () => {
                    data = {date: this.time.getDate(), type: 'regular'};
                    localStorage.setItem('day-type', JSON.stringify(data));
                    this.day_type = data;
                }
            },
            {
                text: 'Special Holiday',
                handler: () => {
                    data = {date: this.time.getDate(), type: 'special'};
                    localStorage.setItem('day-type', JSON.stringify(data));
                    this.day_type = data;
                }
            },
            {
                text: 'Legal Holiday',
                handler: () => {
                    data = {date: this.time.getDate(), type: 'legal'};
                    localStorage.setItem('day-type', JSON.stringify(data));
                    this.day_type = data;
                }
            },
        ];

        this.controller.presentAlert('Day Type', 'Select day type', buttons);
    }

    changeDate() {
        let buttons = [
            {
                text: 'Okay',
                handler: (data) => {
                    this.date = data.date;
                    this.displayAttendance();
                }
            }
        ];

        let inputs = [
            {
                name: 'date',
                value: this.date,
                type: 'date'
            }
        ];

        this.controller.presentAlert('', 'Select date', buttons, inputs);
    }

    addTimein() {
        if (this.day_type == undefined || this.day_type == null || this.day_type == 'null' || this.day_type == 'undefined' || this.day_type.date !== this.time.getDate()) {
            this.selectDayType();    
        } else {
            if (this.active_project == null && this.user.project_member.length < 1 && this.user.project_authority.length < 1) {
                this.timeInOptions();
            } else if (this.active_project !== null) {
                this.showProjectMembers();
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your attendance. You may also select a project in My Project/s page if you are the project authority.');
            }
        }
    }

    async showProjectMembers() {
        const modal = await this.modalCtrl.create({
            component: ProjectMembersPage,
            componentProps: {
                'project_members': this.active_project.project_members
            }
        });
        await modal.present();

        let {data} = await modal.onWillDismiss();
        if (data !== undefined) {
            this.user = data.member;
            this.timeInOptions();
        }
    }

    timeInOptions() {
        let time = this.time.getDateTime();
        let buttons = [
            {
                text: 'Time In',
                handler: () => {
                    this.checkPermission('in', time);
                }
            },
            {
                text: 'Override Time In',
                handler: () => {
                    this.override('in', time);
                }
            },
            {
                text: 'Cancel'
            },
        ];

        this.controller.presentAlert('Action', 'Select action', buttons);
    }

    timeOutOptions(att) {
        let time = this.time.getDateTime();
        let buttons = [];
        if (att.time_out == null) {
            buttons = [
                {
                    text: 'View Attendance',
                    handler: () => {
                        this.viewAttendance(att);
                    }
                },
                {
                    text: 'Delete Attendance',
                    handler: () => {
                        this.deleteAttendance(att);
                    }
                },
                {
                    text: 'Time Out',
                    handler: () => {
                        this.checkPermission('out', time, att);
                    }
                },
                {
                    text: 'Override Time Out',
                    handler: () => {
                        this.override('out', time, att);
                    }
                },
                {
                    text: 'Cancel'
                },
            ];
        } else {
            buttons = [
                {
                    text: 'View Attendance',
                    handler: () => {
                        this.viewAttendance(att);
                    }
                },
                {
                    text: 'Delete Attendance',
                    handler: () => {
                        this.deleteAttendance(att);
                    }
                },
                {
                    text: 'Cancel'
                },
            ];
        }

        this.controller.presentAlert('Action', 'Select action', buttons);
    }

    async viewAttendance(att) {
        const modal = await this.modalCtrl.create({
            component: ViewAttendancePage,
            componentProps: {
                'attendance': att
            }
        });
        await modal.present();
    }

    checkPermission(mode, time, att?) {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
        .then(
            (result) => {
                if (result.hasPermission) {
                    this.takePicture(mode, time, att);
                } else {
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
                    .then((data) => {
                        if (data.hasPermission) {
                            this.takePicture(mode, time, att);
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

    async takePicture(mode, time, att?) {
        const modal = await this.modalCtrl.create({
            component: CameraCapturePage,
        });
        await modal.present();

        let {data} = await modal.onWillDismiss();
        if (data == undefined || data == null) {
            // this.controller.presentAlert('Error', 'Error capturing image');
        } else {
            if (mode == 'in') {
                this.recordAttendance(data.image, time, 0, 0, 0, 0, 0, null);            
            } else {
                this.updateAttendance(att, data.image, time, 0, null);
            }
        }        
    };

    override(mode, time, att?) {
        let buttons = [
            {
                text: 'Okay',
                handler: (data) => {
                    if (mode == 'in') {
                        this.recordAttendance(null, `${data.date} ${data.time}`, 0, 0, 0, 0, 1, `${data.reason} - override@${time}`);
                    } else {
                        this.updateAttendance(att, null, `${data.date} ${data.time}`, 1, `${data.reason} - override@${time}`);
                    }
                }
            },
            {
                text: 'Cancel'
            },
        ];

        let inputs = [
            {
                name: 'reason',
                placeholder: 'Reason',
                type: 'text'
            },
            {
                name: 'date',
                value: this.time.getDate(),
                type: 'date'
            },
            {
                name: 'time',
                value: this.time.time(),
                type: 'time'
            }
        ];

        this.controller.presentAlert('Override', 'Input override reason', buttons, inputs);
    }

    async recordAttendance(image, time, absent, leave, half_leave, half_day, override, override_in_reason) {
        let checkLeave: any = await this.att_srvc.checkIfLeave(this.time.getDate(time), (this.active_project ? this.active_project.id : null), this.user.id, this.created_by);
        if (checkLeave) {
            this.controller.presentAlert('Warning', 'Leave filing already exist!');
            return;
        }

        let checkTimein: any = await this.att_srvc.checkIfTimedIn(this.time.getDate(time), (this.active_project ? this.active_project.id : null), this.user.id, this.created_by);
        if (checkTimein) {
            this.controller.presentAlert('Warning', 'Attendance record already exist!');
            return;
        }

        this.controller.presentLoading('Saving, please wait...')
        .then((loading) => {
            this.geolocation.getCurrentPosition()
            .then((resp: any) => {
                let official_schedule = this.att_srvc.getOfficialSchedule(this.active_project);
                let data: any = {
                    user_id: this.user.id,
                    name: `${this.user.first_name} ${this.user.last_name}`,
                    project_id: this.active_project ? this.active_project.id : null,
                    official_time_in: official_schedule.time_in,
                    official_time_out: official_schedule.time_out,
                    time_in: time,
                    time_out: null,
                    is_absent: absent,
                    on_leave: leave,
                    on_half_leave: half_leave,
                    is_half_day: half_day,
                    day_type: this.day_type.type,
                    time_in_image: image,
                    time_out_image: null,
                    time_in_latitude: resp.coords.latitude,
                    time_in_longitude: resp.coords.longitude,
                    time_out_latitude: null,
                    time_out_longitude: null,
                    override: override,
                    override_in_reason: override_in_reason,
                    override_out_reason: null,
                    created_by: this.created_by
                }
                
                this.attendance.push(data);
                
                let dbTx: any = null;

                if (this.update) {
                    dbTx = this.database.updateValue(this.keyGenerator(this.time.getDate(data.time_in)), JSON.stringify(this.attendance));
                } else {
                    dbTx = this.database.saveValue(this.keyGenerator(this.time.getDate(data.time_in)), JSON.stringify(this.attendance));
                }

                dbTx.then((res: any) => {
                    this.update = true;
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

    updateAttendance(data, image, time, override, override_out_reason) {
        this.controller.presentLoading('Updating, please wait...')
        .then((loading) => {
            this.geolocation.getCurrentPosition()
            .then((resp: any) => {
                data.time_out = time;
                data.time_out_image = image;
                data.override = data.override == 1 ? 1 : override;
                data.override_out_reason = override_out_reason;
                data.time_out_latitude = resp.coords.latitude;
                data.time_out_longitude = resp.coords.longitude;

                this.database.updateValue(this.keyGenerator(this.time.getDate(data.time_in)), JSON.stringify(this.attendance))
                .then((res: any) => {
                    this.update = true;
                    loading.dismiss();
                })
                .catch((error) => {
                    loading.dismiss();
                    this.controller.presentAlert('Error', 'Database error');
                });
            })
            .catch((error) => {
                this.controller.presentAlert('Error', 'Error getting location. Please check location access for the app.');
            });
        });   
    }

    deleteAttendance(data) {
        let buttons = [
            {
                text: 'Okay',
                handler: () => {
                    let i = this.attendance.indexOf(data);
                    if (this.attendance[i].sent) {
                        this.controller.presentAlert('Warning', 'This record was already sent and uploaded, unable to delete!');
                    } else {
                        this.attendance.splice(i, 1);

                        this.controller.presentLoading('Updating, please wait...')
                        .then((loading) => {
                            this.database.updateValue(this.keyGenerator(this.time.getDate(data.time_in)), JSON.stringify(this.attendance))
                            .then((res: any) => {
                                this.update = true;
                                loading.dismiss();
                            })
                            .catch((error) => {
                                loading.dismiss();
                                this.controller.presentAlert('Error', 'Database error');
                            });
                        });
                    }
                }
            },
            {
                text: 'Cancel'
            },
        ];

        this.controller.presentAlert('Delete', 'Are you sure to delete this attendance record?', buttons, []);
    }

    displayAttendance() {
        this.attendance = [];
        this.controller.presentLoading('Loading attendance, please wait...')
        .then((loading) => {
            this.database.getKeyValue(this.keyGenerator())
            .then((res: any) => {
                if(res.rows.length > 0) {
                    this.update = true;
                    this.attendance = JSON.parse(res.rows.item(0).value);
                    this.attendance = this.attendance ? this.attendance : [];
                }
                loading.dismiss();
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            })
        });
    }

    keyGenerator(date?) {
        return `attendance:${date ? date : this.date}:${this.active_project ? this.active_project.id : null}:${this.created_by}`
    }

}

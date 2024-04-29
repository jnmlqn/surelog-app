import { AttendanceService } from '../services/attendance/attendance.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { ModalController } from '@ionic/angular';
import { ProjectMembersPage } from '../project-members/project-members.page';
import { TimeService } from '../services/time/time.service';

@Component({
    selector: 'app-leave-filing',
    templateUrl: './leave-filing.page.html',
    styleUrls: ['./leave-filing.page.scss'],
})
export class LeaveFilingPage implements OnInit {

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
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your leave filing. You may also select a project in My Project/s page if you are the project authority.');
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
                if (res.rows.length > 0) {
                    loading.dismiss();
                    this.location = JSON.parse(res.rows.item(0).value);
                    this.displayAttendance();
                } else {
                    loading.dismiss();
                    let buttons = [
                        {
                            text: 'Okay',
                            handler: (data) => {
                                this.controller.nav('/location');
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

    fileLeave() {
        if (this.day_type == undefined || this.day_type == null || this.day_type == 'null' || this.day_type == 'undefined' || this.day_type.date !== this.time.getDate()) {
            this.selectDayType();    
        } else {
            if (this.active_project == null && this.user.project_member.length < 1 && this.user.project_authority.length < 1) {
                this.selectAction();
            } else if (this.active_project !== null) {
                this.showProjectMembers();
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your leave filing. You may also select a project in My Project/s page if you are the project authority.');
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
            this.selectAction();
        }
    }

    selectAction(data?) {
        let time = this.time.getDateTime();
        let buttons = [
            {
                text: 'Leave',
                handler: () => {
                    if (data) {
                        this.recordLeave(1, 0, data);
                    } else {
                        this.recordLeave(1, 0);
                    }
                }
            },
            {
                text: 'Half Leave',
                handler: () => {
                    if (data) {
                        this.recordLeave(0, 1, data);
                    } else {
                        this.recordLeave(0, 1);
                    }
                }
            },
            {
                text: 'Delete Attendance',
                handler: () => {
                    this.deleteAttendance(data);
                }
            },
            {
                text: 'Cancel'
            },
        ];

        this.controller.presentAlert(data ? 'Update Filing' : 'Action', 'Select action', buttons);
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

        this.controller.presentAlert('Delete', 'Are you sure to delete this leave filing?', buttons, []);
    }

    async recordLeave(leave, half_leave, leave_data?) {
        if (leave_data) {
            leave_data.on_leave = leave;
            leave_data.on_half_leave = half_leave;
            this.controller.presentLoading('Updating, please wait...')
            .then((loading) => {
                this.database.updateValue(this.keyGenerator(this.time.getDate(leave_data.time_in)), JSON.stringify(this.attendance))
                .then((res: any) => {
                    this.update = true;
                    loading.dismiss();
                })
                .catch((error) => {
                    loading.dismiss();
                    this.controller.presentAlert('Error', 'Database error');
                });
            });
        } else {
            let checkLeave: any = await this.att_srvc.checkIfLeave(this.time.getDate(), (this.active_project ? this.active_project.id : null), this.user.id, this.created_by);
            let checkHalfLeave: any = await this.att_srvc.checkIfHalfLeave(this.time.getDate(), (this.active_project ? this.active_project.id : null), this.user.id, this.created_by);
            if (checkLeave || checkHalfLeave) {
                this.controller.presentAlert('Warning', 'Leave filing already exist!');
                return;
            }

            let checkTimein: any = await this.att_srvc.checkIfTimedIn(this.time.getDate(), (this.active_project ? this.active_project.id : null), this.user.id, this.created_by);
            if (checkTimein) {
                this.controller.presentAlert('Warning', 'Attendance record already exist!');
                return;
            }

            this.controller.presentLoading('Saving, please wait...')
            .then((loading) => {
                let official_schedule = this.att_srvc.getOfficialSchedule(this.active_project);
                let data: any = {
                    user_id: this.user.id,
                    name: `${this.user.first_name} ${this.user.last_name}`,
                    project_id: this.active_project ? this.active_project.id : null,
                    official_time_in: official_schedule.time_in,
                    official_time_out: official_schedule.time_out,
                    time_in: `${this.time.getDate()} ${this.active_project ? this.active_project.project_schedules[0].time_in : this.time.time()}`,
                    time_out: `${this.time.getDate()} ${this.active_project ? this.active_project.project_schedules[0].time_out : this.time.time()}`,
                    is_absent: 0,
                    on_leave: leave,
                    on_half_leave: half_leave,
                    is_half_day: 0,
                    day_type: this.day_type.type,
                    time_in_image: null,
                    time_out_image: null,
                    time_in_latitude: null,
                    time_in_longitude: null,
                    time_out_latitude: null,
                    time_out_longitude: null,
                    override: 0,
                    override_in_reason: null,
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
            });
        }
    }

    displayAttendance() {
        this.attendance = [];
        this.controller.presentLoading('Loading leave filings, please wait...')
        .then((loading) => {
            this.database.getKeyValue(this.keyGenerator())
            .then((res: any) => {
                if (res.rows.length > 0) {
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
        return `leaves:${date ? date : this.date}:${this.active_project ? this.active_project.id : null}:${this.created_by}`
    }

}

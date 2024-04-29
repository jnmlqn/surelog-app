import { DatabaseService } from '../services/database/database.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { ModalController } from '@ionic/angular';
import { ProjectMembersPage } from '../project-members/project-members.page';
import { TimeService } from '../services/time/time.service';

@Component({
    selector: 'app-ot-filing',
    templateUrl: './ot-filing.page.html',
    styleUrls: ['./ot-filing.page.scss'],
})
export class OtFilingPage implements OnInit {

    user: any;
    created_by: string = null;
    active_project: any = null;
    overtimes: any = [];
    date: string;
    location: any = null;
    update: boolean = false;

    constructor(
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
    }

    ionViewWillEnter() {
        if(this.user.project_member.length > 0 || this.user.project_authority.length > 0) {
            let active_project: any = localStorage.getItem('active-project');
            if(active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
                this.active_project = JSON.parse(active_project);
            } else {
                this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your OT filing. You may also select a project in My Project/s page if you are the project authority.');
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
                    this.displayOvertimes();
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

    changeDate() {
        let buttons = [
            {
                text: 'Okay',
                handler: (data) => {
                    this.date = data.date;
                    this.displayOvertimes();
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

    fileOt() {
        if(this.active_project == null && this.user.project_member.length < 1 && this.user.project_authority.length < 1) {
            this.selectAction();
        } else if(this.active_project !== null) {
            this.showProjectMembers();
        } else {
            this.controller.presentAlert('Warning', 'You are assigned in a project, only your project lead/manager can record your OT filing. You may also select a project in My Project/s page if you are the project authority.');
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
        if(data !== undefined) {
            this.user = data.member;
            this.selectAction();
        }
    }

    selectAction(att?) {
        let time = this.time.time();
        let buttons = [];

        if (att) {
            buttons = [
                {
                    text: 'Okay',
                    handler: (ot) => {
                        this.recordOt(ot, att);
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
                }
            ];
        } else {
            buttons = [
                {
                    text: 'Okay',
                    handler: (ot) => {
                        this.recordOt(ot);
                    }
                },
                {
                    text: 'Cancel'
                }
            ];
        }

        let inputs = [
            {
                name: 'date_in',
                value: att ? this.time.getDate(att.time_in) : this.date,
                type: 'date'
            },
            {
                name: 'time_in',
                value: att ? this.time.time(att.time_in) : time,
                type: 'time'
            },
            {
                name: 'date_out',
                value: att ? this.time.getDate(att.time_out) : this.date,
                type: 'date'
            },
            {
                name: 'time_out',
                value: att ? this.time.time(att.time_out) : time,
                type: 'time'
            },
        ];

        this.controller.presentAlert(att ? 'Update Filing' : 'Action', 'Time in & Time out', buttons, inputs);
    }

    deleteAttendance(data) {
        let buttons = [
            {
                text: 'Okay',
                handler: () => {
                    let i = this.overtimes.indexOf(data);
                    if (this.overtimes[i].sent) {
                        this.controller.presentAlert('Warning', 'This record was already sent and uploaded, unable to delete!');
                    } else {
                        this.overtimes.splice(i, 1);

                        this.controller.presentLoading('Updating, please wait...')
                        .then((loading) => {
                            this.database.updateValue(this.keyGenerator(this.time.getDate(data.date_in)), JSON.stringify(this.overtimes))
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

        this.controller.presentAlert('Delete', 'Are you sure to delete this overtime filing?', buttons, []);
    }

    recordOt(ot, att?) {
        this.controller.presentLoading('Saving, please wait...')
        .then((loading) => {
            if(att) {
                att.time_in = `${ot.date_in} ${ot.time_in}`;
                att.time_out = `${ot.date_out} ${ot.time_out}`;

                this.database.updateValue(this.keyGenerator(this.time.getDate(ot.date_in)), JSON.stringify(this.overtimes))
                .then((res: any) => {
                    this.update = true;
                    loading.dismiss();
                })
                .catch((error) => {
                    loading.dismiss();
                    this.controller.presentAlert('Error', 'Database error');
                });
            } else {
                let exists = this.overtimes.filter((data) => {
                    return data.user_id == this.user.id && this.time.getDate(data.time_in) == this.time.getDate(ot.date_in) && data.project_id == (this.active_project ? this.active_project.id : null);
                });
                if(exists.length > 0) {
                    this.controller.presentAlert('Warning', 'Overtime filing already exist!');
                    loading.dismiss();
                    return;
                }
                let data: any = {
                    user_id: this.user.id,
                    name: `${this.user.first_name} ${this.user.last_name}`,
                    project_id: this.active_project ? this.active_project.id : null,
                    time_in: `${ot.date_in} ${ot.time_in}`,
                    time_out: `${ot.date_out} ${ot.time_out}`,
                    created_by: this.created_by
                }
                
                this.overtimes.push(data);

                let dbTx: any = null;

                if (this.update) {
                    dbTx = this.database.updateValue(this.keyGenerator(this.time.getDate(ot.date_in)), JSON.stringify(this.overtimes));
                } else {
                    dbTx = this.database.saveValue(this.keyGenerator(this.time.getDate(ot.date_in)), JSON.stringify(this.overtimes));
                }

                dbTx.then((res: any) => {
                    this.update = true;
                    loading.dismiss();
                })
                .catch((error) => {
                    loading.dismiss();
                    this.controller.presentAlert('Error', 'Database error');
                });
            }
        });
    }

    displayOvertimes() {
        this.overtimes = [];
        this.controller.presentLoading('Loading overtime filings, please wait...')
        .then((loading) => {
            this.database.getKeyValue(this.keyGenerator())
            .then((res: any) => {
                if(res.rows.length > 0) {
                    this.update = true;
                    this.overtimes = JSON.parse(res.rows.item(0).value);
                    this.overtimes = this.overtimes ? this.overtimes : [];
                }
                loading.dismiss();
            })
            .catch((error) => {
                loading.dismiss();
                this.controller.presentAlert('Error', 'Database error');
            });
        });
    }

    keyGenerator(date?) {
        return `overtimes:${date ? date : this.date}:${this.active_project ? this.active_project.id : null}:${this.created_by}`
    }

}

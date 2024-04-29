import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { DatabaseService } from '../services/database/database.service';
import { ModalController } from '@ionic/angular';
import { TimeService } from '../services/time/time.service';
import { ViewSummaryPage } from '../view-summary/view-summary.page';

@Component({
    selector: 'app-summaries',
    templateUrl: './summaries.page.html',
    styleUrls: ['./summaries.page.scss'],
})
export class SummariesPage implements OnInit {

    project_id: string = null;
    locations: any = [];
    user: any;
    active_project: any = null;

    constructor(
        private controller: ControllerService,
        private time: TimeService,
        private modalCtrl: ModalController,
        private database: DatabaseService,
    ) {

    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));

        this.active_project = localStorage.getItem('active-project');
        if(this.active_project !== undefined && this.active_project !== null && this.active_project !== 'null' && this.active_project !== 'undefined') {
            this.active_project = JSON.parse(this.active_project);
            this.project_id = this.active_project.id;
        } else {
            this.active_project = null;
        }

        this.initialize();
    }

    initialize() {
        this.locations = [];
        this.controller.presentLoading('Loading, please wait...')
        .then((loading) => {
            this.database.getLocations(this.project_id, this.user.id)
            .then((res: any) => {
                for (var i = 0; i < res.rows.length; i++) { 
                    this.locations.push(JSON.parse(res.rows.item(i).value));
                }
                loading.dismiss();
            });
        });
    }

    viewSummary(location) {
        this.controller.presentLoading('Loading summary, please wait...')
        .then((loading) => {
            try {
                this.database.getKeyValue(`attendance:${location.date}:${location.project_id}:${this.user.id}`)
                .then((res: any) => {
                    let attendance = [];
                    if (res.rows.length > 0) {
                        attendance = JSON.parse(res.rows.item(0).value);
                    }

                    this.database.getKeyValue(`leaves:${location.date}:${location.project_id}:${this.user.id}`)
                    .then((res: any) => {
                        let leaves = [];
                        if (res.rows.length > 0) {
                            leaves = JSON.parse(res.rows.item(0).value);
                        }

                        this.database.getKeyValue(`overtimes:${location.date}:${location.project_id}:${this.user.id}`)
                        .then((res: any) => {
                            let overtimes = [];
                            if (res.rows.length > 0) {
                                overtimes = JSON.parse(res.rows.item(0).value);
                            }

                            this.database.getKeyValue(`dar:${location.date}:${location.project_id}:${this.user.id}`)
                            .then((res: any) => {
                                let dar = {data: {weather_condition: '', technical_issues: '', equipment_issues: '', remarks: '', requests: '', images: []}};
                                if (res.rows.length > 0) {
                                    dar = JSON.parse(res.rows.item(0).value);
                                }

                                loading.dismiss();
                                this.summaryModal(location, attendance, leaves, overtimes, dar);
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

    async summaryModal(location, attendance, leaves, overtimes, dar) {
        const modal = await this.modalCtrl.create({
            component: ViewSummaryPage,
            componentProps: {
                'summary': {
                    project: this.active_project,
                    location: location,
                    attendance: attendance,
                    leaves: leaves,
                    overtimes: overtimes,
                    dar: dar
                }
            }
        });
        await modal.present();
        await modal.onWillDismiss();
        this.initialize();
    }
}

import { ApiService } from '../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { ModalController } from '@ionic/angular';
import { ViewProjectPage } from '../view-project/view-project.page';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.page.html',
    styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

    projects: any = [];

    constructor(
        private modalCtrl: ModalController,
        private api: ApiService,
        private controller: ControllerService,
    ) {
    }

    ngOnInit() {
        this.projects = JSON.parse(localStorage.getItem('projects'));
        this.projects = this.projects ? this.projects : [];
        
        this.controller.presentLoading('Loading, please wait...')
        .then((loading) => {
            this.initialize(loading, null);
        });
    }

    doRefresh(event) {
        this.initialize(null, event);
    }

    initialize(loading, event) {
        this.api.get(`my-projects`)
        .subscribe(
            (res: any) => {
                this.projects = res.data;
                localStorage.setItem('projects', JSON.stringify(this.projects));
                if(loading !== null) {
                    loading.dismiss();
                }
                if(event !== null) {
                    event.target.complete();
                }
            },
            (err: any) => {
                this.controller.showErrorAlert(err);
                this.projects = JSON.parse(localStorage.getItem('projects'));
                if(loading !== null) {
                    loading.dismiss();
                }
                if(event !== null) {
                    event.target.complete();
                }
            }
        );
    }

    async viewProject(project) {
        const modal = await this.modalCtrl.create({
            component: ViewProjectPage,
            componentProps: {
                'project': project
            }
        });
        await modal.present();
    }

    isActive(id) {
        let active_project: any = localStorage.getItem('active-project');
        if(active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
            active_project = JSON.parse(active_project);
            if(active_project.id == id) return true;
        }
        return false;
    }

}

import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-view-project',
    templateUrl: './view-project.page.html',
    styleUrls: ['./view-project.page.scss'],
})
export class ViewProjectPage implements OnInit {

    project: any;

    constructor(
        private modalCtrl: ModalController,
    ) {

    }

    ngOnInit() {
        let active_project: any = localStorage.getItem('active-project');
        if(active_project !== undefined && active_project !== null && active_project !== 'null' && active_project !== 'undefined') {
            active_project = JSON.parse(active_project);
            if(active_project.id == this.project.id) this.project.active = 1;
        } else {
            this.project.active = 0;
        }
    }

    close() {
        this.modalCtrl.dismiss();
    }

    activateProject() {
        if(this.project.active == 1) {
            localStorage.setItem('active-project', null);
        } else {
            localStorage.setItem('active-project', JSON.stringify(this.project));
        }
        this.modalCtrl.dismiss({
            'status': this.project.active
        });
    }

}

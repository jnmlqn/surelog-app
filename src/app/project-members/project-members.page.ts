import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-project-members',
    templateUrl: './project-members.page.html',
    styleUrls: ['./project-members.page.scss'],
})
export class ProjectMembersPage implements OnInit {

    members: any;
    project_members: string;

    constructor(
        private modalCtrl: ModalController
    ) {

    }

    ngOnInit() {

    }

    close() {
        this.modalCtrl.dismiss();
    }

    recordAttendance(member) {
        this.modalCtrl.dismiss({
            'member': member.user_id
        });
    }
}

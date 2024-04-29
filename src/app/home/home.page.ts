import { ApiService } from '../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { MenuController } from '@ionic/angular';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

    posts: any = [];
    page: number = 1;
    sorting: string = 'desc';
    sortBy: string = 'created_at';
    keyword: string = '';

    constructor(
        private menuCtrl: MenuController,
        private api: ApiService,
        private controller: ControllerService,
    ) {
        
    }

    ngOnInit() {
        this.posts = JSON.parse(localStorage.getItem('posts'));
        this.posts = this.posts ? this.posts : [];

        this.controller.presentLoading('Loading, please wait...')
        .then((loading) => {
            this.initialize(loading, null);
        });
    }

    ionViewWillEnter() {
        this.menuCtrl.enable(true);
    }

    doRefresh(event) {
        this.page = 1;
        this.initialize(null, event);
    }

    initialize(loading, event) {
        this.api.get(`posts?keyword=${this.keyword}&sorting=${this.sorting}&sortBy=${this.sortBy}&page=${this.page}`)
        .subscribe(
            (res: any) => {
                this.posts = res.data.data;
                localStorage.setItem('posts', JSON.stringify(this.posts));
                if(loading !== null) {
                    loading.dismiss();
                }
                if(event !== null) {
                    event.target.complete();
                }
            },
            (err: any) => {
                this.controller.showErrorAlert(err);
                if(loading !== null) {
                    loading.dismiss();
                }
                if(event !== null) {
                    event.target.complete();
                }
            }
        );
    }

}

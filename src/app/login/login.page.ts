import { ApiService } from '../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket/socket.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    email: string = '';
    password: string = '';

    constructor(
        private api: ApiService,
        private controller: ControllerService,
        private router: Router,
        private menuCtrl: MenuController,
        private socket: SocketService,
    ) { 
        this.menuCtrl.enable(false);
    }

    ngOnInit() {
        
    }

    login() {
        let body = {
            email: this.email,
            password: this.password
        }
        this.controller.presentLoading('Logging in, please wait...').then((loading) => {
            this.api.login(body)
            .subscribe(
                (res: any) => {
                    localStorage.setItem('surelog-token', res.data.access_token);
                    delete res.data.access_token;
                    localStorage.setItem('user', JSON.stringify(res.data));
                    loading.dismiss();
                    this.socket.initialize();
                    this.router.navigateByUrl('/');
                },
                (err: any) => {
                    loading.dismiss();
                    this.controller.showErrorAlert(err);
                }
            );
        });
    }

}

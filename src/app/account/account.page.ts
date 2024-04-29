import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../services/controller/controller.service';
import { NavController } from '@ionic/angular';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

    user: any;
    resetPasswordData: any = null;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private navCtrl: NavController,
        private controller: ControllerService,
        private api: ApiService,
    ) {
        this.user = JSON.parse(localStorage.getItem('user'));
        console.log(this.user)
    }

    ngOnInit() {

    }

    close() {
        this.navCtrl.pop();
    }

    changePassword() {
        let buttons = [
            {
                text: 'Save',
                handler: (data) => {
                    this.resetPasswordData = data;

                    if(data.new.length < 8) {
                        this.controller.presentAlert('Warning', 'Password must be at least 8 characters');
                    } else if(data.new !== data.confirm) {
                        this.controller.presentAlert('Error', 'Passwords do not match');
                    } else {
                        this.controller.presentLoading('Updating, please wait...').then((loading) => {
                            this.api.post('password/change', data)
                            .subscribe(
                                (res: any) => {
                                    this.resetPasswordData = null;
                                    this.controller.presentAlert('Success', res.message);
                                    loading.dismiss();
                                },
                                (err: any) => {
                                    loading.dismiss();
                                    this.controller.showErrorAlert(err);
                                }
                            );
                        });
                    }
                }
            },
            {
                text: 'cancel'
            }
        ];

        let inputs = [
            {
                name: 'old',
                type: 'password',
                placeholder: 'Input old password',
                value: this.resetPasswordData ? this.resetPasswordData.old : ''
            },
            {
                name: 'new',
                type: 'password',
                placeholder: 'Input new password',
                value: this.resetPasswordData ? this.resetPasswordData.new : ''
            },
            {
                name: 'confirm',
                type: 'password',
                placeholder: 'Re-type new password',
                value: this.resetPasswordData ? this.resetPasswordData.confirm : ''
            }
        ];

        this.controller.presentAlert('Change password', '', buttons, inputs);
    }

    logout() {
        let buttons = [
            {
                text: 'yes',
                handler: () => {
                    this.controller.presentLoading('Logging out, please wait...').then((loading) => {
                        this.api.post('logout', null)
                        .subscribe(
                            (res: any) => {
                                localStorage.removeItem('user');
                                localStorage.removeItem('surelog-token');
                                window.location.href = '/login';
                            },
                            (err: any) => {
                                loading.dismiss();
                                this.controller.showErrorAlert(err);
                            }
                        );
                    });
                }
            }, 
            {
                text: 'no'
            }
        ];

        this.controller.presentAlert('Warning', 'Are you sure to logout?', buttons);
    }

}

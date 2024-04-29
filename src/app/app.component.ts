import { ApiService } from './services/api/api.service';
import { Component } from '@angular/core';
import { ControllerService } from './services/controller/controller.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { LoginPage } from './login/login.page';
import { Router } from '@angular/router';
import { SocketService } from './services/socket/socket.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {

    // also update config.xml when updating app version
    version: string = '1.0.0';

    pages: any = [
        {url: '/', title: 'Home', icon: 'home-outline'},
        {url: '/location', title: 'Location', icon: 'location-outline'},
        {url: '/dar', title: 'DAR', icon: 'document-text-outline'},
        {url: '/attendance', title: 'Attendance', icon: 'time-outline'},
        {url: '/leave-filing', title: 'Leave Filing', icon: 'exit-outline'},
        {url: '/ot-filing', title: 'OT Filing', icon: 'time-outline'},
        {url: '/summaries', title: 'Summaries', icon: 'documents-outline'},
        {url: '/projects', title: 'My Project/s', icon: 'trending-up-outline'},
    ];

    constructor(
        private api: ApiService,
        private controller: ControllerService,
        private file: File,
        private fileOpener: FileOpener,
        private fileTransfer: FileTransfer,
        private router: Router,
        private socket: SocketService,
    ) {
        if(localStorage.getItem('surelog-token') == null) {
            this.router.navigateByUrl('/login');
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user !== null && user !== '' && user !== undefined) {
            this.socket.initialize();
        }

        // check latest version (android platform, add other platform in for future reference)
        this.api.get('version/android')
        .subscribe(
            (res:any) => {
                if(this.version !== res.data.version) {
                    this.newVersion(res.data);
                }
            },
            (err) => {
                console.log('Error getting latest version');
            }
        );
        
        // update user details, check if api token is not yet expired
        this.api.get('me')
        .subscribe(
            (res: any) => {
                localStorage.setItem('user', JSON.stringify(res.data));
                this.router.navigateByUrl(window.location.pathname);
            },
            (err: any) => {
                this.router.navigateByUrl('/login');
                if (err.status == 401) {
                    this.router.navigateByUrl('/login');
                }
            }
        );
    }

    newVersion(data) {
        // if force update, download is a must
        if(data.force_update) {
            let buttons = [
                {
                    text: 'Download',
                    handler: () => {
                        this.download();
                    }
                },
                {
                    text: 'Exit App',
                    handler: () => {
                        navigator['app'].exitApp()
                    }
                }
            ];

            this.controller.presentAlert('New Version', 'A newer version of this app was found and an update is required, please donwload or exit the app.', buttons);
        } else {
            let buttons = [
                {
                    text: 'Yes',
                    handler: () => {
                        this.download();
                    }
                },
                {
                    text: 'Remind me later'
                }
            ];

            this.controller.presentAlert('New Version', 'A newer version of this app was found, would you like to download and update?', buttons);
        }
    }

    download() {
        this.controller.presentLoading('Downloading 0%')
        .then((loading) => {
            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            fileTransfer.onProgress((progressEvent) => {
                var percent = progressEvent.loaded / progressEvent.total * 100;
                percent = Math.round(percent);
                const elem = document.querySelector("div.loading-wrapper div.loading-content");
                if(elem) elem.innerHTML = `Downloading ${percent}%`;
            });

            fileTransfer.download(`${this.api.url}surelog.apk`, this.file.dataDirectory + 'Surelog.apk')
            .then((entry) => {
                loading.dismiss();
                this.fileOpener.open(entry.toURL(), 'application/vnd.android.package-archive')
                .then(() => {
                    console.log('Opened')
                })
                .catch((e) => {
                    this.controller.presentAlert('Error', `Error installing the application, please go to ${this.api.url}surelog.apk to download the latest version and install. Thank you!`);
                });
            }, (error) => {
                loading.dismiss();
                console.log(error);
                this.controller.presentAlert('Error', `Error downloading the application, please go to ${this.api.url}surelog.apk to download the latest version. Thank you!`);
            });
        });
    }
}

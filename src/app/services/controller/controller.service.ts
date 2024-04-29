import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ControllerService {

    constructor(
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private router: Router,
    ) {

    }

    async presentLoading(message) {
        const loading = await this.loadingCtrl.create({
            message: message
        });
        loading.present();
        return loading;
    }

    async presentAlert(title, subtitle, buttons?, inputs?) {
        const alert = await this.alertCtrl.create({
            cssClass: 'my-custom-class',
            header: title,
            message: subtitle,
            backdropDismiss: false,
            buttons: buttons ? buttons : ['OK'],
            inputs: inputs
        });

        await alert.present();
    }

    showErrorAlert(err) {
        if(err.status == 422) {
            let errors = `<ul>`;
            Object.keys(err.error).forEach(key => {
                errors += `<li>${err.error[key]}</li>`;
            });
            errors += `</ul>`;
            this.presentAlert('Warning', errors);
        } else if(err.status == 500) {
            this.presentAlert('Error', err.error.message);
        } else if(err.status == 404) {
            this.presentAlert('Error', `Invalid url: ${err.url}`);
        } else if (err.status == 405) {
            this.presentAlert('Error', 'Method not allowed');
        } else if (err.status == 400) {
            this.presentAlert(err.error.data.title, err.error.data.message);
        } else if (err.status == 0) {
            this.presentAlert('Application Error', 'Please check your internet connection and try again');
        } else if (err.status == 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('surelog-token');
            this.presentAlert('Token Expired', 'Please login again');
            this.router.navigateByUrl('/login');
        }
    }

    findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return i;
            }
        }
        return null;
    }

    findObjectBySubKey(array, key1, key2, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key1][key2] === value) {
                return i;
            }
        }
        return null;
    }

    findObjectByTwoKey(array, key1, key2, value1, value2) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key1] === value1 && array[i][key2] === value2) {
                return i;
            }
        }
        return null;
    }

    findObjectByThreeKey(array, key1, key2, key3, value1, value2, value3) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key1] === value1 && array[i][key2] === value2 && array[i][key3] == value3) {
                return i;
            }
        }
        return null;
    }

    nav(url, params?) {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                data: JSON.stringify(params ? params : [])
            }
        };
        this.router.navigate([url], navigationExtras);
    }

    changePage(url) {
        this.router.navigateByUrl(url);
    }

    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}

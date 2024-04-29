import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';

@Component({
    selector: 'app-view-attendance',
    templateUrl: './view-attendance.page.html',
    styleUrls: ['./view-attendance.page.scss'],
})
export class ViewAttendancePage implements OnInit {

    attendance: any;

    constructor(
        private modalCtrl: ModalController,
        private nativeGeocoder: NativeGeocoder
    ) {

    }

    ngOnInit() {
        this.attendance.time_in_location = this.geocodeLocation('time_in_location', this.attendance.time_in_latitude, this.attendance.time_in_longitude);
        this.attendance.time_out_location = this.geocodeLocation('time_out_location', this.attendance.time_out_latitude, this.attendance.time_out_longitude);
    }

    async geocodeLocation(key, lat, long) {
        let options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 1
        };

        try {
            const geocodeResult = await this.nativeGeocoder.reverseGeocode(lat, long, options);
            this.attendance[key] = geocodeResult[0];
        } catch(err) {
            console.log(err);
        }
    }

    close() {
        this.modalCtrl.dismiss();
    }
}

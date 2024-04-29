import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';

@Injectable({
    providedIn: 'root'
})
export class SocketService {

    active_project: any;

    constructor(
        private socket: Socket,
        private geolocation: Geolocation
    ) {

    }

    initialize() {
        this.active_project = JSON.parse(localStorage.getItem('active-project'));
        this.active_project = this.active_project ? this.active_project : null;
        let user = JSON.parse(localStorage.getItem('user'));
        if (user !== undefined && user !== null && user !== '') {
            this.socket.connect();
            this.socket.emit('set-userid', user.id);
            this.usersChangeEvent();
            this.onRequestLocation();
        }
    }

    usersChangeEvent() {
        this.socket.fromEvent('users-changed')
        .subscribe((data) => {
            console.log('Connected to socket server!');
        });
    }

    onRequestLocation() {
        this.socket.fromEvent('request-location')
        .subscribe((data: any) => {
            if (this.active_project !== null && this.active_project !== '' && this.active_project !== undefined) {
                if (this.active_project.id == data.project_id) {
                    this.geolocation.getCurrentPosition()
                    .then((resp: any) => {
                        let event_data = {
                            name: 'send-location',
                            receivers: [data.sender],
                            data: {
                                latitude: resp.coords.latitude,
                                longitude: resp.coords.longitude
                            }
                        }
                        this.socket.emit('event-send', event_data);
                    })
                }
            }
        });
    }
}

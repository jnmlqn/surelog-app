import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimeService {

    months:any = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    monthname:any = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    datetime: any;
    pausetime: any;
    resumetime: any;
    difftime: any;
    itime: any;
    timer: any;

    constructor(

    ) {
        setInterval(() => {
            this.timer = this.clock();
        }, 1000)
    }

    time(datetime?) { //24 hour format
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        let h = datetime.getHours();
        let m = datetime.getMinutes();
        let s = datetime.getSeconds();
        let hours = h < 10 ? '0'+h : h;
        let minutes = m < 10 ? '0'+m : m;
        let seconds = s < 10 ? '0'+s : s;
        return hours+':'+minutes+':'+seconds;
    }

    timeWithSeconds(datetime?) { //24 hour format
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        let h = datetime.getHours();
        let m = datetime.getMinutes();
        let s = datetime.getSeconds();
        let hours = h < 10 ? '0'+h : h;
        let minutes = m < 10 ? '0'+m : m;
        let seconds = s < 10 ? '0'+s : s;
        return hours+':'+minutes+':'+seconds;
    }

    getDate(datetime?) { //1970-01-01
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        return datetime.getFullYear() + '-' + this.months[datetime.getMonth()] + '-' + (datetime.getDate() < 10 ? `0${datetime.getDate()}` : datetime.getDate());
    }

    getTime(datetime?) { //12 hour format
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        let hours = datetime.getHours();
        let minutes = datetime.getMinutes();
        let seconds = datetime.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        seconds = seconds < 10 ? '0'+seconds : seconds;
        return hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    getTimeNoSec(datetime) { //12 hour format
        datetime = new Date(datetime);
        let hours = datetime.getHours();
        let minutes = datetime.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    getCurrentDate(datetime?) { //January 1, 1970
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        return this.monthname[datetime.getMonth()] + ' ' + datetime.getDate() + ', ' + datetime.getFullYear();
    }

    getDateTime(datetime?) {
        let time = this.time(datetime);
        let date = this.getDate(datetime);
        return date + ' ' + time;
    }

    clock() {
        let today = new Date;
        let time = this.getTime(today);
        let date = this.getCurrentDate();
        this.datetime = date + ' ' + time;
        return this.datetime;
    }

    addMinutes(datetime, minutes) {
        datetime = new Date(datetime);
        let dt = new Date(datetime.getTime() + minutes * 60000);
        let time = this.time(dt);
        let date = this.getDate(dt);
        return date + ' ' + time;
    }

    deductMinutes(datetime, minutes) {
        datetime = new Date(datetime);
        let dt = new Date(datetime.getTime() - minutes * 60000);
        let time = this.time(dt);
        let date = this.getDate(dt);
        return date + ' ' + time;
    }

    whenPause() {
        this.pausetime = Date.now();
    }

    getTomorrowDate(daystoadd, datetime?) { //January 1, 1970
        if (datetime != null) { datetime = new Date(datetime); } else { datetime = new Date; }
        datetime.setDate(datetime.getDate()+daystoadd);
        let date = datetime.getDate();
        date = date < 10 ? '0' + date : date
        return datetime.getFullYear() + '-' + this.months[datetime.getMonth()] + '-' + date;
    }
}

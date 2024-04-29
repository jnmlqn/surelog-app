import { ControllerService } from '../controller/controller.service';
import { DatabaseService } from '../database/database.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AttendanceService {

    constructor(
        private controller: ControllerService,
        private database: DatabaseService,
    ) {

    }

    async checkIfLeave(date, project_id, user_id, created_by) {
        let leaves = [];
        let res = await this.database.getKeyValue(`leaves:${date}:${project_id}:${created_by}`);
        if(res.rows.length > 0) {
            leaves = JSON.parse(res.rows.item(0).value);
            return this.findObjectByTwoKey(leaves, 'user_id', 'on_leave', user_id, 1);
        } else {
            return false;
        }
    }

    async checkIfHalfLeave(date, project_id, user_id, created_by) {
        let leaves = [];
        let res = await this.database.getKeyValue(`leaves:${date}:${project_id}:${created_by}`);
        if(res.rows.length > 0) {
            leaves = JSON.parse(res.rows.item(0).value);
            return this.findObjectByTwoKey(leaves, 'user_id', 'on_half_leave', user_id, 1);
        } else {
            return false;
        }
    }

    async checkIfTimedIn(date, project_id, user_id, created_by) {
        let attendance = [];
        let res = await this.database.getKeyValue(`attendance:${date}:${project_id}:${created_by}`);
        if(res.rows.length > 0) {
            attendance = JSON.parse(res.rows.item(0).value);
            return this.findObjectByKey(attendance, 'user_id', user_id);
        } else {
            return false;
        }
    }

    findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return true;
            }
        }
        return false;
    }

    findObjectByTwoKey(array, key1, key2, value1, value2) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key1] === value1 && array[i][key2] === value2) {
                return true;
            }
        }
        return false;
    }

    getOfficialSchedule(active_project) {
        if(active_project == null) {
            let days: any = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            let user = JSON.parse(localStorage.getItem('user'));
            let date = new Date
            let day = date.getDay();
            let time_in = user.office_schedule[`${days[day]}_in`];
            let time_out = user.office_schedule[`${days[day]}_out`];
            return {
                time_in: time_in ? time_in : '00:00:00',
                time_out: time_out ? time_out : '23:59:00'
            }
        } else {
            return {
                time_in: active_project.project_schedules[0].time_in,
                time_out: active_project.project_schedules[0].time_out
            };
        }
    }
}

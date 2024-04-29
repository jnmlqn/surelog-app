import { Component, OnInit, Input } from '@angular/core';
import { ControllerService } from '../../services/controller/controller.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

    @Input() title: any;
    @Input() icon: any;
    user:any = {};

    constructor(
        private controller: ControllerService,
    ) { }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.user = this.user ? this.user : {};
    }

    account() {
        this.controller.nav('account');
    }

}

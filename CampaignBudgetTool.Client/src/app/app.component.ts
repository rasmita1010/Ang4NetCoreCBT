import { Component } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';

import { LoginService } from './login/login.service';
import { USER_DETAILS } from './utils/constants';
import { USER_IDLE, LOGOUT_USER } from './utils/actions';
import { AppStateService } from "./utils/app-state.service";
import { LoaderService } from "./utils/loader.service";
import { DmBudgetService } from "./dm-budget/dm-budget.service";

let $ = null;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(private router: Router, 
				private ls: LoginService, 
                private stateService: AppStateService,
                private dbs: DmBudgetService,
			    private loaderService: LoaderService) { }

	
}

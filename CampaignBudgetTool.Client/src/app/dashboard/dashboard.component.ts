import { Component } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { USER_DETAILS, IDLE_TIME, IDLE_LOGOUT_TIMER, UNSAVED_DATA_ALERT_MSG,
    UNSAVED_DATA_ALERT_HEADER, CONTINUE, CANCEL } from '../utils/constants';
import { LOGOUT_USER } from '../utils/actions';
import { AppStateService } from '../utils/app-state.service';

import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import { SharedService } from '../utils/shared.service';

let $ = null;

@Component({
	selector: 'app-root',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
	idleState = 'Not started.';
	timedOut = false;
	lastPing?: Date = null;
	logoutTimer: number;
	unsavedDataAlertMsg = UNSAVED_DATA_ALERT_MSG;
	unsavedDataAlertHeader = UNSAVED_DATA_ALERT_HEADER;
	continue = CONTINUE;
	cancel = CANCEL;

	constructor(private router: Router, private idle: Idle, private keepalive: Keepalive, 
		private stateService: AppStateService, private sharedService: SharedService) {
		$ = window["jQuery"];
    this.configUserIdle();
	}

	configUserIdle() {
		this.idle.setIdle(IDLE_TIME); //set the hours after which the logout popup should appear
		this.idle.setTimeout(IDLE_LOGOUT_TIMER); //displays number of seconds after which the logout will happen
		this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); //set the default interupts provided by module like click, keyboad, touch etc..
	
		this.idle.onIdleEnd.subscribe(() => { 
			this.idleState = 'No longer idle. Remove the popup';
			$("#logoutWarningModal").modal("hide");
		});
		this.idle.onTimeout.subscribe(() => {
			this.idleState = 'Timed out!';
			this.timedOut = true;
			$("#logoutWarningModal").modal("hide");
			
			let action = {
				type: LOGOUT_USER
			}
			this.stateService.dispatch(action);

		});
		this.idle.onIdleStart.subscribe(() => {
			$("#logoutWarningModal").modal();
		});
		this.idle.onTimeoutWarning.subscribe((countdown) => {
			this.logoutTimer = countdown;
		});
	
		this.reset();
	}

	reset() {
		this.idle.watch(); //will start the idle module
		this.idleState = 'Started.';
		this.timedOut = false;
	}

	logoutUser() {
		let isValidNavigation = this.sharedService.getIsValidNavigationFromDMBudget();
		if(isValidNavigation){
			this.logOut();
		}
		else{
			$("#logoutWithChangesAlert").modal();
			let self = this;
			$("#continue").on("click", function () {
				$("#logoutWithChangesAlert").modal("hide");
				self.logOut();
			});
		}
	}
	logOut(){
		let action = { type: LOGOUT_USER };
		this.stateService.dispatch(action);
	}
    showInfo() {
      $("#errorPopup #exceptionInfo").css("display", "");
      $("#errorPopup #exceptionInfo").css("display", "block");
      $("#errorPopup #errHideDetailHyperlink").css("display", "");
      $("#errorPopup #errHideDetailHyperlink").css("display", "block");
      $("#errorPopup #errShowDetailHyperlink").css("display", "");
      $("#errorPopup #errShowDetailHyperlink").css("display", "none");
    }

    hideInfo() {
      $("#errorPopup #exceptionInfo").css("display", "");
      $("#errorPopup #exceptionInfo").css("display", "none");
      $("#errorPopup #errHideDetailHyperlink").css("display", "");
      $("#errorPopup #errHideDetailHyperlink").css("display", "none");
      $("#errorPopup #errShowDetailHyperlink").css("display", "");
      $("#errorPopup #errShowDetailHyperlink").css("display", "block");
    }
}

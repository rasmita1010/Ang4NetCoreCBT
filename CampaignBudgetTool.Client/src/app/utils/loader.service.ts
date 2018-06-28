import { Injectable } from '@angular/core';

import { AppStateService } from "./app-state.service";
import { LOADER, NOTIFICATION, SERVER_ERROR } from "./actions";

let $ = null;

@Injectable()
export class LoaderService {

    private el:any;

    constructor(private stateService:AppStateService) {
        $ = window["jQuery"];
        this.el = $("#loader");
        stateService.subscribe(LOADER, this.showHideLoader.bind(this));
        stateService.subscribe(NOTIFICATION, this.showNotification.bind(this));
        stateService.subscribe(SERVER_ERROR, this.showErrorPopup.bind(this));
    }

    showHideLoader(action) {
        if(this.el && action) {
            if(action.payload.show) {
                this.el.show();    
            } else {
                this.el.hide();
            }
        }
    }

    showNotification(action) {
        if(!action.payload.show) {
            //Remove Notification here
            return;
        }

        if(action.payload.type == "success") {
            $("body").remove(".notification").append("<div class='notification' id='notification'><span>Records saved successfully!</span></div>");
            $("#notification").slideDown(100);

            setTimeout(function() {
                $("#notification").slideUp(300);
            }, 2000)

        }
    }

    showErrorPopup(action) {
      let errorJson = JSON.parse(action.payload);
      $("#errorPopup #errorMsg").html(errorJson.errorMessage);
      $("#errorPopup #exceptionInfo #errorCode").html(errorJson.errorCode)
      $("#errorPopup #exceptionInfo #serverDetail").html(errorJson.message)
      $("#errorPopup #exceptionInfo #innerException").html(JSON.stringify(errorJson.innerException))
      $("#errorPopup #exceptionInfo #stackTrace").html(errorJson.stackTrace)
      $("#errorPopup").modal()
    }

}

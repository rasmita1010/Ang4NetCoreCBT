import { Injectable, EventEmitter } from '@angular/core';
import { LOADER, NOTIFICATION, SERVER_ERROR } from './actions';

@Injectable()
export class AppStateService {

    private state: any;
    private dispatcherMap:Object = {};
    private count = 0; 

    constructor() {
   
    }

    dispatch(action) {
        if(action.type && this.dispatcherMap.hasOwnProperty(action.type)) {
            let subject = this.dispatcherMap[action.type];
            subject.emit(action);
        }
    }

    subscribe(actionType, nextFn, errFn = null) { 
        if(!this.dispatcherMap.hasOwnProperty(actionType)) {
            this.dispatcherMap[actionType] = new EventEmitter();
        }

        if(!errFn)
          errFn = (err) => { console.log(`Error handled in AppStateService: ${err}`)}

        let subscription = this.dispatcherMap[actionType].subscribe(nextFn, errFn);
        return subscription;
    }

    showLoader(value) {
        this.dispatch({
            type: LOADER,
            payload: {
                show: value
            }
        });
    }

    showNotification(show, message, type) {
        this.dispatch({
            type: NOTIFICATION,
            payload: {
                show: show,
                message: message,
                type: type
            }
        });
    }

    //Get the login details of user..
    get getUserDetails() {
        return JSON.parse(localStorage.getItem("user details"));
    }

    showServerError(errMessage) {
      this.dispatch({
        type: SERVER_ERROR,
        payload: errMessage

      });
    }
}
    


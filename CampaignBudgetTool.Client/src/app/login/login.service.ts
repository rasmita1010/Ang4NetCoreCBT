import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { AppStateService } from "../utils/app-state.service";
import { LOGIN, LOGIN_RESULT, LOGIN_FAIL, LOGOUT_USER } from "../utils/actions";
import { USER_DETAILS } from "../utils/constants";



@Injectable()
export class LoginService {
    
    
    constructor(private http: Http, private router: Router, private stateService: AppStateService) {
        stateService.subscribe(LOGIN, this.login.bind(this));
        stateService.subscribe(LOGOUT_USER, this.logout.bind(this));
    }

    login(action) {
        this.stateService.showLoader(true);
        let payLoad = new URLSearchParams();
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers }); 

        this.http
                .post(action.payload.url, payLoad, options)
                .map((res: Response) => {
                    const result = res.json();
                    return result;
                })
                .subscribe(
                    res => {
                        //emit successful login event

                        let returnAction = {
                            type: LOGIN_RESULT,
                            payload: res
                        }

                        this.stateService.dispatch(returnAction);
                        this.stateService.showLoader(false);
                    },
                    err => {
                        //emit unsuccessful login event and the error handler
                        this.handleError(err);

                        let returnAction = {
                            type: LOGIN_FAIL,
                            payload: err
                        }

                        this.stateService.dispatch(returnAction);
                        this.stateService.showLoader(false);
                    }
                );
                
    }

    logout() {
        localStorage.removeItem(USER_DETAILS);
		this.router.navigate(['./login']);
    }

    handleError(err:any): any {
        console.log(`AccountService Status: ${err.status} Message: ${err.statusText}`);
        //Return observable that emits empty array. This will call fn passed to subscribe() with value as []
        return Observable.of([]);
    }
}
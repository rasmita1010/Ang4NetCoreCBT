import { Injectable } from '@angular/core';
import { CanActivate, Router, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { USER_DETAILS } from '../constants';


@Injectable()
export class RouteGuard implements CanActivate {

    constructor(private router: Router) {

	}

    canActivate() {
        const hasUserDetails = localStorage.getItem(USER_DETAILS);
        
        if(hasUserDetails && hasUserDetails.length > 0) {
            return true;
        }

        this.router.navigate(['./login']);
        return false;
    }
}
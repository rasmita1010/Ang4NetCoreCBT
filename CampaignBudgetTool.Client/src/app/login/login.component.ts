import { Component, ViewEncapsulation, } from "@angular/core";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APP_NAME, LOGIN_URL } from "../utils/constants"
import { LOGIN, LOGIN_RESULT, LOGIN_FAIL, LOGOUT_USER } from "../utils/actions";
import { AppStateService } from "../utils/app-state.service";
import { USER_DETAILS } from "../utils/constants";
import { environment } from "../../environments/environment";

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ["login.component.scss"],
})

export class LoginComponent {
  loginForm: FormGroup;
  userDetails: any;
  authFailMsg = false;

  constructor(private router: Router, private fb: FormBuilder, private stateService: AppStateService) {
    this.createLoginForm();
    this.stateService.subscribe(LOGIN_RESULT, this.loginSuccess.bind(this));
    this.stateService.subscribe(LOGIN_FAIL, this.loginFailed.bind(this));

  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  loginSubmit() {

    let username = this.loginForm.controls['username'].value;
    let password = this.loginForm.controls['password'].value;
    let secretKey = environment.saltPassword;
    let EncodePassword: string = btoa(secretKey + password);

    let loginDetails = {
      userName: username,
      password: EncodePassword,
      application: APP_NAME,
      isEncrypted:true
    }

    let loginUrl = LOGIN_URL + "?userName=" + username + "&password=" + EncodePassword + "&application=" + APP_NAME +"&isEncrypted=true";

    this.authFailMsg = false;

    let action = {
      type: LOGIN,
      payload: {
        url: loginUrl,
        data: loginDetails
      }
    }
    this.stateService.dispatch(action);
  }

  loginSuccess(action) {
    this.userDetails = action.payload;
    localStorage.setItem(USER_DETAILS, JSON.stringify(this.userDetails));

    this.router.navigate(['./dashboard/dm-budget']);
  }

  loginFailed(action) {
    this.authFailMsg = true;
  }

}

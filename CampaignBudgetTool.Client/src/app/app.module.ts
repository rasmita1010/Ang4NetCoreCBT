import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';

import { AppRoutingModule } from './app.routing';
import { AppStateService } from "./utils/app-state.service";
import { LoginService } from "./login/login.service";
import { DmBudgetService } from "./dm-budget/dm-budget.service";
import { CsvService } from "angular2-json2csv";
import { LoaderService } from "./utils/loader.service";
import { ExcelService } from "./utils/excel.service";

import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DmBudgetComponent } from "./dm-budget/dm-budget.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RouteGuard } from './utils/route-guard/route-guard.service';

import { HighlightModule } from 'ngx-highlight/highlight.module';
import { SharedService } from './utils/shared.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DmBudgetComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MultiselectDropdownModule,
    HttpModule,
    HttpClientModule,
    NgIdleKeepaliveModule.forRoot(),
    HighlightModule
  ],
  providers: [
    AppStateService,
    LoginService,
    RouteGuard,
    LoaderService,
    DmBudgetService,
    CsvService,
    ExcelService,
    SharedService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

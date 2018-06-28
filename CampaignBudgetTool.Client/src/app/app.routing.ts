import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DmBudgetComponent } from './dm-budget/dm-budget.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouteGuard } from './utils/route-guard/route-guard.service';

const routes: any = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "dashboard",
        component: DashboardComponent, 
        canActivate: [RouteGuard],
        children: [
            { path: '', redirectTo: 'dm-budget', pathMatch: 'full' },
            { path: 'dm-budget', component: DmBudgetComponent },
            // { path: "ic-budget", component: DmBudgetComponent },
            // { path: "dm-flow", component: DmBudgetComponent },
            // { path: "ic-flow", component: DmBudgetComponent }
          ]
    },
    {
        path: "**",
        redirectTo: "login",
        pathMatch: "full"
    },
    {
        path: "",
        component: LoginComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {  }
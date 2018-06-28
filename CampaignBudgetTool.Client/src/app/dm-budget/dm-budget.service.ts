import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppStateService } from "../utils/app-state.service";
import {
	DM_BUDGET,
	DM_BUDGET_RESULT,
	DM_BUDGET_YEARS,
	DM_BUDGET_YEARS_RESULT,
	DM_BUDGET_CAMPAIGNS,
	DM_BUDGET_CAMPAIGNS_RESULT,
	DM_BUDGET_UPDATE_ROW,
	DM_BUDGET_COMPLETED_CAMPAIGNS,
	DM_BUDGET_COMPLETED_CAMPAIGNS_RESULT,
	DM_BUDGET_SEGMENTS,
	DM_BUDGET_SEGMENTS_RESULT,
	DM_BUDGET_UPDATE_ROW_RESULT,
	DM_BUDGET_DELETE_ROW,
	DM_BUDGET_INSERT_ROW,
  DM_BUDGET_INSERT_ROW_RESULT    
} from "../utils/actions";
import {
  USER_DETAILS
} from "../utils/constants";

@Injectable()
export class DmBudgetService {

  constructor(private http: Http, private router: Router,private stateService:AppStateService) {
		stateService.subscribe(DM_BUDGET_YEARS, this.getDmBudgetYears.bind(this));
		stateService.subscribe(DM_BUDGET_CAMPAIGNS, this.getDmBudgetCampaigns.bind(this));
		stateService.subscribe(DM_BUDGET, this.getDmBudgets.bind(this));
		stateService.subscribe(DM_BUDGET_UPDATE_ROW , this.updateDmBudgetRow.bind(this));
		stateService.subscribe(DM_BUDGET_DELETE_ROW , this.deleteDmBudgetRow.bind(this));
		stateService.subscribe(DM_BUDGET_COMPLETED_CAMPAIGNS, this.getDmCompletedCampaign.bind(this));
		stateService.subscribe(DM_BUDGET_SEGMENTS, this.getSegmentForDMCampaign.bind(this));
		stateService.subscribe(DM_BUDGET_INSERT_ROW, this.insertDmBudgetRow.bind(this));
  }
  
    getDmBudgetYears(action): void {
      let magCode = action.payload.magazines;
      magCode = magCode.length == 0 ? null : magCode;

      let request_url = action.payload.url + "/" + magCode;

      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });

      this.http.get(request_url, options)
        .map((res: Response) => {
          const result = res;
          return result;
        })
        .subscribe(data => {
          action.payload.data = data;

          let nAction = {
            type: DM_BUDGET_YEARS_RESULT,
            payload: action.payload
          };
          this.stateService.dispatch(nAction);
        },
        err => {
          console.log(err);
          this.handleError(err);
          
        });
    }

    getDmBudgetCampaigns(action): void {
      let magCode = action.payload.magazines;
      magCode = magCode.length == 0 ? null : magCode;
      let years = action.payload.years;
      years = years.length == 0 ? null : years;
      let request_url = action.payload.url + "/" + magCode + "/" + years;

      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });

      this.http.get(request_url, options)
        .map((res: Response) => {
          const result = res;
          return result;
        })
        .subscribe(data => {
          action.payload.data = data;

          let nAction = {
            type: DM_BUDGET_CAMPAIGNS_RESULT,
            payload: action.payload
          };
          this.stateService.dispatch(nAction);
        },
        err => {
          console.log(err);
          this.handleError(err);
          
        });
    }

    deleteDmBudgetRow(action) {
        let headers = this.initAuthHeaders();
        let options = new RequestOptions({ headers: headers }); 

        this.http.
          delete(action.payload.url + "/" + action.payload.itemId, options)
                .map((res: Response) => {
                    const result = res.json();
                    return result;
                })
                .subscribe(
                    res => {
                        console.log("DELETED");
                    },
                    err => {
                      console.log(err);
                      this.handleError(err);
                      
                    }
                )
    }

    updateDmBudgetRow(action) {
        this.stateService.showLoader(true);
        let payload = new URLSearchParams(action.payload.updateData);
        let headers = this.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });          

        this.http
          .post(action.payload.url, JSON.stringify(action.payload.updateData), options)
                .map((res: Response) => {
                    const result = res.json();
                    return result;
                })
                .subscribe(
                    res => {
                        let returnAction = {
                            type: DM_BUDGET_UPDATE_ROW_RESULT,
                            payload: res
                        }
            
            this.stateService.showLoader(false);
						this.stateService.dispatch(returnAction);
						
						
						this.stateService.showNotification(true, "Records Saved Successfully!", "success");

                    },
                    err => {
                        console.log(err);
                        this.stateService.showLoader(false);
                        this.handleError(err);
                        
                    }
                );
    }

    insertDmBudgetRow(action) {
      this.stateService.showLoader(true);
      let payload = new URLSearchParams(action.payload.insertDataLst);
      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });

      // console.log(action.payload.insertDataLst);
      this.http
        .post(action.payload.url, JSON.stringify(action.payload.insertDataLst), options)
        .map((res: Response) => {
          const result = res.json();
          return result;
        })
        .subscribe(
        res => {
          let returnAction = {
            type: DM_BUDGET_INSERT_ROW_RESULT,
            payload: res
          }
          this.stateService.showLoader(false);
          
          this.stateService.dispatch(returnAction);
        },
        err => {
          this.stateService.showLoader(false);
          this.handleError(err);
        }
        );

    }

    getDmBudgets(action): void {
      this.stateService.showLoader(true);
      let magCode = action.payload.magCode == null ? null : action.payload.magCode.length == 0 ? null : action.payload.magCode;
      let campYear = action.payload.campYear == null ? null : action.payload.campYear.length == 0 ? null : action.payload.campYear;
      let campId = action.payload.campId == null ? null : action.payload.campId.length == 0 ? null : action.payload.campId;
      let addMode = action.payload.addmode == null ? false : action.payload.addmode;
      let requestUrl = action.payload.url + "/" + magCode + "/" + campYear + "/" + campId + "/" + addMode;      

      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });              

      this.http.get(requestUrl, options)
        .map((res: Response) => {
          const result = res;
          return result;
        })
        .subscribe(data => {
          action.payload.data = data;

          let nAction = {
            type: DM_BUDGET_RESULT,
            payload: action.payload
          };
          this.stateService.showLoader(false);
          this.stateService.dispatch(nAction);
        },
        err => {
          console.log(err);
          this.stateService.showLoader(false);
          this.handleError(err);
        });
    }

    getDmCompletedCampaign(action): void {
      let magCode = action.payload.magazines.length == 0 ? null : action.payload.magazines[0];
      let year = action.payload.years.length == 0 ? null : action.payload.years[0];
      let request_url = action.payload.url + "/" + magCode + "/" + year;
      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });

      this.http.get(request_url, options)
        .map((res: Response) => {
          const result = res;
          return result;
        })
        .subscribe(data => {
          action.payload.data = data;

          let nAction = {
            type: DM_BUDGET_COMPLETED_CAMPAIGNS_RESULT,
            payload: action.payload
          };
          this.stateService.dispatch(nAction);
        },
        err => {
          console.log(err);
          this.handleError(err);
        });
    }

    getSegmentForDMCampaign(action): void {
      let campaign = action.payload.campaign;
      campaign = campaign == 0 ? null : campaign;
      let request_url = action.payload.url + "/" + campaign;
      let headers = this.initAuthHeaders();
      let options = new RequestOptions({ headers: headers });

      this.http.get(request_url, options)
        .map((res: Response) => {
          const result = res;
          return result;
        })
        .subscribe(data => {
          action.payload.data = data;

          let nAction = {
            type: DM_BUDGET_SEGMENTS_RESULT,
            payload: action.payload
          };
          this.stateService.dispatch(nAction);
        },
        err => {
          console.log(err);
          this.handleError(err);
        });
    }

    handleError(error: Response | any) {           
      this.stateService.showServerError(error._body);
      return Observable.throw(error.message || error);
    }

    initAuthHeaders(): Headers {
      let  currentUser  =  JSON.parse(localStorage.getItem('user details')); 
      // console.log(currentUser.token)
      if (currentUser.token == null) {
        this.router.navigate(['./login']);
      }
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer '  +  currentUser.token);       
      return headers;
    }
}

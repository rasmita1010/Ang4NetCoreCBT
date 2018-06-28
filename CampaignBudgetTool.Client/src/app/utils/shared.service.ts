import { Injectable } from "@angular/core";

@Injectable()
export class SharedService {
    private isValidNavigationFromDMBudget: boolean = true;

    constructor() {}

    setIsValidNavigationFromDMBudget(val) {
        this.isValidNavigationFromDMBudget = val;
    }

    getIsValidNavigationFromDMBudget() {
        return this.isValidNavigationFromDMBudget ;
    }

    // unsavedDataAlert(callBackFunction, args) {
	// 	let self = this;
	// 	this.alertText = "<p>You have unsaved changes.</p><br><p>They will be lost if you click Continue.</p><br><p>Click Cancel to save your modifications.</p>";
	// 	this.alertTitle = " Unsaved Changes";
	// 	this.alertBtnText = "Continue";
	// 	this.alertCancelBtnText = "Cancel";

	// 	// Ask if user has confirmed the save before adding new records nad refreshing the table..		
	// 	if (this.updateBatchRows["listOfDMFlashBudgetData"].length >= 1 || (self.isEditingMode && self.gridTouched)) {
	// 		$("#alertText").html(this.alertText);
	// 		$("#userNavAlert").modal();
	// 	}
	// 	else{
	// 		switch (callBackFunction) {
	// 			case "addRowsToGrid": {						
	// 				this.addRowsToGrid(args);
	// 				break;
	// 			}
	// 			case "filterGrid":
	// 			case "clearFilter":{

	// 			}
	// 			default: {
	// 				break;
	// 			}
	// 		}
	// 	}

	// 	$("#continue").on("click", function () {
	// 		$("#userNavAlert").modal("hide");
	// 		self[callBackFunction](args);
	// 	})
	// }
    
}
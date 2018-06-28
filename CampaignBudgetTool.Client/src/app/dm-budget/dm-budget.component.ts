import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from '@angular/router';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import {
  USER_DETAILS,
  DM_BUDGET_DATA,
  DM_BUDGET_URL,
  DM_BUDGET_YEARS_BY_MAGAZINES_URL,
  DM_BUDGET_CAMPAIGNS_BY_MAGAZINEANDYEAR_URL,
  DM_BUDGET_CAMPAIGNS_SEGMENTS_URL,
  DM_BUDGET_GETCAMPAIGNS_BY_MAGAZINEYEAR_URL,
  DM_BUDGET_UPDATE_ROW_URL,
  DM_BUDGET_DELETE_ROW_URL,
  CURRENT_YEAR,
  DM_BUDGET_INSERT_ROW_URL,
  HISTORY_COLUMNS_COLOR,
  REFORECASTING_COLUMNS_COLOR,
  UNSAVED_DATA_ALERT_HEADER, UNSAVED_DATA_ALERT_MSG, CONTINUE, CANCEL
} from "../utils/constants";
import { AppStateService } from "../utils/app-state.service";
import {
  DM_BUDGET,
  DM_BUDGET_RESULT,
  DM_BUDGET_YEARS,
  DM_BUDGET_YEARS_RESULT,
  DM_BUDGET_CAMPAIGNS,
  DM_BUDGET_CAMPAIGNS_RESULT,
  DM_BUDGET_COMPLETED_CAMPAIGNS,
  DM_BUDGET_COMPLETED_CAMPAIGNS_RESULT,
  DM_BUDGET_UPDATE_ROW,
  DM_BUDGET_UPDATE_ROW_RESULT,
  DM_BUDGET_SEGMENTS,
  DM_BUDGET_SEGMENTS_RESULT,
  DM_BUDGET_DELETE_ROW,
  DM_BUDGET_INSERT_ROW,
  DM_BUDGET_INSERT_ROW_RESULT
} from "../utils/actions";
import { CsvService } from "angular2-json2csv";
import { ExcelService } from "../utils/excel.service";
import { SharedService } from "../utils/shared.service";

let $ = null;
let jsGrid = null;

@Component({
  moduleId: module.id,
  templateUrl: './dm-budget.component.html',
  styleUrls: ["dm-budget.component.scss"],
})

export class DmBudgetComponent implements OnInit {

  //@HostListener('window:unload', [ '$event' ])
  //unloadHandler(event) {
  //  alert("unloadHandler")
  //}

  //@HostListener('window:beforeunload', [ '$event' ])
  //beforeUnloadHander(event) {
  //  alert("beforeUnloadHander")
  //}

  isUserReadonly: boolean; // Becomes true if the user has only Readonly role

  JSGRID_ROW_DATA_KEY = "JSGridItem";         // Keys used by the js grid internal api..
  JSGRID_EDIT_ROW_DATA_KEY = "JSGridEditRow"; // Keys used by the js grid internal api..

  disableExportGridBtn: boolean = false;
  recordCount: number; // number of rows in grid

  isFilterApplied: boolean = true;
  isSearchApplied: boolean = false;
  isfilterOptionChoosen: boolean = false;


  // Sets the value when user updates single row.
  saveSingleRow: boolean = false;
  isRowChanged: boolean = false;

  // Used by the cancel button to check if row was earlier edited by the user.
  // If the row was edited, it will have a class unsaved-cell-row attached to the tr and this variable will become true.
  isRowDataChanged: boolean = false;
  currentItemEdited: any; // Holds the json object of currently row in edit mode..
  undoCancel: boolean = false; //used to prevent firing of update server call when updating item using cancel button.

  //When a row is in edit mode and not saved, this gets true.
  isEditingMode: boolean = false;

  //Holds current row index
  currentRowId: any;

  // Alert Box Settings
  alertText: string; // The text or html content to display in popup
  alertTitle: string; // Title of the popup
  alertBtnText: string;  //Ok or Continue button Text
  alertCancelBtnText: string;  // Cancel Button text

  // Boolean flag sets when item is deleting, if not set, the onItemDeleting will keep calling as the row delete is called..
  deleteConfirmed: boolean = false;
  deleteItem: any; // holds the current row to be deleted

  disableYearDD: boolean = true;
  disableCampaignDD: boolean = true;

  pages: any; //defines the pagination drop down list

  defaultPageSize: number = 20; // Number of records to be shown on first load..
  selectedPageSize: number = this.defaultPageSize; // Initially keep the default page size
  previousSearchPageSizeSelected: number = this.defaultPageSize;  // stores previous selected pagesize when user start searching and then deletes the searchbox

  gridTouched: boolean = false; // Sets to true when user enters in the grid
  batchEdit: boolean = false;   // Gets true once user starts clicking multiple rows
  updateBatchRows = {};         // Contains the payload that will be sent to server
  disableSaveAll: boolean = true;

  searchQuery: string; // Holds the search query input

  //Declares the array attached with multiselect dropdown menus
  magOptionsModel: string[];
  magOptions: IMultiSelectOption[];
  yearOptionsModel: number[];
  yearOptions: IMultiSelectOption[];
  campaignOptionsModel: number[];
  campaignOptions: IMultiSelectOption[];

  //Declaration of the array for Add Pop-Up
  magCode: string[];
  campaign: number;
  year: number[];
  magazineOptionsForAddPopup: any[];
  yearOptionForAddPopup: any[] = [
    { "id": CURRENT_YEAR - 1, "name": CURRENT_YEAR - 1 },
    { "id": CURRENT_YEAR, "name": CURRENT_YEAR },
    { "id": CURRENT_YEAR + 1, "name": CURRENT_YEAR + 1 }
  ];

  campaignOptionForAddPopup: any[];
  segmentOptionModel: number[];
  segmentOption: IMultiSelectOption[];
  disableYearDDLOnAddPopup: boolean = true;
  disableCampaignDDLOnAddPopup: boolean = true;
  disableSegmentDDL: boolean = true;
  disableAddOnPopUp: boolean = true;
  disableSaveOnPopup: boolean = true;
  currentUserName: string;
  insertBatchRows = {};
  addMode: boolean = false;
  canSave: boolean = true;
  // clearingFilter : boolean = false;
  isSaveAll: boolean = false;

  singleSelectDropDownSettings: IMultiSelectSettings = {
    buttonClasses: 'btn btn-default btn-block', //class that defines styling of dropdown button
    displayAllSelectedText: true,
    selectionLimit: 1,
    autoUnselect: true,
  };

  singleSelectCampaignDropDownSettings: IMultiSelectSettings = {
    buttonClasses: 'btn btn-default btn-block', //class that defines styling of dropdown button
    displayAllSelectedText: true,
    selectionLimit: 1,
    autoUnselect: true
  };

  // Dropdown Settings configuration
  multiSelectDropDownSettings: IMultiSelectSettings = {
    buttonClasses: 'btn btn-default btn-block', //class that defines styling of dropdown button
    dynamicTitleMaxItems: 0,                    //least number of selected options. After which it show "X selected" 
    displayAllSelectedText: true,
  };

  multiSelectCampaignDropDownSettings: IMultiSelectSettings = {
    buttonClasses: 'btn btn-default btn-block', //class that defines styling of dropdown button
    dynamicTitleMaxItems: 0,                    //least number of selected options. After which it show "X selected" 
    displayAllSelectedText: true,
  }

  // Dropdown text configurations
  magMultiSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Magazines',
    searchEmptyResult: 'No data available',
    checked: 'item selected',
    checkedPlural: 'items selected'
  };
  yearMultiSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Years',
    searchEmptyResult: 'No data available',
    checked: 'item selected',
    checkedPlural: 'items selected'
  };
  campaignMultiSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Campaigns',
    searchEmptyResult: 'No data available',
    checked: 'item selected',
    checkedPlural: 'items selected'
  };
  segmentMultiSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Segments',
    searchEmptyResult: 'No data available',
    checked: 'item selected',
    checkedPlural: 'items selected'
  };

  magSingleSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Magazine',
    searchEmptyResult: 'No data available',
  };
  yearSingleSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Year',
    searchEmptyResult: 'No data available',
  };
  campaignSingleSelectDropDownTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Campaign',
    searchEmptyResult: 'No data available',
  };

  constructor(private stateService: AppStateService, private csvService: CsvService, 
    private excelService: ExcelService, private sharedService: SharedService) {
    $ = window["jQuery"];
    jsGrid = window["jsGrid"];

    //subscribe event to get dm-budget list
    this.stateService.subscribe(DM_BUDGET_RESULT, this.initGrid.bind(this));
    this.stateService.subscribe(DM_BUDGET_UPDATE_ROW_RESULT, this.completeSaveAllSteps.bind(this));
    this.stateService.subscribe(DM_BUDGET_YEARS_RESULT, this.bindYears.bind(this));
    this.stateService.subscribe(DM_BUDGET_CAMPAIGNS_RESULT, this.bindCampaigns.bind(this));
    this.stateService.subscribe(DM_BUDGET_COMPLETED_CAMPAIGNS_RESULT, this.bindCampaign.bind(this));
    this.stateService.subscribe(DM_BUDGET_SEGMENTS_RESULT, this.bindsegment.bind(this));
    this.stateService.subscribe(DM_BUDGET_INSERT_ROW_RESULT, this.refreshParentGridOnNewRecordCreation.bind(this))
  }

  ngOnInit() {
    let self = this;
    this.updateBatchRows["listOfDMFlashBudgetData"] = [];
    let userDetails = this.stateService.getUserDetails;
    this.currentUserName = userDetails.username;
    if (userDetails.roles.length == 1 && userDetails.roles[0] == "Read Only") {
      self.isUserReadonly = true;
    } else {
      self.isUserReadonly = false;
    }

    $("#pagerdropdown").children("select").hide();

    //bind magazines dropdown with magazines user has access to
    let magsJson = JSON.parse(localStorage.getItem(USER_DETAILS)).resources;
    this.magOptions = magsJson.map(m => ({ id: m.resourceName, name: m.resourceName + "- " + m.description }));
    this.getAllDmBudgets();

    // Bind input event on all cells to accomodate only numbers and decimals. 
    // The column wise seperation of logic for decimal and non decimal field is 
    // done in formatNumber and formatDecimalNumber functions on js grid api levels..
    let correctFormatNumber = "";
    $(document).on("input", ".jsgrid-table .whole-number-cell input[type='text']", function () {
      let num = $(this).val();
      self.gridTouched = true; //enables save button if user enters into any cell..

      if (!num.match(/^[0-9]*$/)) {
        $(this).val(correctFormatNumber);
      } else {
        correctFormatNumber = num;
      }
    });

    let correctDecimalFormatNumber = ""; //store the correct format that user has already entered and replace if wron format is entered;
    $(document).on("input", ".jsgrid-table .decimal-cell input[type='text']", function (e) {
      let num = $(this).val();
      self.gridTouched = true; //enables save button if user enters into any cell..

      if (!num.match(/^\d*\.?\d{0,2}$/)) {
        $(this).val(correctDecimalFormatNumber);
      } else {
        correctDecimalFormatNumber = num;
      }
    });

    //window.onbeforeunload(this.unsavedDataAlert("browserRefresh", ""));

  }

  getAllDmBudgets(): void {
    let magsJson = JSON.parse(localStorage.getItem(USER_DETAILS)).resources;

    //Dispatch event to get dm-budgets for binding grid on initial load
    let magCodes = magsJson.map(function (mag) { return mag.resourceName; }).join(',');
    let action = {
      type: DM_BUDGET,
      payload: {
        url: DM_BUDGET_URL, magCode: magCodes, campYear: null, campId: null, addmode: false
      }
    }

    this.stateService.dispatch(action);
  }

  onMagSelectionChange(): void {
    this.campaignOptions = [];
    this.yearOptions = [];
    this.disableYearDD = this.magOptionsModel.length == 0;
    if (this.magOptionsModel.length == 0) {
      this.yearOptionsModel = [];
      this.yearOptions = [];
      this.isfilterOptionChoosen = false;
    }
    if (this.magOptionsModel.length > 0) {
      this.isfilterOptionChoosen = true;

      let year_action = {
        type: DM_BUDGET_YEARS,
        payload: {
          url: DM_BUDGET_YEARS_BY_MAGAZINES_URL, magazines: this.magOptionsModel,
        }
      }
      this.stateService.dispatch(year_action);
    }
    if (!this.disableCampaignDD) {
      this.onYearSelectionChange();
    }
  }

  bindYears(response): void {
    let yearsJson = JSON.parse(response.payload.data._body);
    this.yearOptions = yearsJson.map(m => ({ id: m.campaign_Year, name: m.campaign_Year }));
    // Preserve earlier selection
    // if(!this.clearingFilter && this.yearOptionsModel && this.yearOptionsModel.length > 0){
    if (this.magOptionsModel && this.magOptionsModel.length > 0
      && this.yearOptionsModel && this.yearOptionsModel.length > 0) {
      let availableYears = [];
      this.yearOptions.forEach(year => availableYears.push(year.id));
      this.yearOptionsModel = this.yearOptionsModel.filter(year =>
        availableYears.indexOf(year) >= 0);
      this.onYearSelectionChange();
    }
  }

  onYearSelectionChange(): void {
    this.campaignOptions = [];
    if (this.yearOptionsModel.length == 0) {
      this.campaignOptionsModel = [];
      // this.campaignOptions = [];
    }
    this.disableCampaignDD = this.yearOptionsModel.length == 0;
    if (this.yearOptionsModel.length > 0 && this.magOptionsModel.length == 0) {
      this.yearOptionsModel = [];
      this.yearOptions = [];
      return;
    }
    let campaign_action = {
      type: DM_BUDGET_CAMPAIGNS,
      payload: {
        url: DM_BUDGET_CAMPAIGNS_BY_MAGAZINEANDYEAR_URL,
        magazines: this.magOptionsModel,
        years: this.yearOptionsModel
      }
    }
    this.stateService.dispatch(campaign_action);
  }

  bindCampaigns(response): void {
    if (this.yearOptionsModel.length == 0) {
      this.campaignOptionsModel = [];
      this.campaignOptions = [];
    }
    let campaignsJson = JSON.parse(response.payload.data._body);
    this.campaignOptions = campaignsJson.map(m => ({ id: m.campaign_Id, name: m.campaign_Name }));
    // Preserve earlier selection
    // if(!this.clearingFilter && this.campaignOptionsModel && this.campaignOptionsModel.length > 0){
    if (this.magOptionsModel && this.magOptionsModel.length > 0
      && this.yearOptionsModel && this.yearOptionsModel.length > 0
      && this.campaignOptionsModel && this.campaignOptionsModel.length > 0) {
      let availableCampaignIds = [];
      this.campaignOptions.forEach(camapign => availableCampaignIds.push(camapign.id));
      this.campaignOptionsModel = this.campaignOptionsModel.filter(campaign =>
        availableCampaignIds.indexOf(campaign) >= 0);
    }
  }

  searchGrid() {
    let self = this;

    $("#dm-budget-grid").jsGrid("search", {
      searchText: self.searchQuery
    });

    let filteredData = $("#dm-budget-grid").jsGrid("option", "data");
    this.recordCount = filteredData.length;
    self.highlighText(self.searchQuery);

    // Add different color to reforecast & history columns
    $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
    $(".history-column").css("background", HISTORY_COLUMNS_COLOR);

    //Disable Export Grid button, When no record is available in grid
    if (this.recordCount <= 0) {
      this.disableExportGridBtn = true;
    }
    else {
      this.disableExportGridBtn = false;
    }

    this.isSearchApplied = true;

    this.selectedPageSize = this.previousSearchPageSizeSelected;
    this.pages = this.createPaginationArray(this.recordCount);
  }

  clearSearch() {
    this.isSearchApplied = false;
    this.searchQuery = '';
    this.searchGrid();
    this.selectedPageSize = this.defaultPageSize;
    this.onPageSizeChange(this.selectedPageSize);
  }

  highlighText(arg) {
    let k = $(".jsgrid-grid-body table td");
    let skipCharArray = ["*", "(", ")", "?", "\\", ","]; // when special character is added, skip it with a double backslash..

    if (arg) {
      for (let i of k) {
        let sourceString = $(i).text();

        // Replace comma seperated numbers and then perform highlight. 
        // It takes care of placing comma back on emptying the search box
        sourceString = sourceString.replace(",", "");

        if (sourceString.length) {
          let searchText = arg;

          searchText = searchText.replace(/\*/g, "");
          searchText = searchText.replace(/\(/g, "");
          searchText = searchText.replace(/\)/g, "");
          searchText = searchText.replace(/\?/g, "");
          searchText = searchText.replace(/\\/g, "");
          searchText = searchText.replace(/\,/g, "");
          searchText = searchText.replace(/\./g, "\\.");

          searchText = searchText.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");



          let pattern = new RegExp("(" + searchText + ")", "gi");

          sourceString = sourceString.replace(pattern, "<mark>$1</mark>");
          // sourceString = sourceString.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4");

          $(i).html(sourceString)
        }
      }
    }
  }

  makeReadonly() {
    $("#dm-budget-grid").jsGrid("option", "editing", false)
    $("#dm-budget-grid").jsGrid("option", "inserting", false)
  }

  initGrid(response): void {
    this.sharedService.setIsValidNavigationFromDMBudget(true);
    let self = this;
    let windowHeight = $(window).height();
    let result = JSON.parse(response.payload.data._body);
    let dmbudgets = result.listOfDMFlashBudgetData;

    //Storing the fresh copy in localstorage...
    localStorage.setItem(DM_BUDGET_DATA, JSON.stringify(dmbudgets));

    //Disable Export Grid button, When no record is available in grid
    this.recordCount = dmbudgets.length;
    if (this.recordCount <= 0) {
      this.disableExportGridBtn = true;
    }
    else {
      this.disableExportGridBtn = false;
    }

    this.pages = this.createPaginationArray(this.recordCount);

    jsGrid.sortStrategies.numericSorter = function (data1, data2) {
      return data1 - data2;
    }

    $("#dm-budget-grid").jsGrid({
      width: "100%",
      height: (windowHeight * 0.63) + "px", // Use 68% of window height
      confirmDeleting: false,
      deleteConfirm: "Do you want to delete this record?",

      editing: true,
      sorting: true,
      paging: true,
      pageButtonCount: 4,
      pagerContainer: "#externalPager",
      pageIndex: 1,
      pageSize: self.selectedPageSize,
      pagerFormat: "Pages: {first} {prev} {pages} {next} {last}    {pageIndex} of {pageCount}",
      pagePrevText: "<",
      pageNextText: ">",
      pageFirstText: "<<",
      pageLastText: ">>",
      pageNavigatorNextText: "...",
      pageNavigatorPrevText: "...",
      autoload: true,
      controller: {

        loadData: function (filter) {
          let result = $.grep(dmbudgets, function (item) {

            if (item.averageTerm != null || item.averageValue != null || item.averageTermRfct != null || item.averageValueRfct != null) {
              if (Math.floor(item.averageTerm) == item.averageTerm) {
                item.averageTerm = parseInt(item.averageTerm).toFixed(2);
              }
            }

            if (item.averageValue != null) {
              if (Math.floor(item.averageValue) == item.averageValue) {
                item.averageValue = parseInt(item.averageValue).toFixed(2);
              }
            }

            if (item.averageTermRfct != null) {
              if (Math.floor(item.averageTermRfct) == item.averageTermRfct) {
                item.averageTermRfct = parseInt(item.averageTermRfct).toFixed(2);
              }
            }

            if (item.averageValueRfct != null) {
              if (Math.floor(item.averageValueRfct) == item.averageValueRfct) {
                item.averageValueRfct = parseInt(item.averageValueRfct).toFixed(2);
              }
            }

            return !filter.searchText ||
              (item.magazine != null && item.magazine.toLowerCase().indexOf(filter.searchText.toLowerCase()) != -1) ||
              (item.campaignName != null && item.campaignName.toLowerCase().indexOf(filter.searchText.toLowerCase()) != -1) ||
              (item.segment != null && item.segment.toLowerCase().indexOf(filter.searchText.toLowerCase()) != -1) ||
              (item.mailVolume != null && item.mailVolume.toString().indexOf(filter.searchText) != -1) ||
              (item.grossSubs != null && item.grossSubs.toString().indexOf(filter.searchText) != -1) ||
              (item.netSubs != null && item.netSubs.toString().indexOf(filter.searchText) != -1) ||
              (item.averageTerm != null && item.averageTerm.toString().indexOf(filter.searchText) != -1) ||
              (item.averageValue != null && item.averageValue.toString().indexOf(filter.searchText) != -1) ||
              (item.mailVolumeRfct != null && item.mailVolumeRfct.toString().indexOf(filter.searchText) != -1) ||
              (item.grossSubsRfct != null && item.grossSubsRfct.toString().indexOf(filter.searchText) != -1) ||
              (item.netSubsRfct != null && item.netSubsRfct.toString().indexOf(filter.searchText) != -1) ||
              (item.averageTermRfct != null && item.averageTermRfct.toString().indexOf(filter.searchText) != -1) ||
              (item.averageValueRfct != null && item.averageValueRfct.toString().indexOf(filter.searchText) != -1)
          });

          return result;
        }
      },

      invalidNotify: function (args) {
        let messages = $.map(args.errors, function (error) {
          return error.field + ": " + error.message;
        });
      },

      fields: [
        {
          name: "magazine", type: "string", title: "Magazine", width: 28, itemTemplate: function (val, item) {
            return $("<div style='height: 15px; width:100px; overflow:hidden !important; text-overflow:ellipsis; white-space:nowrap; display:inline-block'>").prop("title", val).text(val);
          }
        },
        {
          name: "campaignName", type: "string", title: "Campaign Name", width: 50, itemTemplate: function (val, item) {
            return $("<div style='height: 15px; width:170px; overflow:hidden !important; text-overflow:ellipsis; white-space:nowrap; display:inline-block'>").prop("title", val).text(val);
          }
        },
        {
          name: "mailDate", type: "string", title: "Mail Date", width: 22, itemTemplate: function (val, item) {
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", val.substring(0, 10)).text(val.substring(0, 10));
          }
        },
        {
          name: "segment", type: "string", title: "Segment", width: 30, itemTemplate: function (val, item) {
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", val).text(val);
          }
        },
        {
          name: "mailVolume", type: "text", title: "Mail Volume", width: 25,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "history-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "grossSubs", type: "text", title: "Gross Subs", width: 24,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "history-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "netSubs", type: "text", title: "Net Subs", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "history-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "averageTerm", type: "text", title: "Avg Term", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "history-column decimal-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatDecimalNumber(val, true);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "averageValue", type: "text", title: "Avg Value", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "history-column decimal-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatDecimalNumber(val, true);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "mailVolumeRfct", type: "text", title: "Mail Volume", width: 25,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "reforecast-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "grossSubsRfct", type: "text", title: "Gross Subs", width: 24,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "reforecast-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "netSubsRfct", type: "text", title: "Net Subs", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "reforecast-column whole-number-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatNumber(val);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "averageTermRfct", type: "text", title: "Avg Term", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "reforecast-column decimal-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatDecimalNumber(val, true);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "averageValueRfct", type: "text", title: "Avg Value", width: 20,
          validate: {
            validator: function (val, item) {
              if (item.mailVolume == "" && item.grossSubs == "" && item.netSubs == "" && item.averageTerm == "" && item.averageValue == "" && item.averageTermRfct == "" && item.averageValueRfct == "" && item.grossSubsRfct == "" && item.mailVolumeRfct == "" && item.netSubsRfct == "") {
                self.EmptyRecordAlert();
                return false;
              }
              else
                return true;
            }
          },
          css: "reforecast-column decimal-cell", sorter: "numericSorter", itemTemplate: function (val, item) {
            let formattedValue = self.formatDecimalNumber(val, true);
            return $("<div style='height: 15px; overflow:hidden;'>").prop("title", formattedValue).text(formattedValue);
          }
        },
        {
          name: "Control", type: "control", width: 25, title: "Actions",
          css: "unsaved-cell-mark cell-position-relative",
          itemTemplate: function () {
            let result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
            let unsavedMark = $("<span class='glyphicon glyphicon-exclamation-sign unsaved-rows' title='Click Save All button to save the rows'></span>");
            return result.add(unsavedMark);
          },

          _createCancelEditButton: function () {

            // console.log(self.currentRowId,
            // 	self.isRowDataChanged,
            // 	self.currentItemEdited);

            var $result = jsGrid.fields.control.prototype._createCancelEditButton.apply(this, arguments);
            $result.on("click", function () {

              if (self.isRowDataChanged) {
                // self.currentItemEdited.mailVolume = 99999;
                // $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(4).html(99999);
                let serverData;
                let serverItem;
                let currItem;

                if (self.updateBatchRows["listOfDMFlashBudgetData"].length) {
                  serverData = JSON.parse(localStorage.getItem(DM_BUDGET_DATA))

                  // update the payload carrying variable updateBatchRows with server item on pressing cancel..
                  for (let i of self.updateBatchRows["listOfDMFlashBudgetData"]) {
                    serverItem = serverData.find(item => item.flashBudgetId == i.flashBudgetId);
                    if (i.flashBudgetId == self.currentRowId) {
                      self.currentItemEdited.mailVolume = i.mailVolume = serverItem.mailVolume;
                      self.currentItemEdited.grossSubs = i.grossSubs = serverItem.grossSubs;
                      self.currentItemEdited.netSubs = i.netSubs = serverItem.netSubs;
                      self.currentItemEdited.averageTerm = i.averageTerm = serverItem.averageTerm;
                      self.currentItemEdited.averageValue = i.averageValue = serverItem.averageValue;
                      self.currentItemEdited.mailVolumeRfct = i.mailVolumeRfct = serverItem.mailVolumeRfct;
                      self.currentItemEdited.grossSubsRfct = i.grossSubsRfct = serverItem.grossSubsRfct;
                      self.currentItemEdited.netSubsRfct = i.netSubsRfct = serverItem.netSubsRfct;
                      self.currentItemEdited.averageTermRfct = i.averageTermRfct = serverItem.averageTermRfct;
                      self.currentItemEdited.averageValueRfct = i.averageValueRfct = serverItem.averageValueRfct;

                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(4).html(serverItem.mailVolume);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(5).html(serverItem.grossSubs);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(6).html(serverItem.netSubs);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(7).html(serverItem.averageTerm);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(8).html(serverItem.averageValue);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(9).html(serverItem.mailVolumeRfct);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(10).html(serverItem.grossSubsRfct);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(11).html(serverItem.netSubsRfct);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(12).html(serverItem.averageTermRfct);
                      $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).children().eq(13).html(serverItem.averageValueRfct);
                    }
                  }
				          self.currentItemEdited.isEdited = false;
                  $("#dm-budget-grid").jsGrid("rowByItem", self.currentItemEdited).removeClass("unsaved-cell-row").find("td:last-child").addClass("unsaved-cell-mark")
                }
              }
              let unsavedRecordCount = $("#dm-budget-grid").find("tr.unsaved-cell-row").length;
			 	      self.sharedService.setIsValidNavigationFromDMBudget(unsavedRecordCount == 0) 	
            })

            return $result;
          }
        }
      ],

      // Creates custom parent header row over the normal column headers..
      headerRowRenderer: function () {
        let result = $("<tr>").height(0).append($("<th>").width(28)).append($("<th>").width(50)).append($("<th>").width(22)).append($("<th>").width(30)).append($("<th>").width(25)).append($("<th>").width(24)).append($("<th>").width(20)).append($("<th>").width(20)).append($("<th>").width(20)).append($("<th>").width(25)).append($("<th>").width(24)).append($("<th>").width(20)).append($("<th>").width(20)).append($("<th>").width(20))

        if (!self.isUserReadonly) {
          result.append($("<th>").width(25));
        }

        result = result.add($("<tr>")
          .append($("<th>").text("").css({ "border-left": "1px solid #e9e9e9" }))
          .append($("<th>").text("").css({ "border-left": "1px solid #e9e9e9" }))
          .append($("<th>").text("").css({ "border-left": "1px solid #e9e9e9" }))
          .append($("<th>").text("").css({ "border-left": "1px solid #e9e9e9" }))
          .append($("<th>").attr("colspan", 5).attr("class", "history-column").text("BUDGET")
            .css({ "text-align": "center", "border": "1px solid #e9e9e9", "padding": ".5em 0" }))
          .append($("<th>").attr("colspan", 5).attr("class", "reforecast-column").text("REFORECAST")
            .css({ "text-align": "center", "border": "1px solid #e9e9e9", "padding": ".5em 0" }))
        )
        if (!self.isUserReadonly) {
          result.add($("<tr>").append($("<th>").attr("colspan", 1).text("")))
        }
        // Add sorting feature
        var $tr = $("<tr>");
        var grid = this;
        grid._eachField(function (field, index) {
          var $th = $("<th>").text(field.title).width(field.width).appendTo($tr);

          if (grid.sorting && field.sorting) {
            $th.on("click", function () {
              grid.sort(index);
              this.addClass(grid._sortOrder === "asc" ? grid.sortAscClass : grid.sortDescClass);
            });
          }
        });

        return result.add($tr);
      },

      // Updates a single row.
      onItemUpdating: function (args) {

        let previousItem;
        let item;

        if (args.previousItem) {
          previousItem = JSON.parse(JSON.stringify(args.previousItem)); //fetching shallow json copy
        }

        if (args.item) {
          item = JSON.parse(JSON.stringify(args.item)); 		  //new updated item..
        }

        //The columns we want to ignore for comparing with previous item
        let ignoreComparisionColumns = ["campaignId", "campaignName", "currentStatus", "flashBudgetId", "magazine", "mailDate", "segment", "segmentId", "updatedBy"];

        if (!self.batchEdit) {
          self.saveSingleRow = true;
        }

        //Convert the null values in previousItem shallow copy to empty string..
        for (let index in previousItem) {
          if (previousItem[index] == null) {
            previousItem[index] = "";
          }

          if (ignoreComparisionColumns.indexOf(index) == -1) {
            if (previousItem[index] == item[index]) {

              if (!self.saveSingleRow) {
                self.isRowChanged = self.gridTouched = false;
              }
            } else {
              self.isRowChanged = self.gridTouched = true;
              break;
            }
          }

        }

        let updateRow = {};
        args.item.currentStatus = "MODIFIED";

        var userDetails = JSON.parse(localStorage.getItem(USER_DETAILS));
        args.item.UpdatedBy = userDetails.username;

        updateRow["listOfDMFlashBudgetData"] = [];
        updateRow["listOfDMFlashBudgetData"].push(args.item);
        self.sharedService.setIsValidNavigationFromDMBudget(updateRow["listOfDMFlashBudgetData"].length == 1)
        let dbBudgetUpdateRow = {
          type: DM_BUDGET_UPDATE_ROW,
          payload: {
            url: DM_BUDGET_UPDATE_ROW_URL,
            updateData: updateRow
          }
        }
        if (!self.batchEdit) {
          self.isEditingMode = false;
          self.saveSingleRow = true;
          self.stateService.dispatch(dbBudgetUpdateRow);
        }

      },



      cancelEdit() {
        self.isEditingMode = false;
        self.undoCancel = true;

        // API Function Do not make any changes
        if (!this._editingRow)
          return;

        this._getEditRow().remove();
        this._editingRow.show();
        this._editingRow = null;
        // API Function Do not make any changes



      },

      rowClick: function (args) {
        self.isEditingMode = true;
        if (this._editingRow) {
          self.batchEdit = true;
          this.updateItem("batch");
        }

        if (this.editing) {
          this.editItem($(args.event.target).closest("tr"));
        }

        // Add different color to reforecast & history columns
        $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
        $(".history-column").css("background", HISTORY_COLUMNS_COLOR);
      },

      onItemEditing: function (args) {
        // assign curent row's flashbudgetId. This will be used by the cancel row edit function cancelEdit() as that does not provided by the api :(
        self.currentRowId = args.item.flashBudgetId;
        self.isRowDataChanged = $("#dm-budget-grid").jsGrid("rowByItem", args.item).hasClass("unsaved-cell-row"); // Find out if the row was edited. Returns boolean true if it has.
        self.currentItemEdited = args.item;
        self.isEditingMode = true;
      },


      onItemUpdated: function (args) {
        //If user is updating only a single row, then remove the exclamatory mark. 
        //Resolves the corner case where user may do multiple edits but then save only single row without clicking Save All button..
        if (self.saveSingleRow) {
          args.item.isEdited = false;
          args.row.find("td.unsaved-cell-mark").addClass("unsaved-cell-mark").parent().removeClass("unsaved-cell-row");
        }

        // Add different color to reforecast & history columns. Below snippet fixes last-edited-row-not-higlighting issue
        $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
        $(".history-column").css("background", HISTORY_COLUMNS_COLOR);

        //Once the row is updated, add unsaved-cell-row class to show the exclamatory mark. Also remove the unsaved-cell-mark class
        if (self.gridTouched && self.batchEdit == true) {
          args.item.isEdited = true;
          args.row.find("td.unsaved-cell-mark").removeClass("unsaved-cell-mark").parent().addClass("unsaved-cell-row");
        }
        self.sharedService.setIsValidNavigationFromDMBudget(self.updateBatchRows["listOfDMFlashBudgetData"].length > 0);
      },

      //Creates an exclaimation mark on the row..
      rowClass: function (item) {
        return item.isEdited ? 'unsaved-cell-row' : '';
      },

      updateItem: function (editType, item, editedItem) {
        if (this._editingRow == null) {
          return;
        }

        if (typeof (item) != "undefined" && typeof (editedItem) != "undefined") {
          editedItem = item;
        }

        if (editType == "batch") {
          if (this._editingRow != null) {
            self.batchEdit = true;
            let itemFromRow = this._editingRow.data("JSGridItem");
            let updArray = self.updateBatchRows["listOfDMFlashBudgetData"];
            itemFromRow.currentStatus = "MODIFIED";
            var userDetails = JSON.parse(localStorage.getItem(USER_DETAILS));
            itemFromRow.UpdatedBy = userDetails.username;

            setTimeout(function () {
              if (updArray.length) {
                for (let i in updArray) {
                  let index = updArray.findIndex(function (el) {
                    return el.flashBudgetId == itemFromRow.flashBudgetId;
                  })
                  if (index >= 0) {
                    updArray.splice(index, 1);
                    updArray.push(itemFromRow);
                  }
                  else {
                    updArray.push(itemFromRow);
                  }
                }
              }
              else if (self.isRowChanged) { // If row is changed from previous value, only then make any change...
                updArray.push(itemFromRow);
              }
            }, 100)
          }
        }

        if (editType != "batch") {
          self.batchEdit = false;
        }


        var $row = item ? this.rowByItem(item) : this._editingRow;
        editedItem = editedItem || this._getValidatedEditedItem();

        // Truncate any decimal values. Allow for only average value columns
        editedItem.mailVolume = editedItem.mailVolume ? Math.trunc(editedItem.mailVolume) : "";
        editedItem.mailVolumeRfct = editedItem.mailVolumeRfct ? Math.trunc(editedItem.mailVolumeRfct) : "";
        editedItem.grossSubs = editedItem.grossSubs ? Math.trunc(editedItem.grossSubs) : "";
        editedItem.grossSubsRfct = editedItem.grossSubsRfct ? Math.trunc(editedItem.grossSubsRfct) : "";
        editedItem.netSubs = editedItem.netSubs ? Math.trunc(editedItem.netSubs) : "";
        editedItem.netSubsRfct = editedItem.netSubsRfct ? Math.trunc(editedItem.netSubsRfct) : "";

        if (!editedItem) {
          return;
        }

        return this._updateRow($row, editedItem);
      },

      onPageChanged: function (args) {
        args.grid.updateItem("batch")
      },

      _editRow: function ($row) {
        if (!this.editing) {
          return;
        }


        var item = $row.data(self.JSGRID_ROW_DATA_KEY);

        var args = this._callEventHandler(this.onItemEditing, {
          row: $row,
          item: item,
          itemIndex: this._itemIndex(item)
        });

        if (args.cancel) {
          return;
        }


        if (this._editingRow) {
          this.cancelEdit();
        }

        var $editRow = this._createEditRow(item);

        this._editingRow = $row;
        $row.hide();
        $editRow.insertBefore($row);
        $row.data(self.JSGRID_EDIT_ROW_DATA_KEY, $editRow);
      },

      onItemDeleting: function (args) {
        if (!self.deleteConfirmed) {
          args.cancel = true;
          self.deleteItem = args;
          self.deleteConfirm();
        }
      },

      onItemDeleted: function (rowItem) {
        let action = {
          type: DM_BUDGET_DELETE_ROW,
          payload: {
            url: DM_BUDGET_DELETE_ROW_URL,
            itemId: rowItem.item.flashBudgetId
          }
        }

        self.stateService.dispatch(action);
        self.deleteConfirmed = false;
      },

      onRefreshed: function (args) {
        var items = args.grid.option("data");

        if (typeof (items) != "undefined") {
          let gridsize = items.length;
          let pagesize = args.grid.option("pageSize");

          if (gridsize < pagesize) {
            // $("#pagerdropdown").children("select").hide();
          }
          else {
            $("#pagerdropdown").children("select").show();
          }
        }
        // Add different color to reforecast & history columns
        $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
        $(".history-column").css("background", HISTORY_COLUMNS_COLOR);
        self.highlighText(self.searchQuery);
      },

      _setSortingCss: function () {

        var fieldIndex = $.inArray(this._sortField, this.fields); // this is how you know the sorting field index
        var sortAscClass = 'jsgrid-header-sort jsgrid-header-sort-asc';
        var sortDescClass = 'jsgrid-header-sort jsgrid-header-sort-desc';

        // add css class to the header cell. You can identify it by fieldIndex.
        $($('.jsgrid-grid-header tr:nth-child(3) th')[fieldIndex]).addClass(this._sortOrder === "asc" ? sortAscClass : sortDescClass);
      },
    });

    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(5)').addClass("history-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(6)').addClass("history-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(7)').addClass("history-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(8)').addClass("history-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(9)').addClass("history-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(10)').addClass("reforecast-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(11)').addClass("reforecast-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(12)').addClass("reforecast-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(13)').addClass("reforecast-column");
    $('.jsgrid-grid-header tr:nth-child(3) th:nth-child(14)').addClass("reforecast-column");

    // Add different color to reforecast & history columns
    $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
    $(".history-column").css("background", HISTORY_COLUMNS_COLOR);

    if (self.isUserReadonly) {
      $("#dm-budget-grid").jsGrid("fieldOption", "Control", "visible", false);
      self.makeReadonly();
    }

    if (self.isSearchApplied == true) {
      self.searchGrid();
    }
    // If filter was applied before saving all changes, re-apply filter
    if (self.isfilterOptionChoosen && !self.isFilterApplied && self.isSaveAll) {
      self.filterGrid();
    }
  }

  completeSaveAllSteps() {
    this.sharedService.setIsValidNavigationFromDMBudget(this.updateBatchRows["listOfDMFlashBudgetData"].length == 0);
    //If saveSingleRow is true, then do not enable save button or any parameter linked with batch save.. 
    if (!this.saveSingleRow) {
      this.updateBatchRows["listOfDMFlashBudgetData"] = [];
      this.batchEdit = false;
      this.gridTouched = false;
      this.isSaveAll = true;
      this.getAllDmBudgets(); // Fetch new data again from server on save all.. do not do this when doing single save row as it will remove the remaining row highlighting..
    } else {
      this.saveSingleRow = false;

      //Check if user has saved all rows without batch operation
      if ($("#dm-budget-grid").find(".unsaved-rows:visible").length == 0) {
        this.updateBatchRows["listOfDMFlashBudgetData"] = [];
        this.batchEdit = false;
        this.gridTouched = false;
      }
    }
  }

  onPageSizeChange(value: number): void {
    $("#dm-budget-grid").jsGrid("updateItem", "batch");
    this.previousSearchPageSizeSelected = value;
    if (value == this.recordCount) {
      let gridData = $("#dm-budget-grid").jsGrid("option", "data");
      $("#dm-budget-grid").jsGrid("option", "pageSize", gridData.length);
    }
    else {
      $("#dm-budget-grid").jsGrid("option", "pageSize", value);
    }
  }


  filterGrid() {

    this.isSaveAll = false;
    let magCodes = this.magOptionsModel;
    let campYears = this.yearOptionsModel;
    let campaigns = this.campaignOptionsModel;

    if (typeof (this.magOptionsModel) == "undefined" || this.magOptionsModel.length == 0) {
      let magsJson = JSON.parse(localStorage.getItem(USER_DETAILS)).resources;
      magCodes = magsJson.map(function (mag) { return mag.resourceName; }).join(',');
    }

    // commented the below code to always sort by FlashBudgetId desc when new records are added
    //if ((typeof (this.magOptionsModel) == "undefined" || this.magOptionsModel.length == 0) && (typeof (this.yearOptionsModel) == "undefined" || this.yearOptionsModel.length == 0) && (typeof (this.campaignOptionsModel) == "undefined" || this.campaignOptionsModel.length == 0) && this.addMode == true)
    //  this.addMode = true;
    //else
    //  this.addMode = false;

    let action = {
      type: DM_BUDGET,
      payload: {
        url: DM_BUDGET_URL, magCode: magCodes, campYear: campYears, campId: campaigns, addmode: this.addMode
      }
    }

    this.stateService.dispatch(action);

    if ((typeof (this.magOptionsModel) == "undefined" || this.magOptionsModel.length == 0) && (typeof (this.yearOptionsModel) == "undefined" || this.yearOptionsModel.length == 0) && (typeof (this.campaignOptionsModel) == "undefined" || this.campaignOptionsModel.length == 0)) {
      this.isFilterApplied = true;
    }
    else {
      this.isFilterApplied = false;
    }

  }

  clearFilter() {

    // this.clearingFilter = true;

    //this.campaignOptions = [];		
    this.campaignOptionsModel = [];
    this.disableCampaignDD = true;

    //this.yearOptions = [];		
    this.yearOptionsModel = [];
    //this.onYearSelectionChange();
    this.disableYearDD = true;

    this.magOptionsModel = [];
    // this.onMagSelectionChange();

    this.isSaveAll = false;
    this.getAllDmBudgets();
    this.isFilterApplied = true;
    this.isfilterOptionChoosen = false;
    this.selectedPageSize = this.defaultPageSize;
    this.onPageSizeChange(this.selectedPageSize);
    // this.clearingFilter = false;
  }

  onMagDropdownChange(): void {
    this.disableYearDDLOnAddPopup = this.magCode.length == 0;
    if (this.magCode.length == 0) {
      this.year = [];
      this.campaignOptionForAddPopup = [];
      this.campaign = 0;
      this.disableCampaignDDLOnAddPopup = true;
      this.segmentOption = [];
      this.segmentOptionModel = []
      this.disableSegmentDDL = true;
    }
    if (this.year.length > 0) {
      this.onYearDropdownChange()
    }

    this.campaign = 0;
    $($("#campaignselect option")[0]).text('Select Campaign');
  }

  onYearDropdownChange(): void {
    this.disableCampaignDDLOnAddPopup = this.year.length == 0;
    if (this.year.length == 0) {
      this.campaignOptionForAddPopup = [];
      this.campaign = 0;
      this.segmentOption = [];
      this.segmentOptionModel = [];
      this.disableSegmentDDL = true;
    }

    if (this.year.length > 0) {
      let campaignDD_action = {
        type: DM_BUDGET_COMPLETED_CAMPAIGNS,
        payload: {
          url: DM_BUDGET_GETCAMPAIGNS_BY_MAGAZINEYEAR_URL,
          magazines: this.magCode,
          years: this.year
        }
      }
      this.stateService.dispatch(campaignDD_action);
    }
  }

  onCampaignDropdownChange(): void {
    if (this.campaign == 0)
      this.disableSegmentDDL = true;
    else
      this.disableSegmentDDL = false;

    this.segmentOption = [];
    this.segmentOptionModel = [];
    if (this.campaign > 0) {
      let segment_action = {
        type: DM_BUDGET_SEGMENTS,
        payload: {
          url: DM_BUDGET_CAMPAIGNS_SEGMENTS_URL,
          campaign: this.campaign
        }
      }
      this.stateService.dispatch(segment_action);
    }
  }

  bindCampaign(response): void {
    let campaignsJson = JSON.parse(response.payload.data._body);
    this.campaignOptionForAddPopup = campaignsJson.map(m => ({ id: m.campaign_Id, name: m.campaign_Name }));

    if (this.campaignOptionForAddPopup.length == 0)
      $($("#campaignselect option")[0]).text('No data available');
    else
      $($("#campaignselect option")[0]).text('Select Campaign');

  }

  bindsegment(response): void {
    let segmentJson = JSON.parse(response.payload.data._body);
    this.segmentOption = segmentJson.map(m => ({ id: m.segment_Id, name: m.segmentName }));
  }
  onSegmentChange(): void {
    this.disableAddOnPopUp = this.segmentOptionModel.length == 0;
  }


  popup(callBackFunction, args) {
    let self = this;
    this.alertText = UNSAVED_DATA_ALERT_MSG;
    this.alertTitle = UNSAVED_DATA_ALERT_HEADER;
    this.alertBtnText = CONTINUE;
    this.alertCancelBtnText = CANCEL;

    // Ask if user has confirmed the save before adding new records nad refreshing the table..
    if (this.updateBatchRows["listOfDMFlashBudgetData"].length >= 1 || (self.isEditingMode && self.gridTouched)) {   
      $("#alertText").html(this.alertText);
      $("#userNavAlert").modal();
    }
    else {
      self.IgnoreEdit(callBackFunction, args);
    }

    $("#continue").on("click", function () {
      $("#userNavAlert").modal("hide");
      self.IgnoreEdit(callBackFunction, args);
    })
  }

  IgnoreEdit(callBackFunction, args) {
    let self = this;
    switch (callBackFunction) {
      case "addRowsToGrid":
        self[callBackFunction](args);
        break;
      case "filterGrid":
        self.filterGrid();
        break;
      case "clearFilter":
        self.clearFilter();
        break;
      default:
        break;
    }
  }

  // Make this single function for all popup... DEV
  unsavedDataAlert(callBackFunction, args) { 
    let self = this;
    self.popup(callBackFunction, args);
  }

  continueAddDataWithoutSaveAlert() {
    $("#addDataWithoutSaveAlert, #addRowsToGrid").modal("hide");
  }

  closeAddPopup() {
    if (this.insertBatchRows["listOfDMFlashBudgetData"].length > 0) {
      $("#addDataWithoutSaveAlert").modal();
    } else {
      //this.getAllDmBudgets();
      $("#addRowsToGrid").modal("hide");
    }

  }

  deleteConfirm() {
    let self = this;
    $("#deleteRecordAlert").modal();
  }

  deleteCurrentRecord() {
    this.deleteRow(this.deleteItem);
  }

  deleteRow(args) {
    this.deleteConfirmed = true;
    $("#dm-budget-grid").jsGrid('deleteItem', args.item);
    $("#deleteRecordAlert").modal("hide");
  }

  EmptyRecordAlert() {
    let self = this;
    $("#SaveEmptyRecordAlert").modal();
  }

  addRowsToGrid(args) {  //args is empty here..
    let magsJson = JSON.parse(localStorage.getItem(USER_DETAILS)).resources;
    this.magazineOptionsForAddPopup = magsJson.map(m => ({ id: m.resourceName, name: m.resourceName + "- " + m.description }));
    this.magCode = [];
    this.year = [];
    this.campaign = 0;
    this.campaignOptionForAddPopup = [];
    this.segmentOptionModel = [];
    this.segmentOption = [];
    this.insertBatchRows["listOfDMFlashBudgetData"] = [];
    this.bindAddDmBudgetGrid();
    this.disableSaveOnPopup = true;
    this.disableSegmentDDL = true;
    this.disableCampaignDDLOnAddPopup = true;
    this.disableYearDDLOnAddPopup = true;
    this.disableAddOnPopUp = true;

    $("#addRowsToGrid").modal();
  }

  addItemtoJson() {
    for (let i = 0; i < this.segmentOptionModel.length; i++) {
      let listOfDMFlashBudgetData: any;
      listOfDMFlashBudgetData = {
        averageTerm: null,
        averageTermRfct: null,
        averageValue: null,
        averageValueRfct: null,
        campaignId: this.campaign,
        campaignName: this.campaignOptionForAddPopup.find(o => o.id == this.campaign).name,
        currentStatus: "ADDED",
        flashBudgetId: null,
        grossSubs: null,
        grossSubsRfct: null,
        magCode: this.magCode[0],
        magazine: this.magazineOptionsForAddPopup.find(o => o.id == this.magCode[0]).name,
        mailDate: null,
        mailVolume: null,
        mailVolumeRfct: null,
        netSubs: null,
        netSubsRfct: null,
        segment: this.segmentOption.find(o => o.id == this.segmentOptionModel[i]).name,
        segmentId: this.segmentOption.find(o => o.id == this.segmentOptionModel[i]).id,
        year: this.year[0],
        updatedBy: this.currentUserName
      };
      var isDuplicateRecord = this.insertBatchRows["listOfDMFlashBudgetData"].some(function (el) {
        return el.magazine == listOfDMFlashBudgetData.magazine &&
          el.campaignId == listOfDMFlashBudgetData.campaignId &&
          el.segmentId == listOfDMFlashBudgetData.segmentId
      });
      if (!isDuplicateRecord) {
        this.insertBatchRows["listOfDMFlashBudgetData"].push(listOfDMFlashBudgetData);
      }

      //   $("#dm-budget-add-grid").jsGrid("refresh");
      this.bindAddDmBudgetGrid()
    }
    this.disableSaveOnPopup = this.insertBatchRows["listOfDMFlashBudgetData"].length == 0;
  }

  bindAddDmBudgetGrid(): void {
    let dmbudgetsFromUI = this.insertBatchRows["listOfDMFlashBudgetData"];
    let self = this;
    $("#dm-budget-add-grid").jsGrid({
      width: "100%",
      height: $("#addRowsToGrid").height() * 0.6 + "px",
      editing: false,
      confirmDeleting: false,
      fields: [
        { name: "magazine", type: "string", title: "Magazine", width: 15 },
        { name: "campaignName", type: "string", title: "Campaign Name", width: 30 },
        { name: "segment", type: "string", title: "Segment", width: 20 },
        {
          name: "Control", type: "control", width: 5, title: "Actions",
          itemTemplate: function (value, item) {
            var $result = $([]);
            $result = $result.add(this._createDeleteButton(item));
            return $result;
          }
        }
      ],
      autoload: true,
      noDataContent: "No Records",
      controller: {
        loadData: function (filter) {
          let result = $.grep(dmbudgetsFromUI, function (item) {
            return true;
          });
          return result;
        }
      },

      onItemDeleted: function (rowItem) {
        // Remove from JSON
        let index = self.insertBatchRows["listOfDMFlashBudgetData"].findIndex(function (el) {
          return el.magazine == rowItem.item.magazine &&
            el.campaignId == rowItem.item.campaignId &&
            el.segmentId == rowItem.item.segmentId
        });
        if (index >= 0) {
          self.insertBatchRows["listOfDMFlashBudgetData"].splice(index, 1);
          // Disable Save button if all records from json got removed.
          self.disableSaveOnPopup = self.insertBatchRows["listOfDMFlashBudgetData"].length == 0;
        }
        // Remove dropdown selection 
        let segmentIndex = self.segmentOptionModel.indexOf(rowItem.item.segmentId);
        self.segmentOptionModel.splice(segmentIndex, 1);
      },
    });
  }

  InsertintoDB() {
    let insertBatchRows = this.insertBatchRows;

    let insert_action = {
      type: DM_BUDGET_INSERT_ROW,
      payload: {
        url: DM_BUDGET_INSERT_ROW_URL,
        insertDataLst: insertBatchRows
      }
    }
    this.addMode = true;
    this.stateService.dispatch(insert_action);
  }

  refreshParentGridOnNewRecordCreation() {
    var dmBudgets = this.insertBatchRows["listOfDMFlashBudgetData"];
    this.insertBatchRows["listOfDMFlashBudgetData"] = [];
    $("#addRowsToGrid").modal('toggle');
    this.disableAddOnPopUp = true;
    this.disableSaveOnPopup = true;
    this.addMode = true;
    var magsAdded = [];
    var yearsAdded = [];
    var campaignsAdded = [];
    Object.keys(dmBudgets).forEach(function (key) {
      //get the value of name
      var magazine = dmBudgets[key]["magCode"];
      var year = dmBudgets[key]["year"];
      var campaign = dmBudgets[key]["campaignId"];
      //push the name string in the array
      magsAdded.push(magazine);
      yearsAdded.push(year);
      campaignsAdded.push(campaign);
    });
    if (this.magOptionsModel && this.magOptionsModel.length > 0) {
      magsAdded.forEach(magAdded => {
        if (!this.magOptionsModel.find(mag => mag == magAdded)) {
          this.magOptionsModel.push(magAdded);
        }
        this.onMagSelectionChange();
      });
    }
    if (this.yearOptionsModel && this.yearOptionsModel.length > 0) {
      yearsAdded.forEach(yearAdded => {
        if (!this.yearOptionsModel.find(year => year == yearAdded)) {
          this.yearOptionsModel.push(yearAdded);
        }
        this.onYearSelectionChange();
      });
    }
    if (this.campaignOptionsModel && this.campaignOptionsModel.length > 0) {
      campaignsAdded.forEach(camp => {
        if (!this.campaignOptionsModel.find(campaign => campaign == camp)) {
          this.campaignOptionsModel.push(camp);
        }
      });
    }

    this.filterGrid();

    //reset all the variables.. DEV
    this.updateBatchRows["listOfDMFlashBudgetData"] = [];
    this.batchEdit = false;
    this.gridTouched = false;
  }

  exportGrid() {

    $("#dm-budget-grid").jsGrid("updateItem", "batch");

    let gridData = $("#dm-budget-grid").jsGrid("option", "data");

    // console.log(gridData);

    gridData = gridData.map(data => ({
      "Magazine": data.magazine,
      "Campaign Name": data.campaignName,
      "Mail Date": data.mailDate ? data.mailDate.substring(0, 10) : data.mailDate,
      "Segment": data.segment,
      "Mail Volume": data.mailVolume,
      "Gross Subs": data.grossSubs,
      "Net Subs": data.netSubs,
      "Average Term": data.averageTerm,
      "Average Value": data.averageValue,
      "Mail Volume Reforcasted": data.mailVolumeRfct,
      "Gross Subs Reforcasted": data.grossSubsRfct,
      "Net Subs Reforcasted": data.netSubsRfct,
      "Average Term Reforcasted": data.averageTermRfct,
      "Average Value Reforcasted": data.averageValueRfct
    }))

    this.excelService.exportAsExcelFile(gridData, "DMBudget");
  }

  formatNumber(numericValue): string {
    let formatNumber = numericValue;

    if (!isNaN(parseInt(formatNumber))) {
      formatNumber = Math.trunc(parseInt(formatNumber));
    }

    if (formatNumber != null && formatNumber != undefined) {
      let parts = formatNumber.toString()
      parts = parts.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatNumber = parts;
    }
    return formatNumber;
  }

  formatDecimalNumber(numericValue, needDecimal): string {
    if (numericValue) {
      numericValue = numericValue.toString();
      if (numericValue.match(/^\d*\.?\d*$/)) {
        let floatNumber = parseFloat(numericValue);
        let stringNumber = isNaN(floatNumber) ? '' : floatNumber.toFixed(2).toString();

        stringNumber = stringNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        numericValue = stringNumber;
        return numericValue
      }
    }

  }

  // Move this to common utility file... DEV
  createPaginationArray(totalRecords) {
    let paginationArrayLength = 0;
    let pagesArray: any = [];
    if (totalRecords) {
      if (totalRecords < 100) {
        // Pagination Array length excluding ShowAll
        paginationArrayLength = Math.ceil(totalRecords / 10); //Create array with interval of 10
      }
      else {
        paginationArrayLength = 10;
      }
      for (let i = 1; i <= paginationArrayLength; i++) {
        let n = i * 10;
        let pageObj = { id: n, name: n }
        pagesArray.push(pageObj);
      }
    }
    if (this.defaultPageSize > totalRecords) {
      this.selectedPageSize = totalRecords;
      //this.onPageSizeChange(this.selectedPageSize);
    }

    return pagesArray;
  }


  saveAll() {
    let self = this;

    $("#dm-budget-grid").jsGrid("updateItem", "batch");

    // Add different color to reforecast & history columns. Below snippet fixes last-edited-row-not-higlighting issue
    $(".reforecast-column").css("background", REFORECASTING_COLUMNS_COLOR);
    $(".history-column").css("background", HISTORY_COLUMNS_COLOR);

    //Remove the exclamatory marks as the save is clicked: Start Block
    for (let i of this.updateBatchRows["listOfDMFlashBudgetData"]) {
      i.isEdited = false;
    }
    $("#dm-budget-grid").find(".unsaved-rows").parent().parent().removeClass("unsaved-cell-row");
    $("#dm-budget-grid").find(".unsaved-rows").parent().addClass("unsaved-cell-mark");
    //Remove the exclamatory marks as the save is clicked: End Block
    
    setTimeout(function () {
      let dbBudgetUpdateRow = {
        type: DM_BUDGET_UPDATE_ROW,
        payload: {
          url: DM_BUDGET_UPDATE_ROW_URL,
          updateData: self.updateBatchRows
        }
      }
      self.stateService.dispatch(dbBudgetUpdateRow);
    }, 200)  //Timeout helps updating the array in jsgrid updateItem function..
  }
}

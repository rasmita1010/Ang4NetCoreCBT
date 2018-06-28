import { environment } from "../../environments/environment";

const APP_NAME = "Campaign Budget Tool";

const LOGIN_URL =                                   environment.BASE_URL + "/Login";
const DM_BUDGET_YEARS_BY_MAGAZINES_URL =            environment.BASE_URL + "/DMFlashBudget/GetDMFlashBudgetCampaignYears";
const DM_BUDGET_CAMPAIGNS_BY_MAGAZINEANDYEAR_URL =  environment.BASE_URL + "/DMFlashBudget/GetDMFlashBudgetCampaigns";
const DM_BUDGET_URL =                               environment.BASE_URL + "/DMFlashBudget/DMFlashBudgetDetails";
const DM_BUDGET_UPDATE_ROW_URL =                    environment.BASE_URL + "/DMFlashBudget/UpdateDMFlashBudgetDetails";
const DM_BUDGET_GETCAMPAIGNS_BY_MAGAZINEYEAR_URL =  environment.BASE_URL + "/DMFlashBudget/GetDMFlashAddPopUpCampaigns";
const DM_BUDGET_CAMPAIGNS_SEGMENTS_URL =            environment.BASE_URL + "/DMFlashBudget/GetDMFlashAddPopUpSegments";
const DM_BUDGET_INSERT_ROW_URL =                    environment.BASE_URL + "/DMFlashBudget/InsertDMFlashBudgetDetails";
const DM_BUDGET_DELETE_ROW_URL =                    environment.BASE_URL + "/DMFlashBudget/DeleteDMFlashBudgetDetails";


const USER_DETAILS = "user details";

const DM_BUDGET_DATA = "dm_budget_data";

const IDLE_TIME = 600;
const IDLE_LOGOUT_TIMER = 30;
const CURRENT_YEAR = 2018;

const HISTORY_COLUMNS_COLOR = "#CCEAF5 ";
const REFORECASTING_COLUMNS_COLOR = "#3EBFED";

const UNSAVED_DATA_ALERT_MSG = "You have unsaved changes. They will be lost if you click Continue. Click Cancel to save your modifications.";
const UNSAVED_DATA_ALERT_HEADER = "Unsaved Changes";
const CONTINUE = "Continue";
const CANCEL = "Cancel";

export {
    APP_NAME,
    USER_DETAILS,
    DM_BUDGET_DATA,
    IDLE_TIME,
    IDLE_LOGOUT_TIMER,
    LOGIN_URL,
    DM_BUDGET_URL,
    DM_BUDGET_YEARS_BY_MAGAZINES_URL,
    DM_BUDGET_CAMPAIGNS_BY_MAGAZINEANDYEAR_URL,
    DM_BUDGET_GETCAMPAIGNS_BY_MAGAZINEYEAR_URL,
    DM_BUDGET_CAMPAIGNS_SEGMENTS_URL,
    DM_BUDGET_UPDATE_ROW_URL,
    CURRENT_YEAR,
    HISTORY_COLUMNS_COLOR,
    REFORECASTING_COLUMNS_COLOR,
    DM_BUDGET_DELETE_ROW_URL,
    DM_BUDGET_INSERT_ROW_URL,
    UNSAVED_DATA_ALERT_MSG,
    UNSAVED_DATA_ALERT_HEADER,
    CONTINUE,
    CANCEL
} 

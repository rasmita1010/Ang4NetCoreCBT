using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CampaignBudgetTool.API.ViewModel.DMBudget;
using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using CampaignBudgetTool.Repository.DMBudget;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Runtime.Serialization.Json;
using System.Net;
using Microsoft.Extensions.Configuration;
using CampaignBudgetTool.Utilities;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;

namespace CampaignBudgetTool.API.Controllers.DMBudget
{
    /// <summary>
    /// Controller through which user access api's of DMFlashBudget
    /// </summary>

    [Authorize]
    [Produces("application/json")]
    [Route("api/DMFlashBudget")]
    [EnableCors("CorsPolicy")]    
    public class DMFlashBudgetController : Controller
    {
        private readonly IDMFlashBudgetRepository _dmFlashRepository;
        readonly ILogger<DMFlashBudgetController> _log;

        /// <summary>
        /// DMFlashBudgetController - Constructor to initialize the Controller
        /// </summary>
        /// <param name="dmFlashRepository"></param>
        /// <param name="log"></param>
        public DMFlashBudgetController(IDMFlashBudgetRepository dmFlashRepository, ILogger<DMFlashBudgetController> log)
        {
            _dmFlashRepository = dmFlashRepository;
            _log = log;
        }

        ///<summary>
        /// GetDMFlashBudgetDetails - To get all the Flash Budget Data        
        ///</summary>        
        [HttpGet]
        [Route("DMFlashBudgetDetails/{magCode}/{campYear}/{campName}/{addMode}")]
        public JsonResult GetDMFlashBudgetDetails(string magCode, string campYear, string campName, bool addMode)
        {
            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetDetails - Start");

            DMFlashBudgetDetails data = new DMFlashBudgetDetails();
            List<DMFlashBudget> listOfData = new List<DMFlashBudget>();
            _log.LogInformation("For MagCode {0}, Year {1}, CampaignName {2} and AddMode {3} ", magCode, campYear, campName,addMode);
            listOfData = _dmFlashRepository.GetDMFlashBudgetDetails(magCode, campYear, campName,addMode);

            data.ListOfDMFlashBudgetData = (from budgetData in listOfData
                                            select new DMFlashBudgetViewModel
                                            {
                                                FlashBudgetId = budgetData.Flash_Budget_Id,
                                                CampaignId = budgetData.Campaign_Id,
                                                SegmentId = budgetData.Segment_Id,
                                                Magazine = budgetData.Mag_Name,
                                                CampaignName = budgetData.Campaign_Name,
                                                MailDate = budgetData.Mail_Date,
                                                Segment = budgetData.Segment_Name,
                                                MailVolume = budgetData.Mail_Volume,
                                                GrossSubs = budgetData.Gross_Subs,
                                                NetSubs = budgetData.Net_Subs,
                                                AverageTerm = budgetData.Average_Term,
                                                AverageValue = budgetData.Average_Value,
                                                MailVolumeRfct = budgetData.Mail_Volume_Rfct,
                                                GrossSubsRfct = budgetData.Gross_Subs_Rfct,
                                                NetSubsRfct = budgetData.Net_Subs_Rfct,
                                                AverageTermRfct = budgetData.Average_Term_Rfct,
                                                AverageValueRfct = budgetData.Average_Value_Rfct,
                                                CurrentStatus = "ORIGINAL"
                                            }).ToList();

            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetDetails - End");

            return Json(data);
        }

        /// <summary>
        /// DeleteDMFlashBudgetDetails - Method to delete a record from FlashBudget table
        /// </summary>
        /// <param name="flashBudgetId"></param>
        /// <returns></returns>       
        [HttpDelete]
        [Route("DeleteDMFlashBudgetDetails/{flashBudgetId}")]
        public JsonResult DeleteDMFlashBudgetDetails(string flashBudgetId)
        {
            _log.LogInformation("DMFlashBudgetController : DeleteDMFlashBudgetDetails - Start");

            int res = 0;
            if (!string.IsNullOrEmpty(flashBudgetId))
            {
                decimal flashId;
                Decimal.TryParse(flashBudgetId, out flashId);
                _log.LogInformation("Deleting the Flash Budget for ID {0}", flashId);
                res = _dmFlashRepository.DeleteFlashBudgetData(flashId);
            }
            _log.LogInformation("DMFlashBudgetController : DeleteDMFlashBudgetDetails - End");
            return Json(res);
        }

        /// <summary>
        /// UpdateDMFlashBudgetDetails - Method to update records in FlashBudget table
        /// </summary>
        /// <param name="dmFlashViewData"></param>
        /// <returns></returns>        
        [HttpPost]
        [Route("UpdateDMFlashBudgetDetails")]
        public JsonResult UpdateDMFlashBudgetDetails([FromBody]DMFlashBudgetDetails dmFlashViewData)
        {
            _log.LogInformation("DMFlashBudgetController : UpdateDMFlashBudgetDetails - Start");

            int res = 0;
            List<DMFlashBudgetViewModel> lstOfModifiedData = new List<DMFlashBudgetViewModel>();
            lstOfModifiedData = dmFlashViewData.ListOfDMFlashBudgetData.Where(x => x.CurrentStatus.ToString().ToUpper().Equals("MODIFIED")).ToList();
            if (lstOfModifiedData != null && lstOfModifiedData.Count() > 0)
            {
                List<TBK_Flash_Budget> listOfDMFlashBudget = new List<TBK_Flash_Budget>();
                listOfDMFlashBudget = (from budget in lstOfModifiedData
                                       select new TBK_Flash_Budget
                                       {
                                           FLASH_BUDGET_ID = budget.FlashBudgetId.Value,
                                           CAMPAIGN_ID = budget.CampaignId,
                                           SEGMENT_ID = budget.SegmentId,
                                           MAIL_VOLUME = budget.MailVolume,
                                           AVERAGE_TERM = budget.AverageTerm,
                                           AVERAGE_VALUE = budget.AverageValue,
                                           GROSS_SUBS = budget.GrossSubs,
                                           NET_SUBS = budget.NetSubs,
                                           MAIL_VOLUME_RFCT = budget.MailVolumeRfct,
                                           GROSS_SUBS_RFCT = budget.GrossSubsRfct,
                                           NET_SUBS_RFCT = budget.NetSubsRfct,
                                           AVERAGE_TERM_RFCT = budget.AverageTermRfct,
                                           AVERAGE_VALUE_RFCT = budget.AverageValueRfct,
                                           LAST_MODIFIED_DATE = DateTime.Now,
                                           LAST_MODIFIED_BY = budget.UpdatedBy
                                       }).ToList();

                res = _dmFlashRepository.UpdateFlashBudgetData(listOfDMFlashBudget);
            }
            _log.LogInformation("DMFlashBudgetController : UpdateDMFlashBudgetDetails - End");
            return Json(res);
        }

        /// <summary>
        /// InsertDMFlashBudgetDetails - Method to insert records in FlashBudget table
        /// </summary>
        /// <param name="dmFlashViewData"></param>
        /// <returns></returns>        
        [HttpPost]
        [Route("InsertDMFlashBudgetDetails")]
        public JsonResult InsertDMFlashBudgetDetails([FromBody]DMFlashBudgetDetails dmFlashViewData)
        {
            _log.LogInformation("DMFlashBudgetController : InsertDMFlashBudgetDetails - Start");

            int res = 0;
            List<DMFlashBudgetViewModel> lstOfModifiedData = new List<DMFlashBudgetViewModel>();
            lstOfModifiedData = dmFlashViewData.ListOfDMFlashBudgetData.Where(x => x.CurrentStatus.ToString().ToUpper().Equals("ADDED")).ToList();
            if (lstOfModifiedData != null && lstOfModifiedData.Count() > 0)
            {
                decimal MaxFlashBudgetId = _dmFlashRepository.GetMaxDMFlashBudgetID();

                List<TBK_Flash_Budget> listOfDMFlashBudget = new List<TBK_Flash_Budget>();
                listOfDMFlashBudget = (from budgetData in lstOfModifiedData
                                       select new TBK_Flash_Budget
                                       {
                                           CAMPAIGN_ID = budgetData.CampaignId,
                                           SEGMENT_ID = budgetData.SegmentId,
                                           MAIL_VOLUME = budgetData.MailVolume,
                                           AVERAGE_TERM = budgetData.AverageTerm,
                                           AVERAGE_VALUE = budgetData.AverageValue,
                                           GROSS_SUBS = budgetData.GrossSubs,
                                           NET_SUBS = budgetData.NetSubs,
                                           MAIL_VOLUME_RFCT = budgetData.MailVolumeRfct,
                                           GROSS_SUBS_RFCT = budgetData.GrossSubsRfct,
                                           NET_SUBS_RFCT = budgetData.NetSubsRfct,
                                           AVERAGE_TERM_RFCT = budgetData.AverageTermRfct,
                                           AVERAGE_VALUE_RFCT = budgetData.AverageValueRfct,
                                           LAST_MODIFIED_DATE = DateTime.Now,
                                           LAST_MODIFIED_BY = budgetData.UpdatedBy
                                       }).ToList();

                listOfDMFlashBudget.ForEach(x => x.FLASH_BUDGET_ID = ++MaxFlashBudgetId);

                res = _dmFlashRepository.InsertDMFlashBudgetData(listOfDMFlashBudget);
            }
            _log.LogInformation("DMFlashBudgetController : InsertDMFlashBudgetDetails - End");
            return Json(res);
        }

        /// <summary>
        /// GetDMFlashBudgetCampaignYears - Get List of Years of the Campaigns for the Magazine from the flash budget data
        /// </summary>
        /// <param name="magCode"></param>
        /// <returns></returns>        
        [HttpGet]
        [Route("GetDMFlashBudgetCampaignYears/{magCode}")]
        public JsonResult GetDMFlashBudgetCampaignYears(string magCode)
        {
            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetCampaignYears - Start");
            IEnumerable<DMFlashBudgetCampaignYears> lst;
            lst = _dmFlashRepository.GetDMFlashBudgetCampaignYears(magCode);
            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetCampaignYears - End");
            return Json(lst);
        }

        /// <summary>
        /// GetDMFlashBudgetCampaigns - Get List of Completed Campaigns for the Magazine and Year from the flash budget data
        /// </summary>
        /// <param name="magCode"></param>
        /// <param name="campYear"></param>
        /// <returns></returns>        
        [HttpGet]
        [Route("GetDMFlashBudgetCampaigns/{magCode}/{campYear}")]
        public JsonResult GetDMFlashBudgetCampaigns(string magCode, string campYear)
        {
            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetCampaigns - Start");
            IEnumerable<DMFlashBudgetCampaigns> lst;
            lst = _dmFlashRepository.GetDMFlashBudgetCampaigns(magCode, campYear);
            _log.LogInformation("DMFlashBudgetController : GetDMFlashBudgetCampaigns - End");
            return Json(lst);
        }

        /// <summary>
        /// GetDMFlashAddPopUpCampaigns - Get the list of Campaigns for Magazine and Year
        /// </summary>
        /// <param name="Mag_Code"></param>
        /// <param name="CampYear"></param>
        /// <returns></returns>        
        [HttpGet]
        [Route("GetDMFlashAddPopUpCampaigns/{Mag_Code}/{CampYear}")]
        public JsonResult GetDMFlashAddPopUpCampaigns(string Mag_Code, int CampYear)
        {
            IEnumerable<DMFlashBudgetCampaigns> lst;
            lst = _dmFlashRepository.GetDMFlashAddPopUpCampaigns(Mag_Code, CampYear);

            return Json(lst);
        }

        /// <summary>
        /// GetDMFlashAddPopUpSegments - Get the list of Segments, for the Campaign Id
        /// </summary>
        /// <param name="CampaignId"></param>
        /// <returns></returns>        
        [HttpGet]
        [Route("GetDMFlashAddPopUpSegments/{CampaignId}")]
        public JsonResult GetDMFlashAddPopUpSegments(string CampaignId)
        {
            IEnumerable<DMFlashBudgetSegments> lst;
            lst = _dmFlashRepository.GetDMFlashAddPopUpSegments(CampaignId);
            return Json(lst);
        }
    }
}
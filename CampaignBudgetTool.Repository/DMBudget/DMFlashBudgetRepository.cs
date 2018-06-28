using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using CampaignBudgetTool.Repository.Comparer;

namespace CampaignBudgetTool.Repository.DMBudget
{
    public class DMFlashBudgetRepository : IDMFlashBudgetRepository
    {
        DMContext _context;
        ILogger<DMFlashBudgetRepository> _logger;
        public DMFlashBudgetRepository(DMContext context, ILogger<DMFlashBudgetRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public List<DMFlashBudget> GetDMFlashBudgetDetails(string magCode, string campYear, string campaignId,bool addMode)
        {
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetDetails - Start");
            IQueryable<DMFlashBudget> lstDMFlashBudget;
            lstDMFlashBudget = _context.DMFlashBudgetDetails
                               .FromSql("PGK_DMCAMPAIGN_PROC_GET_FLASH_BUDGET_DETAILS {0},{1},{2},{3}", 
                               (!string.IsNullOrEmpty(magCode) && magCode.ToLower()!="null" )? magCode : null, 
                               (!string.IsNullOrEmpty(campYear) && campYear.ToLower() != "null") ? campYear : null, 
                               (!string.IsNullOrEmpty(campaignId) && campaignId.ToLower() != "null") ? campaignId : null,addMode).AsQueryable();

            List<DMFlashBudget> data = new List<DMFlashBudget>();
            data = lstDMFlashBudget.ToList();
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetDetails - End");
            return data;
        }
        public int DeleteFlashBudgetData(decimal flashBudgetId)
        {
            _logger.LogInformation("DMFlashBudgetRepository : DeleteFlashBudgetData - Start");
            int res = 0;
            var flashRecord = _context.TBK_Flash_Budget.FirstOrDefault(x => x.FLASH_BUDGET_ID == flashBudgetId);
            _context.TBK_Flash_Budget.Remove(flashRecord);
            res = _context.SaveChanges();
            _logger.LogInformation("DMFlashBudgetRepository : DeleteFlashBudgetData - End");
            return res;
        }
        public int UpdateFlashBudgetData(List<TBK_Flash_Budget> listOfDMFlashBudget)
        {
            _logger.LogInformation("DMFlashBudgetRepository : UpdateFlashBudgetData - Start");
            int res = 0;
            _context.TBK_Flash_Budget.UpdateRange(listOfDMFlashBudget);
            res = _context.SaveChanges();
            _logger.LogInformation("DMFlashBudgetRepository : UpdateFlashBudgetData - End");
            return res;
        }
        public decimal GetMaxDMFlashBudgetID()
        {
            return _context.TBK_Flash_Budget.OrderByDescending(x => x.FLASH_BUDGET_ID).FirstOrDefault().FLASH_BUDGET_ID;
        }
        public int InsertDMFlashBudgetData(List<TBK_Flash_Budget> listOfFlashBudget)
        {
            _logger.LogInformation("DMFlashBudgetRepository : InsertDMFlashBudgetData - Start");
            int res = 0;
            _context.TBK_Flash_Budget.AddRange(listOfFlashBudget);
            res = _context.SaveChanges();
            _logger.LogInformation("DMFlashBudgetRepository : InsertDMFlashBudgetData - End");
            return res;
        }
        public IEnumerable<DMFlashBudgetCampaignYears> GetDMFlashBudgetCampaignYears(string magCode)
        {
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetCampaignYears - Start");
            var yearQuery = _context.DMFlashBudgetDetails
              .FromSql("PGK_DMCAMPAIGN_PROC_GET_FLASH_BUDGET_DETAILS {0},{1},{2},{3}", (!string.IsNullOrEmpty(magCode) && magCode.ToLower() != "null") ? magCode : null, null, null,false).ToList();

            IEnumerable<DMFlashBudgetCampaignYears> listOfDmFlashBudgetCampYears;

            listOfDmFlashBudgetCampYears = (from budgetYear in yearQuery
                                            select new DMFlashBudgetCampaignYears
                                            {
                                                Campaign_Year = budgetYear.Campaign_Year,
                                                Is_Selected = false
                                            }).AsEnumerable().Distinct(new DMFlashBudgetCampaignYearsComparer());
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetCampaignYears - End");
            return listOfDmFlashBudgetCampYears;
        }
        public IEnumerable<DMFlashBudgetCampaigns> GetDMFlashBudgetCampaigns(string magCode, string campYear)
        {
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetCampaigns - Start");
            var campaignquery = _context.DMFlashBudgetDetails
              .FromSql("PGK_DMCAMPAIGN_PROC_GET_FLASH_BUDGET_DETAILS {0},{1},{2},{3}", (!string.IsNullOrEmpty(magCode) && magCode.ToLower() != "null") ? magCode : null, (!string.IsNullOrEmpty(campYear) && campYear.ToLower() != "null") ? campYear : null, null,false).ToList();

            IEnumerable<DMFlashBudgetCampaigns> listOfDmFlashBudgetCampaigns;

            listOfDmFlashBudgetCampaigns = (from budgetCampaign in campaignquery
                                            select new DMFlashBudgetCampaigns
                                            {
                                                Campaign_Id = budgetCampaign.Campaign_Id,
                                                Campaign_Name = budgetCampaign.Campaign_Name,
                                                Is_Selected = false
                                            }).AsEnumerable().Distinct(new DMFlashBudgetCampaignsComparer());
            _logger.LogInformation("DMFlashBudgetRepository : GetDMFlashBudgetCampaigns - End");
            return listOfDmFlashBudgetCampaigns;
        }
        public IEnumerable<DMFlashBudgetCampaigns> GetDMFlashAddPopUpCampaigns(string magCode, int campYear)
        {
            var campaigndetail = _context.DMFlashBudgetAddDetails
              .FromSql("PGK_DMCAMPAIGN_PROC_GET_FLASH_BUDGET_POPUPDETAILS {0},{1},{2}", magCode, campYear, "").ToList();

            IEnumerable<DMFlashBudgetCampaigns> listOfDmFlashBudgetCampaigns;

            listOfDmFlashBudgetCampaigns = (from campaign in campaigndetail
                                            select new DMFlashBudgetCampaigns
                                            {
                                                Campaign_Id = campaign.Campaign_ID,
                                                Campaign_Name = campaign.Campaign_Name,
                                                Is_Selected = false
                                            }).AsEnumerable().Distinct(new DMFlashBudgetCampaignsComparer());

            return listOfDmFlashBudgetCampaigns;
        }
        public IEnumerable<DMFlashBudgetSegments> GetDMFlashAddPopUpSegments(string campaignId)
        {
            var segmentdetail = _context.DMFlashBudgetAddDetails
              .FromSql("PGK_DMCAMPAIGN_PROC_GET_FLASH_BUDGET_POPUPDETAILS {0},{1},{2}", "", "", campaignId).ToList();

            IEnumerable<DMFlashBudgetSegments> listOfDmFlashBudgetSegments;

            listOfDmFlashBudgetSegments = (from  segment in segmentdetail
                                           select new DMFlashBudgetSegments
                                           {
                                               Segment_Id = segment.Segment_Id,
                                               SegmentName = segment.Segment_Name,
                                               Is_Selected = false

                                           }).AsEnumerable().Distinct(new DMFlashBudgetSegmentsComparer());

            return listOfDmFlashBudgetSegments;
        }
    }
}

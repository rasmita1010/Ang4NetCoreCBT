using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace CampaignBudgetTool.Repository.DMBudget
{
    public interface IDMFlashBudgetRepository
    {
        List<DMFlashBudget> GetDMFlashBudgetDetails(string magCode, string campYear, string campaignId,bool addMode);
        int DeleteFlashBudgetData(decimal flashBudgetId);
        int UpdateFlashBudgetData(List<TBK_Flash_Budget> listOfDMFlashBudget);
        int InsertDMFlashBudgetData(List<TBK_Flash_Budget> listOfFlashBudget);
        decimal GetMaxDMFlashBudgetID();
        IEnumerable<DMFlashBudgetCampaignYears> GetDMFlashBudgetCampaignYears(string magCode);
        IEnumerable<DMFlashBudgetCampaigns> GetDMFlashBudgetCampaigns(string magCode, string campYear);
        IEnumerable<DMFlashBudgetCampaigns> GetDMFlashAddPopUpCampaigns(string magCode, int campYear);
        IEnumerable<DMFlashBudgetSegments> GetDMFlashAddPopUpSegments(string campaignId);
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities
{
    public class DMFlashBudgetCampaigns
    {
        public decimal Campaign_Id { get; set; }
        public string Campaign_Name { get; set; }
        public bool Is_Selected { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CampaignBudgetTool.API.ViewModel.DMBudget
{
    public class DMFlashBudgetViewModel
    {
        [Key]
        public decimal? FlashBudgetId { get; set; }
        public decimal CampaignId { get; set; }
        public decimal SegmentId { get; set; }
        public string Magazine { get; set; }
        public string CampaignName { get; set; }
        public DateTime? MailDate { get; set; }
        public string Segment { get; set; }
        public decimal? MailVolume { get; set; }
        public decimal? GrossSubs { get; set; }
        public decimal? NetSubs { get; set; }
        public decimal? AverageTerm { get; set; }
        public decimal? AverageValue { get; set; }
        public decimal? MailVolumeRfct { get; set; }
        public decimal? GrossSubsRfct { get; set; }
        public decimal? NetSubsRfct { get; set; }
        public decimal? AverageTermRfct { get; set; }
        public decimal? AverageValueRfct { get; set; }
        public string CurrentStatus { get; set; }
        public string UpdatedBy { get; set; }  
    }

    public class DMFlashBudgetDetails
    {
        public List<DMFlashBudgetViewModel> ListOfDMFlashBudgetData { get; set; }

    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities
{
    public class TBK_Flash_Budget
    {
        [Key]
        public decimal FLASH_BUDGET_ID { get; set; }
        public decimal CAMPAIGN_ID { get; set; }
        public decimal? MAIL_VOLUME { get; set; }
        public decimal? SEGMENT_ID { get; set; }
        public decimal? GROSS_SUBS { get; set; }
        public decimal? GROSS_ORDERS { get; set; }
        public decimal? GROSS_RENEW_SUBS { get; set; }
        public decimal? NET_SUBS { get; set; }
        public decimal? AVERAGE_TERM { get; set; }
        public decimal? AVERAGE_VALUE { get; set; }
        public decimal? GROSS_SUBS_RFCT { get; set; }
        public decimal? NET_SUBS_RFCT { get; set; }
        public decimal? AVERAGE_TERM_RFCT { get; set; }
        public decimal? AVERAGE_VALUE_RFCT { get; set; }
        public decimal? MAIL_VOLUME_RFCT { get; set; }
        public decimal? GROSS_ORDERS_RFCT { get; set; }
        public decimal? GROSS_RENEW_SUBS_RFCT { get; set; }
        public DateTime? LAST_MODIFIED_DATE { get; set; }
        public string LAST_MODIFIED_BY { get; set; }
    }
}

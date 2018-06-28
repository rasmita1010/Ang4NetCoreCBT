using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities
{
    public class DMFlashBudget
    {
        [Key]
        public decimal Flash_Budget_Id { get; set; }
        public decimal Campaign_Id { get; set; }
        public decimal Segment_Id { get; set; }
        public string Mag_Code { get; set; }
        public string Mag_Name { get; set; }
        public int? Campaign_Year { get; set; }
        public DateTime Mail_Date_Formatted { get; set; }
        public DateTime Mail_Date { get; set; }     
        public string Campaign_Name { get; set; }      
        public string Segment_Name { get; set; }
        public decimal? Mail_Volume { get; set; }
        public decimal? Gross_Subs { get; set; }
        public decimal? Net_Subs { get; set; }
        public decimal? Average_Term { get; set; }
        public decimal? Average_Value { get; set; }
        public decimal? Mail_Volume_Rfct { get; set; }
        public decimal? Gross_Subs_Rfct { get; set; }
        public decimal? Net_Subs_Rfct { get; set; }
        public decimal? Average_Term_Rfct { get; set; }
        public decimal? Average_Value_Rfct { get; set; }
    }
}

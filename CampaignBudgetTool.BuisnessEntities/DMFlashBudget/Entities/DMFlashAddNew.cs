using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities
{
    public class DMFlashAddNew
    {        
        public decimal Campaign_ID { get; set; }
        public string Campaign_Name { get; set; }
        //public int Campaign_Year { get; set; }
        public string Mag_Code { get; set; }
        public string Mag_Name { get; set; }
        [Key]
        public decimal Segment_Id { get; set; }
        public string Segment_Name { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities
{
    public class DMFlashBudgetSegments
    {
        public decimal? Segment_Id { get; set; }
        public string SegmentName { get; set; }
        public bool Is_Selected { get; set; }
    }
}

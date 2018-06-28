using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.Repository.Comparer
{
    // for removing duplicate records from the result
    public class DMFlashBudgetCampaignYearsComparer : IEqualityComparer<DMFlashBudgetCampaignYears>
    {
        // Items are equal if their ids are equal.
        public bool Equals(DMFlashBudgetCampaignYears x, DMFlashBudgetCampaignYears y)
        {

            // Check whether the compared objects reference the same data.
            if (Object.ReferenceEquals(x, y)) return true;

            // Check whether any of the compared objects is null.
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
                return false;

            //Check whether the items properties are equal.
            return x.Campaign_Year == y.Campaign_Year;
        }

        // If Equals() returns true for a pair of objects 
        // then GetHashCode() must return the same value for these objects.

        public int GetHashCode(DMFlashBudgetCampaignYears campaignYears)
        {
            //Check whether the object is null
            if (Object.ReferenceEquals(campaignYears, null)) return 0;

            //Get hash code for the ID field.
            int hashCampaignYear = campaignYears.Campaign_Year.GetHashCode();

            return hashCampaignYear;
        }
    }
}

using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.Repository.Comparer
{
    // for removing duplicate records from the result
    public class DMFlashBudgetMagazinesComparer : IEqualityComparer<DMFlashBudgetMagazines>
    {
        // Items are equal if their ids are equal.
        public bool Equals(DMFlashBudgetMagazines x, DMFlashBudgetMagazines y)
        {

            // Check whether the compared objects reference the same data.
            if (Object.ReferenceEquals(x, y)) return true;

            // Check whether any of the compared objects is null.
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
                return false;

            //Check whether the items properties are equal.
            return x.Mag_Code == y.Mag_Code;
        }

        // If Equals() returns true for a pair of objects 
        // then GetHashCode() must return the same value for these objects.

        public int GetHashCode(DMFlashBudgetMagazines magazines)
        {
            //Check whether the object is null
            if (Object.ReferenceEquals(magazines, null)) return 0;

            //Get hash code for the ID field.
            int hashMagazines = magazines.Mag_Code.GetHashCode();

            return hashMagazines;
        }
    }

}

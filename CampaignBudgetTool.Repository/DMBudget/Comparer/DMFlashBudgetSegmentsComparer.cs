using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.Repository.Comparer
{
    public class DMFlashBudgetSegmentsComparer : IEqualityComparer<DMFlashBudgetSegments>
    {
        // Items are equal if their ids are equal.
        public bool Equals(DMFlashBudgetSegments x, DMFlashBudgetSegments y)
        {

            // Check whether the compared objects reference the same data.
            if (Object.ReferenceEquals(x, y)) return true;

            // Check whether any of the compared objects is null.
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
                return false;

            //Check whether the items properties are equal.
            return x.Segment_Id == y.Segment_Id;
        }

        // If Equals() returns true for a pair of objects 
        // then GetHashCode() must return the same value for these objects.

        public int GetHashCode(DMFlashBudgetSegments segments)
        {
            //Check whether the object is null
            if (Object.ReferenceEquals(segments, null)) return 0;

            //Get hash code for the ID field.
            int hashSegmentId = segments.Segment_Id.GetHashCode();

            return hashSegmentId;
        }
    }
}

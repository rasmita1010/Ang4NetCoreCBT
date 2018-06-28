using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.Login
{
    public class UserDetails
    {
        public string Company { get; set; }
        public string Department { get; set; }
        public string DisplayName { get; set; }
        public string EMailAddress { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public List<string> roles { get; set; }
        public string token { get; set; }
        public string username { get; set; }
        public List<Resources> resources { get; set; }
    }
}

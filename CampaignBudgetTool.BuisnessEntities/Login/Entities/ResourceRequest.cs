using System;
using System.Collections.Generic;
using System.Text;

namespace CampaignBudgetTool.BuisnessEntities.Login
{
    /// <summary>
    /// Request class for sending parameters to ADB Admin
    /// </summary>
    public class ResourceRequest
    {
        /// <summary>
        /// Name of the application
        /// </summary>
        public string applicationName { get; set; }
        /// <summary>
        /// User name for whom resources are requested
        /// </summary>
        public string userName { get; set; }
        /// <summary>
        /// Type of resource
        /// </summary>
        public string resourceType { get; set; }
    }
}

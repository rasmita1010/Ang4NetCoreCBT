namespace CampaignBudgetTool.BuisnessEntities.Login
{
    /// <summary>
    /// Class for holding resources from ADB based on user access
    /// </summary>
    public class Resources
    {
        /// <summary>
        /// Account details
        /// </summary>
        public object Account { get; set; }
        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Permissions
        /// </summary>
        public object Permission { get; set; }
        /// <summary>
        /// ResourceName
        /// </summary>
        public string ResourceName { get; set; }
        /// <summary>
        /// Resource Type
        /// </summary>
        public string ResourceType { get; set; }
        /// <summary>
        /// Source
        /// </summary>
        public object Source { get; set; }
    }
}

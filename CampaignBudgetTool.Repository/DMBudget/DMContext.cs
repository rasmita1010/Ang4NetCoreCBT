using System;
using System.Collections.Generic;
using System.Text;
using CampaignBudgetTool.BuisnessEntities.DMFlashBudget.Entities;
using Microsoft.EntityFrameworkCore;

namespace CampaignBudgetTool.Repository.DMBudget
{
    public class DMContext : DbContext
    {
        public DMContext(DbContextOptions<DMContext> options) : base(options)
        {
        }
        public DbSet<DMFlashBudget> DMFlashBudgetDetails { get; set; }
        public DbSet<TBK_Flash_Budget> TBK_Flash_Budget { get; set; }
        public DbSet<DMFlashAddNew> DMFlashBudgetAddDetails { get; set; }
    }
}

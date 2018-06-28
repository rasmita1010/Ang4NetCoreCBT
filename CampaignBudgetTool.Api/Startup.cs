using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc.Core;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using EncryptDecryptUtility;
using CampaignBudgetTool.Utilities.DBConnectionUtility;
using CampaignBudgetTool.Utilities.ExceptionUtility;
using CampaignBudgetTool.Repository.DMBudget;
using Swashbuckle.AspNetCore.Swagger;
using Serilog.Extensions.Logging.File;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace CampaignBudgetTool.API
{
    /// <summary>
    /// This class is called in runtime to load all the Configurations, Dependency Injection etc.
    /// </summary>
    public class Startup
    {
        /// <summary>
        /// This method gets called by the runtime. Use this method to load Configuration
        /// </summary>
        /// <param name="environment"></param>
        public Startup(IHostingEnvironment environment)
        {         
          var builder = new ConfigurationBuilder()
          .SetBasePath(environment.ContentRootPath)
          .AddJsonFile("appsettings.json",
                                  optional: true, reloadOnChange: true)
           .AddJsonFile($"appsettings.{environment.EnvironmentName}.json",
                                  optional: true, reloadOnChange: true);         

            Configuration = builder.Build();
        }

        /// <summary>
        /// Holds Configuration object
        /// </summary>
        public IConfiguration Configuration { get; }


        /// <summary>
        /// This method gets called by the runtime. Use this method to add services to the container.
        /// </summary>
        /// <param name="services"></param>
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.AddOptions();

            // Add framework services.
            services.AddMvc(
                config =>
                {
                    config.Filters.Add(typeof(GlobalExceptionHandler));
                }
            );
            services.AddMvc();

            services.AddSingleton<IConfiguration>(Configuration);

            //To get Direct Mail Connection String
            ConnectionUtility dmConnectionUtility = new ConnectionUtility(Configuration, true);
            string directMailConnectionString = dmConnectionUtility.DBSQLConnectionString;

            //To get Insert Card Connection String
            ConnectionUtility icConnectionUtility = new ConnectionUtility(Configuration, false);
            string insertCardConnectionString = icConnectionUtility.DBSQLConnectionString;

            services.AddDbContext<DMContext>(options => options.UseSqlServer(directMailConnectionString));

            //services.AddScoped<IDMFlashBudgetRepository, DMFlashBudgetRepository>();            

            // swagger support
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = "Campaign Budget Tool API", Version = "v1" });
                c.IncludeXmlComments(GetXmlCommentsPath());
            });

            var key = Encoding.ASCII.GetBytes(Configuration.GetSection("Jwt").GetSection("Key").Value);
            var signingKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key);

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
           .AddJwtBearer(x =>
           {
               x.RequireHttpsMetadata = false;
               x.SaveToken = true;
               x.TokenValidationParameters = new TokenValidationParameters
               {
                   ValidateIssuerSigningKey = true,
                   IssuerSigningKey = signingKey,
                   ValidateIssuer = false,
                   ValidateAudience = false,
                   RequireExpirationTime = false,
                   ValidateLifetime = false
               };
           });

        }

        /// <summary>
        /// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        /// </summary>
        /// <param name="applicationBuilder"></param>
        /// <param name="environment"></param>
        /// <param name="loggerFactory"></param>
        public void Configure(IApplicationBuilder applicationBuilder, IHostingEnvironment environment ,ILoggerFactory loggerFactory)
        {
            applicationBuilder.UseCors("CorsPolicy");

            applicationBuilder.UseAuthentication();

            //To enable Disable Custom Error Page in Dev environment
            if (environment.IsDevelopment())
            {
                applicationBuilder.UseDeveloperExceptionPage();
            }
            else
            {
                applicationBuilder.UseExceptionHandler();
            }
            
            applicationBuilder.UseStaticFiles();
            applicationBuilder.UseMvc();
           
            //Configuring to use Swagger
            applicationBuilder.UseSwagger();
            applicationBuilder.UseSwaggerUI(c => { c.SwaggerEndpoint(Configuration.GetSection("ApplicationSettings").GetSection("SwaggerURL").Value, Configuration.GetSection("ApplicationSettings").GetSection("SwaggerDescription").Value); });

            //Configuring File Logging 
            loggerFactory.AddFile(Configuration.GetSection("ApplicationSettings").GetSection("LogFilePath").Value);
        }

        private string GetXmlCommentsPath()
        {
            var app = PlatformServices.Default.Application;
            return System.IO.Path.Combine(app.ApplicationBasePath, "CampaignBudgetTool.Api.xml");
        }
    }
}

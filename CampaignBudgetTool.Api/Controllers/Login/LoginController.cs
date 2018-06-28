using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using CampaignBudgetTool.BuisnessEntities.Login;
using CampaignBudgetTool.Repository.Login;
using CampaignBudgetTool.Utilities.ExceptionUtility;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Cors;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;

namespace CampaignBudgetTool.API.Controllers.Login
{
    /// <summary>
    /// Controller through which user logs in using ADB service
    /// </summary>

    [Route("api/[controller]")]
    [EnableCors("CorsPolicy")]
    public class LoginController : Controller
    {
        private IConfiguration _configuration = null;
        private readonly ILogger<LoginController> _log;

        /// <summary>
        /// Constructor to initalize the Login Controller
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="log"></param>
        public LoginController(IConfiguration configuration, ILogger<LoginController> log)
        {
            _configuration = configuration;
            _log = log;
        }

        /// <summary>
        /// GetUserDetail - To get the logged in UserDetail by passing userName
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <param name="application"></param>
        /// <param name="isEncrypted"></param>    // should be false if testing from swagger
        /// <returns></returns>
        [HttpPost]
        public UserDetails GetUserDetail(string userName, string password, string application,bool isEncrypted)
        {
            UserDetails userDetail;
            _log.LogInformation("LoginController : GetUserDetail - Start");

            #region Create LoginRequest object
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.username = userName;

            if(isEncrypted)
            {
                string SecretKey = _configuration.GetSection("ApplicationSettings").GetSection("SecretKey").Value;
                string passwrd = Base64UrlEncoder.Decode(password);
                password = passwrd.Replace(SecretKey, "");
            }

            loginRequest.password = password;
            loginRequest.application = application;
            _log.LogInformation("Login Detail - UserName{0}, Application{1}", userName, application);
            #endregion

            #region Construct ADBService URL for Login
            string loginUrl = GetADBAdminServiceURL("Login");
            _log.LogInformation("ADBAdminService Login URL is {0}", loginUrl);
            #endregion

            #region Get UserDetail by passing username and password to ADBService 
            LoginRepository repository = new LoginRepository();
            userDetail = repository.PostResult<UserDetails, LoginRequest>(loginUrl, loginRequest).Result;

            #region Validate UserDetail
            if (userDetail == null)
            {
                _log.LogCritical("User Info is null for UserName : {0}", userName);
                throw new UnauthorizedAccessException();
            }
            if (userDetail.roles == null || userDetail.roles.Count == 0)
            {
                _log.LogCritical("User Info's Roles is null for UserName : {0}", userName);
                throw new UnauthorizedAccessException();
            }
            #endregion
            #endregion

            #region Construct ADBService URL for Resources
            string resourceUrl = GetADBAdminServiceURL("GetResources");
            _log.LogInformation("ADBAdminService Resource URL is {0}", resourceUrl);
            #endregion

            #region Create ResourceRequest object
            ResourceRequest resourceRequestinput = new ResourceRequest()
            {
                applicationName = loginRequest.application,
                userName = loginRequest.username,
                resourceType = "Titles"
            };
            #endregion

            #region Get User Resource List by passing Resource request to ADBService 
            LoginRepository resourceRepository = new LoginRepository();
            userDetail.resources = resourceRepository.PostResult<List<Resources>, ResourceRequest>(resourceUrl, resourceRequestinput).Result;
            #endregion

            #region Building Token and assigning it to UserDetail
            userDetail.token = BuildToken(userName);
            #endregion

            _log.LogInformation("LoginController : GetUserDetail - End");
            return userDetail;
        }

        private string GetADBAdminServiceURL(string methodName)
        {
            return string.Concat(_configuration.GetSection("ApplicationSettings").GetSection("ADBServiceURL").Value, methodName);
        }

        private string BuildToken(string userName)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration.GetSection("Jwt").GetSection("Key").Value);
            var signingKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userName)
                }),
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
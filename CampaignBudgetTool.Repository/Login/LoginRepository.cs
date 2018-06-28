using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Formatting;
using System.Threading;
using System.Threading.Tasks;
using CampaignBudgetTool.BuisnessEntities.Login;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;

namespace CampaignBudgetTool.Repository.Login
{
    public class LoginRepository
    {
        private const string contentType = "application/json";
        HttpClient httpClient = new HttpClient();

        public async Task<TypeResult> PostResult<TypeResult,TypeInput>(string adbServiceUrl, TypeInput request)
        {
            string jsonResult = string.Empty;
            httpClient.BaseAddress = new Uri(adbServiceUrl);
            httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue(contentType));

            HttpContent content = GetContent(request);
            HttpResponseMessage httpResponseMessage = httpClient.PostAsync(new Uri(adbServiceUrl), content).Result;
            if (httpResponseMessage.IsSuccessStatusCode)
            {
                jsonResult = await httpResponseMessage.Content.ReadAsStringAsync();                
            }
            return JsonConvert.DeserializeObject<TypeResult>(jsonResult);
        }

        private HttpContent GetContent<T>(T request)
        {
            var jsonRequestString = JsonConvert.SerializeObject(request);
            var bytes = Encoding.UTF8.GetBytes(jsonRequestString);
            var byteContent = new ByteArrayContent(bytes);
            byteContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            return byteContent;

        }
    }
}

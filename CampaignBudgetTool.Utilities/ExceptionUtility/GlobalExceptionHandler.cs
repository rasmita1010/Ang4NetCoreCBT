using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Text;
using Microsoft.Extensions.Logging;

namespace CampaignBudgetTool.Utilities.ExceptionUtility
{
    /// <summary>
    /// This class is used for handle the custom exception in the application level.
    /// </summary>
    public class GlobalExceptionHandler : IExceptionFilter
    {
        /// <summary>
        /// This varibale used to write exception log to the file
        /// </summary>
        private static ILogger<GlobalExceptionHandler> _exceptionLog;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> exceptionlog)
        {
            _exceptionLog = exceptionlog;
        }

        public void OnException(ExceptionContext context)
        {
            HttpStatusCode statusCode = (context.Exception as WebException != null && ((HttpWebResponse)(context.Exception as WebException).Response) != null) ?
                ((HttpWebResponse)(context.Exception as WebException).Response).StatusCode
                : getErrorCode(context.Exception);
            string errorMessage = context.Exception.InnerException.Message;
            string errorCode = getErrorCode(context.Exception).ToString();
            string stackTrace = context.Exception.StackTrace;
            var innerException = JsonConvert.SerializeObject(context.Exception.InnerException);
            StackFrame[] currentFrame = new StackTrace(context.Exception, true).GetFrames();
            HttpResponse response = context.HttpContext.Response;
            response.StatusCode = (int)statusCode;
            response.ContentType = "application/json";
            var result = JsonConvert.SerializeObject(
                new
                {
                    message = GetControllerName(currentFrame),
                    isError = true,
                    errorMessage = errorMessage,
                    errorCode = (int)statusCode,
                    stackTrace = stackTrace,
                    innerException = innerException.ToString(),
                    model = string.Empty
                });
            #region Writing Exception Log to the file
            LogException(context.Exception);
            #endregion

            Console.Write(result.ToString());

            #region Writing response back to the request
            response.ContentLength = result.Length;
            response.WriteAsync(result);
            #endregion
        }

        /// <summary>
        /// Method will return the HttpStatusCode based on the exception type
        /// </summary>
        /// <param name="exception">Exception should be passed to this parameter to get the type</param>
        /// <returns></returns>
        public static HttpStatusCode getErrorCode(Exception exception)
        {

            var exceptionType = exception.GetType();

            switch (exceptionType.Name)
            {
                case "NullReferenceException":
                    return HttpStatusCode.LengthRequired;
                case "FileNotFoundException":
                    return HttpStatusCode.NotFound;
                case "OverflowException":
                    return HttpStatusCode.RequestedRangeNotSatisfiable;
                case "OutOfMemoryException":
                    return HttpStatusCode.ExpectationFailed;
                case "InvalidCastException":
                    return HttpStatusCode.PreconditionFailed;
                case "ObjectDisposedException":
                    return HttpStatusCode.Gone;
                case "UnauthorizedAccessException":
                    return HttpStatusCode.Unauthorized;
                case "NotImplementedException":
                    return HttpStatusCode.NotImplemented;
                case "NotSupportedException":
                    return HttpStatusCode.NotAcceptable;
                case "InvalidOperationException":
                    return HttpStatusCode.Unused;
                case "TimeoutException":
                    return HttpStatusCode.RequestTimeout;
                default:
                    return HttpStatusCode.InternalServerError;

            }
        }

        /// <summary>
        /// This Method will return the combination of Controller and action name where the exception occured in the application by using exception stackframe.
        /// </summary>
        /// <param name="frame">Get input as current exception stackframe</param>
        /// <returns></returns>
        public static string GetControllerName(StackFrame[] frame)
        {
            return String.Format("Error Occured in {0}.{1}", frame[11].GetMethod().DeclaringType.Name.ToString(), frame[11].GetMethod().Name.ToString());
        }

        private static void LogException(Exception ex)
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.Append("Exception : ");
            stringBuilder.Append(ex.Message);
            stringBuilder.Append("\n");
            stringBuilder.Append("InnerException : ");
            stringBuilder.Append(ex.InnerException);
            stringBuilder.Append("\n");
            stringBuilder.Append("StackTrace : ");
            stringBuilder.Append(ex.StackTrace);
            stringBuilder.Append("\n");
            stringBuilder.Append("Source : ");
            stringBuilder.Append(ex.Source);
            stringBuilder.Append("\n");
            _exceptionLog.LogCritical(stringBuilder.ToString());
        }
    }
    /// <summary>
    /// This class will allow to generate the custom exception message.
    /// </summary>
    public class CustomException : Exception
    {
        public CustomException()
        {
        }
        public CustomException(string message) : base(message)
        {
        }
        public CustomException(string message, string responseModel) : base(message)
        {

        }
        public CustomException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}

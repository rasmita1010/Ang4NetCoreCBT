using System;
using System.Collections.Generic;
using System.Text;
using EncryptDecryptUtility;
using System.Xml;
using System.IO;
using Microsoft.Extensions.Configuration;
using CampaignBudgetTool.Utilities;

namespace CampaignBudgetTool.Utilities.DBConnectionUtility
{
    public class ConnectionUtility
    {
        private string dbServerName = string.Empty;
        private string dbName = string.Empty;
        private string dbInfoFilePath = string.Empty;
        private IConfiguration _configuration;
        public string DBSQLConnectionString = string.Empty;

        public ConnectionUtility(IConfiguration configuration, bool isDMConnection)
        {
            _configuration = configuration;
            dbInfoFilePath = configuration.GetSection("ApplicationSettings").GetSection("DBInfoFilePath").Value;           
            DBSQLConnectionString = GetDBSQLConnectionString(isDMConnection);
        }

        private string GetDBSQLConnectionString(bool isDMConnection)
        {        
            string strDBInfo = string.Empty;
            string decryptedDBInfo = string.Empty;
            string currentDirPath = GetCurrentDirPath();
            string connectionParameter = string.Empty;

            using (StreamReader textReader = new StreamReader(currentDirPath))
            {
                strDBInfo = textReader.ReadToEnd();
            }

            SymmetricCryptor symmetricCryptor = new SymmetricCryptor(EncryptionAlgorithm.Rijndael);

            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.LoadXml(symmetricCryptor.DecryptFromString(strDBInfo));

            if(isDMConnection)
            {
                connectionParameter = GetDMSQLConnectionParameter();
            }
            else
            {
                connectionParameter = GetICSQLConnectionParameter();
            }

            XmlNode rootNode = xmlDocument.DocumentElement;
            XmlNode xmlNode = rootNode.SelectSingleNode(connectionParameter);

            string dbPwd = xmlNode.InnerText;

            DBSQLConnectionString = "Data Source = " + dbServerName + ";Database = " + dbName + ";UID = " + dbName + ";Password = " + dbPwd + ";";

            return DBSQLConnectionString;
        }

        private string GetDMSQLConnectionParameter()
        {
            dbServerName = _configuration.GetSection("ApplicationSettings").GetSection("DirectMailDBServer").Value;
            dbName = _configuration.GetSection("ApplicationSettings").GetSection("DirectMailDBName").Value;
            return dbServerName + "_" + dbName;
        }

        private string GetICSQLConnectionParameter()
        {
            dbServerName = _configuration.GetSection("ApplicationSettings").GetSection("InsertCardDBServer").Value;
            dbName = _configuration.GetSection("ApplicationSettings").GetSection("InsertCardDBName").Value;
            return dbServerName + "_" + dbName;
        }

        private string GetCurrentDirPath()
        {
            return Directory.GetCurrentDirectory() + dbInfoFilePath;
        }
    }
}

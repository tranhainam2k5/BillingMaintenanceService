using System;

namespace BillingMaintenanceService.Data
{
    public static class DatabaseHelper
    {
        public static string GetConnectionString(string defaultConnection)
        {
            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
            if (!string.IsNullOrEmpty(databaseUrl))
            {
                return ConvertDatabaseUrlToNpgsql(databaseUrl);
            }
            return defaultConnection;
        }

        public static string ConvertDatabaseUrlToNpgsql(string databaseUrl)
        {
            if (databaseUrl.StartsWith("postgres://") || databaseUrl.StartsWith("postgresql://"))
            {
                var uri = new Uri(databaseUrl);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo[0];
                var password = userInfo.Length > 1 ? userInfo[1] : "";
                
                // Render PostgreSQL database connection requires SSL Mode = Require and Trust Server Certificate = true
                return $"Host={uri.Host};Port={uri.Port};Database={uri.LocalPath.TrimStart('/')};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
            }
            return databaseUrl;
        }
    }
}

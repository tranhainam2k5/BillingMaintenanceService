using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace BillingMaintenanceService.Data
{
    public class BillingDbContextFactory : IDesignTimeDbContextFactory<BillingDbContext>
    {
        public BillingDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<BillingDbContext>();

            // Build configuration from appsettings.json
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var defaultConnection = configuration.GetConnectionString("DefaultConnection") 
                ?? "Host=localhost;Database=BillingDB;Username=postgres;Password=1";
            
            var connectionString = DatabaseHelper.GetConnectionString(defaultConnection);

            optionsBuilder.UseNpgsql(connectionString);

            return new BillingDbContext(optionsBuilder.Options);
        }
    }
}
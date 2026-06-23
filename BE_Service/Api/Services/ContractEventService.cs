using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using BillingMaintenanceService.Models;

namespace BillingMaintenanceService.Services
{
    public class ContractEventService
    {
        private readonly IServiceProvider _serviceProvider;

        public ContractEventService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task RaiseContractCreatedAsync(Contract contract)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
                
                var now = DateTime.UtcNow;
                var month = contract.StartDate.Month;
                var year = contract.StartDate.Year;

                // Check duplicate
                var exists = await context.Invoices.AnyAsync(i => 
                    i.ContractId == contract.Id && 
                    i.Month == month && 
                    i.Year == year);

                if (!exists)
                {
                    var invoice = new Invoice
                    {
                        UserId = contract.UserId,
                        ContractId = contract.Id,
                        Title = $"Hóa đơn tiền phòng tháng {month}/{year}",
                        Amount = contract.RoomFee + 100000, // Room fee + default service fee 100k
                        Description = $"Hóa đơn tự động khi tạo hợp đồng phòng {contract.RoomNumber}",
                        RoomFee = contract.RoomFee,
                        ElectricityFee = 0,
                        WaterFee = 0,
                        ServiceFee = 100000,
                        Month = month,
                        Year = year,
                        DueDate = contract.StartDate.AddDays(15),
                        Status = "Unpaid",
                        CreatedAt = now
                    };

                    context.Invoices.Add(invoice);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}

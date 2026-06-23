using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;
using System.Net.Http;
using System.Text.Json;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class DashboardController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public DashboardController(BillingDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            // Total Revenue (completed payments)
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Completed")
                .SumAsync(p => p.AmountPaid);

            // Total Outstanding Debt
            // Debt = Amount - sum of completed payments for each Unpaid/Overdue/Partial invoice
            var totalInvoicesAmount = await _context.Invoices
                .Where(i => i.Status == "Unpaid" || i.Status == "Overdue" || i.Status == "Partial")
                .SumAsync(i => i.Amount);

            var totalInvoicesPaid = await _context.Payments
                .Where(p => p.Status == "Completed" && (p.Invoice!.Status == "Unpaid" || p.Invoice!.Status == "Overdue" || p.Invoice!.Status == "Partial"))
                .SumAsync(p => p.AmountPaid);

            var totalOutstandingDebt = totalInvoicesAmount - totalInvoicesPaid;

            // Total Active Contracts
            var totalActiveContracts = await _context.Contracts
                .CountAsync(c => c.Status == "Active");

            // Pending Maintenance Requests
            var pendingMaintenance = await _context.MaintenanceRequests
                .CountAsync(r => r.Status == "Pending");

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOutstandingDebt = totalOutstandingDebt,
                TotalActiveContracts = totalActiveContracts,
                PendingMaintenance = pendingMaintenance
            });
        }

        [HttpGet("revenue-chart")]
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueChart()
        {
            // Get past 12 months revenue
            var now = DateTime.UtcNow;
            var startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);

            var payments = await _context.Payments
                .Where(p => p.Status == "Completed" && p.PaidAt >= startDate)
                .ToListAsync();

            var chartData = Enumerable.Range(0, 12)
                .Select(i => startDate.AddMonths(i))
                .Select(date => new
                {
                    Month = date.Month,
                    Year = date.Year,
                    Label = $"{date.Month}/{date.Year}",
                    Revenue = payments
                        .Where(p => p.PaidAt.Month == date.Month && p.PaidAt.Year == date.Year)
                        .Sum(p => p.AmountPaid)
                })
                .ToList();

            return Ok(chartData);
        }

        [HttpGet("maintenance-chart")]
        public async Task<IActionResult> GetMaintenanceChart()
        {
            var requests = await _context.MaintenanceRequests.ToListAsync();

            var pending = requests.Count(r => r.Status == "Pending");
            var inProgress = requests.Count(r => r.Status == "InProgress");
            var completed = requests.Count(r => r.Status == "Completed");

            return Ok(new
            {
                Pending = pending,
                InProgress = inProgress,
                Completed = completed
            });
        }

        [HttpGet("debt")]
        public async Task<IActionResult> GetDebtOverview()
        {
            var totalInvoicesAmount = await _context.Invoices
                .Where(i => i.Status == "Unpaid" || i.Status == "Overdue" || i.Status == "Partial")
                .SumAsync(i => i.Amount);

            var totalInvoicesPaid = await _context.Payments
                .Where(p => p.Status == "Completed" && (p.Invoice!.Status == "Unpaid" || p.Invoice!.Status == "Overdue" || p.Invoice!.Status == "Partial"))
                .SumAsync(p => p.AmountPaid);

            var totalOutstandingDebt = totalInvoicesAmount - totalInvoicesPaid;

            var uniqueStudentsWithDebt = await _context.Invoices
                .Where(i => i.Status == "Unpaid" || i.Status == "Overdue" || i.Status == "Partial")
                .Select(i => i.UserId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                TotalDebt = totalOutstandingDebt,
                Students = uniqueStudentsWithDebt
            });
        }

        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancy()
        {
            int totalRooms = 100; // default fallback
            try
            {
                var client = _httpClientFactory.CreateClient("RoomBuildingService");
                var response = await client.GetAsync("api/Rooms");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using (var doc = JsonDocument.Parse(content))
                    {
                        if (doc.RootElement.ValueKind == JsonValueKind.Array)
                        {
                            totalRooms = doc.RootElement.GetArrayLength();
                            if (totalRooms == 0) totalRooms = 100; // safety fallback
                        }
                    }
                }
            }
            catch
            {
                // Fallback if external service fails
                totalRooms = 100;
            }

            // Get number of active contracts (which represents occupied rooms)
            var occupiedRooms = await _context.Contracts
                .Where(c => c.Status == "Active")
                .Select(c => c.RoomNumber)
                .Distinct()
                .CountAsync();

            var occupancyRate = totalRooms > 0 ? (double)occupiedRooms / totalRooms * 100 : 0;

            return Ok(new
            {
                OccupiedRooms = occupiedRooms,
                TotalRooms = totalRooms,
                OccupancyRate = Math.Round(occupancyRate, 2)
            });
        }
    }
}

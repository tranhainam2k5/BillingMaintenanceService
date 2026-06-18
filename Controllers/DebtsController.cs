using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Data;
using System.Threading.Tasks;
using System.Linq;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DebtsController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public DebtsController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff,MaintenanceStaff")]
        public async Task<IActionResult> GetDebts()
        {
            var debts = await _context.Users
                .Select(u => new
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    TotalInvoiceAmount = u.Invoices.Sum(i => (decimal?)i.Amount) ?? 0,
                    TotalPaidAmount = u.Invoices.SelectMany(i => i.Payments).Sum(p => (decimal?)p.Amount) ?? 0,
                    RemainingDebt = (u.Invoices.Sum(i => (decimal?)i.Amount) ?? 0) - (u.Invoices.SelectMany(i => i.Payments).Sum(p => (decimal?)p.Amount) ?? 0),
                    UnpaidInvoices = u.Invoices
                        .Where(i => i.Status != "Paid")
                        .Select(i => new
                        {
                            i.Id,
                            i.UserId,
                            i.Title,
                            i.Amount,
                            i.Description,
                            i.DueDate,
                            i.CreatedAt,
                            i.Status
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(debts);
        }

        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Staff,MaintenanceStaff,Student")]
        public async Task<IActionResult> GetStudentDebt(int studentId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == studentId);
            if (!userExists)
            {
                return NotFound("Sinh viên không tồn tại");
            }

            var debt = await _context.Users
                .Where(u => u.Id == studentId)
                .Select(u => new
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    TotalInvoiceAmount = u.Invoices.Sum(i => (decimal?)i.Amount) ?? 0,
                    TotalPaidAmount = u.Invoices.SelectMany(i => i.Payments).Sum(p => (decimal?)p.Amount) ?? 0,
                    RemainingDebt = (u.Invoices.Sum(i => (decimal?)i.Amount) ?? 0) - (u.Invoices.SelectMany(i => i.Payments).Sum(p => (decimal?)p.Amount) ?? 0),
                    UnpaidInvoices = u.Invoices
                        .Where(i => i.Status != "Paid")
                        .Select(i => new
                        {
                            i.Id,
                            i.UserId,
                            i.Title,
                            i.Amount,
                            i.Description,
                            i.DueDate,
                            i.CreatedAt,
                            i.Status
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return Ok(debt);
        }
    }
}



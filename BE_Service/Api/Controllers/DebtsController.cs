using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;

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
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetDebtsSummary()
        {
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.RoomNumber,
                    TotalDebt = u.Invoices
                        .Where(i => i.Status == "Unpaid" || i.Status == "Overdue" || i.Status == "Partial")
                        .Sum(i => i.Amount - i.Payments.Where(p => p.Status == "Completed").Sum(p => p.AmountPaid))
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpGet("student/{id}")]
        public async Task<IActionResult> GetStudentDebts(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            if (User.IsInRole("Student") && userId != id)
            {
                return Forbid();
            }

            var invoices = await _context.Invoices
                .Include(i => i.Payments)
                .Where(i => i.UserId == id && (i.Status == "Unpaid" || i.Status == "Overdue" || i.Status == "Partial"))
                .Select(i => new
                {
                    i.Id,
                    i.Title,
                    i.Amount,
                    i.Status,
                    i.DueDate,
                    i.Month,
                    i.Year,
                    AmountPaid = i.Payments.Where(p => p.Status == "Completed").Sum(p => p.AmountPaid),
                    RemainingDebt = i.Amount - i.Payments.Where(p => p.Status == "Completed").Sum(p => p.AmountPaid)
                })
                .OrderByDescending(i => i.DueDate)
                .ToListAsync();

            return Ok(invoices);
        }
    }
}

using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;
using BillingMaintenanceService.Dtos;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public PaymentsController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _context.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i!.User)
                .OrderByDescending(p => p.PaidAt)
                .ToListAsync();
            return Ok(payments);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyPayments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var payments = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.Invoice!.UserId == userId)
                .OrderByDescending(p => p.PaidAt)
                .ToListAsync();
            return Ok(payments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentCreateDto dto)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Payments)
                .SingleOrDefaultAsync(i => i.Id == dto.InvoiceId);

            if (invoice == null)
                return NotFound(new { message = "Invoice not found" });

            // If user is Student, verify they own the invoice
            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || invoice.UserId != int.Parse(userIdClaim))
                {
                    return Forbid();
                }
            }

            var payment = new Payment
            {
                InvoiceId = dto.InvoiceId,
                AmountPaid = dto.AmountPaid,
                PaymentMethod = dto.PaymentMethod,
                TransactionReference = dto.TransactionReference,
                Status = "Completed", // Automatically succeed for this demo/exercise
                PaidAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Calculate total paid amount
            var totalPaid = invoice.Payments
                .Where(p => p.Status == "Completed")
                .Sum(p => p.AmountPaid);

            if (totalPaid >= invoice.Amount)
            {
                invoice.Status = "Paid";
            }
            else if (totalPaid > 0)
            {
                invoice.Status = "Partial";
            }
            else
            {
                invoice.Status = "Unpaid";
            }

            await _context.SaveChangesAsync();

            return Ok(payment);
        }
    }
}

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
    public class InvoicesController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public InvoicesController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int? month, [FromQuery] int? year)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            IQueryable<Invoice> query = _context.Invoices.Include(i => i.User).Include(i => i.Contract);

            if (User.IsInRole("Student"))
            {
                query = query.Where(i => i.UserId == userId);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            if (month.HasValue)
            {
                query = query.Where(i => i.Month == month.Value);
            }

            if (year.HasValue)
            {
                query = query.Where(i => i.Year == year.Value);
            }

            var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
            return Ok(invoices);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var invoice = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Contract)
                .Include(i => i.Payments)
                .SingleOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound();

            if (User.IsInRole("Student") && invoice.UserId != userId)
                return Forbid();

            return Ok(invoice);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] InvoiceCreateDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            var invoice = new Invoice
            {
                UserId = dto.UserId,
                ContractId = dto.ContractId,
                Title = dto.Title,
                Description = dto.Description,
                Amount = dto.Amount,
                ElectricityFee = dto.ElectricityFee,
                WaterFee = dto.WaterFee,
                RoomFee = dto.RoomFee,
                ServiceFee = dto.ServiceFee,
                Month = dto.Month,
                Year = dto.Year,
                DueDate = dto.DueDate.ToUniversalTime(),
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceUpdateDto dto)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
                return NotFound();

            invoice.Title = dto.Title;
            invoice.Description = dto.Description;
            invoice.Amount = dto.Amount;
            invoice.ElectricityFee = dto.ElectricityFee;
            invoice.WaterFee = dto.WaterFee;
            invoice.RoomFee = dto.RoomFee;
            invoice.ServiceFee = dto.ServiceFee;
            invoice.Month = dto.Month;
            invoice.Year = dto.Year;
            invoice.DueDate = dto.DueDate.ToUniversalTime();
            invoice.Status = dto.Status;

            await _context.SaveChangesAsync();
            return Ok(invoice);
        }

        [HttpPatch("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id, [FromBody] System.Text.Json.JsonElement body)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Payments)
                .SingleOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound();

            string paymentMethod = "Transfer";
            if (body.TryGetProperty("paymentMethod", out var pmProp))
                paymentMethod = pmProp.GetString() ?? "Transfer";

            decimal amountPaid = invoice.Amount; // default to paying full invoice
            if (body.TryGetProperty("amount", out var amtProp) && amtProp.ValueKind == System.Text.Json.JsonValueKind.Number)
                amountPaid = amtProp.GetDecimal();

            var payment = new Payment
            {
                InvoiceId = invoice.Id,
                AmountPaid = amountPaid,
                PaymentMethod = paymentMethod,
                TransactionReference = body.TryGetProperty("transactionReference", out var refProp) ? refProp.GetString() : "Group 2 Integration",
                Status = "Completed",
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

            return Ok(invoice);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
                return NotFound();

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Invoice deleted successfully" });
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Data;
using BillingMaintenanceService.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

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
        [Authorize(Roles = "Admin,Manager,Staff,MaintenanceStaff")]
        public async Task<IActionResult> GetInvoices()
        {
            var invoices = await _context.Invoices
                .Include(i => i.User)
                .ToListAsync();
            return Ok(invoices);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyInvoices()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var invoices = await _context.Invoices
                .Include(i => i.User)
                .Where(i => i.UserId == userId)
                .ToListAsync();

            return Ok(invoices);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff,MaintenanceStaff,Student")]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với mã {id}.");
            }

            return Ok(invoice);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu hóa đơn không hợp lệ.");
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest("Sinh viên không tồn tại");
            }

            var invoice = new Invoice
            {
                UserId = request.UserId,
                Title = request.Title,
                ElectricityFee = request.ElectricityFee,
                WaterFee = request.WaterFee,
                RoomFee = request.RoomFee,
                ServiceFee = request.ServiceFee,
                Amount = request.ElectricityFee + request.WaterFee + request.RoomFee + request.ServiceFee,
                Description = request.Description ?? string.Empty,
                DueDate = request.DueDate,
                CreatedAt = DateTime.UtcNow,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] UpdateInvoiceRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu cập nhật không hợp lệ.");
            }

            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với ID {id}.");
            }

            if (request.UserId.HasValue)
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId.Value);
                if (!userExists)
                {
                    return BadRequest("Sinh viên không tồn tại.");
                }
                invoice.UserId = request.UserId.Value;
            }

            invoice.Title = request.Title ?? invoice.Title;
            invoice.Description = request.Description ?? invoice.Description;
            if (request.DueDate.HasValue)
            {
                invoice.DueDate = request.DueDate.Value;
            }
            invoice.Status = request.Status ?? invoice.Status;

            if (request.ElectricityFee.HasValue) invoice.ElectricityFee = request.ElectricityFee.Value;
            if (request.WaterFee.HasValue) invoice.WaterFee = request.WaterFee.Value;
            if (request.RoomFee.HasValue) invoice.RoomFee = request.RoomFee.Value;
            if (request.ServiceFee.HasValue) invoice.ServiceFee = request.ServiceFee.Value;

            invoice.Amount = invoice.ElectricityFee + invoice.WaterFee + invoice.RoomFee + invoice.ServiceFee;

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(invoice);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với ID {id}.");
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa hóa đơn thành công." });
        }
    }

    public class CreateInvoiceRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ElectricityFee { get; set; }
        public decimal WaterFee { get; set; }
        public decimal RoomFee { get; set; }
        public decimal ServiceFee { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class UpdateInvoiceRequest
    {
        public int? UserId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? ElectricityFee { get; set; }
        public decimal? WaterFee { get; set; }
        public decimal? RoomFee { get; set; }
        public decimal? ServiceFee { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Status { get; set; }
    }
}

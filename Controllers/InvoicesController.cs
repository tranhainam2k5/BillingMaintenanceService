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
        public async Task<IActionResult> GetInvoices([FromQuery] string? keyword = null, [FromQuery] string? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var isPaged = HttpContext.Request.Query.ContainsKey("page");
            IQueryable<Invoice> query = _context.Invoices.Include(i => i.User);

            if (!string.IsNullOrEmpty(status))
            {
                var mappedStatus = status;
                if (status == "UNPAID") mappedStatus = "Pending";
                else if (status == "PAID") mappedStatus = "Paid";
                else if (status == "OVERDUE") mappedStatus = "Overdue";

                query = query.Where(i => i.Status == mappedStatus);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                var lowerKw = keyword.ToLower();
                query = query.Where(i => i.Title.ToLower().Contains(lowerKw) || (i.User != null && i.User.FullName.ToLower().Contains(lowerKw)));
            }

            if (isPaged)
            {
                var totalItems = await query.CountAsync();
                var invoicesList = await query
                    .OrderByDescending(i => i.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var mappedItems = invoicesList.Select(i => new {
                    i.Id,
                    userId = i.UserId,
                    studentId = i.UserId,
                    studentCode = i.User?.Username ?? string.Empty,
                    studentName = i.User?.FullName ?? string.Empty,
                    roomNumber = i.User?.RoomNumber ?? "—",
                    amount = i.Amount,
                    period = $"{i.Month:D2}/{i.Year}",
                    dueDate = i.DueDate,
                    paidDate = i.Status == "Paid" ? (DateTime?)i.DueDate : null,
                    status = i.Status == "Pending" ? "UNPAID" : i.Status == "Paid" ? "PAID" : i.Status.ToUpper(),
                    title = i.Title,
                    description = i.Description,
                    electricityFee = i.ElectricityFee,
                    waterFee = i.WaterFee,
                    roomFee = i.RoomFee,
                    serviceFee = i.ServiceFee
                }).ToList();

                return Ok(new { items = mappedItems, totalItems = totalItems });
            }
            else
            {
                var invoicesList = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
                return Ok(invoicesList);
            }
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyInvoices([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var isPaged = HttpContext.Request.Query.ContainsKey("page");
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var query = _context.Invoices
                .Include(i => i.User)
                .Where(i => i.UserId == userId);

            if (isPaged)
            {
                var totalItems = await query.CountAsync();
                var invoicesList = await query
                    .OrderByDescending(i => i.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var mappedItems = invoicesList.Select(i => new {
                    i.Id,
                    userId = i.UserId,
                    studentId = i.UserId,
                    studentCode = i.User?.Username ?? string.Empty,
                    studentName = i.User?.FullName ?? string.Empty,
                    roomNumber = i.User?.RoomNumber ?? "—",
                    amount = i.Amount,
                    period = $"{i.Month:D2}/{i.Year}",
                    dueDate = i.DueDate,
                    paidDate = i.Status == "Paid" ? (DateTime?)i.DueDate : null,
                    status = i.Status == "Pending" ? "UNPAID" : i.Status == "Paid" ? "PAID" : i.Status.ToUpper(),
                    title = i.Title,
                    description = i.Description,
                    electricityFee = i.ElectricityFee,
                    waterFee = i.WaterFee,
                    roomFee = i.RoomFee,
                    serviceFee = i.ServiceFee
                }).ToList();

                return Ok(new { items = mappedItems, totalItems = totalItems });
            }
            else
            {
                var invoicesList = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
                return Ok(invoicesList);
            }
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

            // Support both UserId and StudentId fields from different clients
            var targetUserId = request.UserId != 0 ? request.UserId : request.StudentId;

            var userExists = await _context.Users.AnyAsync(u => u.Id == targetUserId);
            if (!userExists)
            {
                return BadRequest("Sinh viên không tồn tại");
            }

            // Parse period if provided (e.g. "06/2026" → Month=6, Year=2026)
            int month = request.Month;
            int year = request.Year;
            if (month == 0 && !string.IsNullOrEmpty(request.Period))
            {
                var parts = request.Period.Split('/');
                if (parts.Length == 2)
                {
                    int.TryParse(parts[0], out month);
                    int.TryParse(parts[1], out year);
                }
            }
            if (month == 0) month = DateTime.UtcNow.Month;
            if (year == 0) year = DateTime.UtcNow.Year;

            // Calculate total amount
            decimal totalAmount = request.Amount != 0
                ? request.Amount
                : request.ElectricityFee + request.WaterFee + request.RoomFee + request.ServiceFee;

            var invoice = new Invoice
            {
                UserId = targetUserId,
                Title = !string.IsNullOrEmpty(request.Title) ? request.Title : $"Phiếu thu tháng {month:D2}/{year}",
                ElectricityFee = request.ElectricityFee,
                WaterFee = request.WaterFee,
                RoomFee = request.RoomFee,
                ServiceFee = request.ServiceFee,
                Amount = totalAmount,
                Description = request.Description ?? request.Note ?? string.Empty,
                DueDate = request.DueDate != default ? request.DueDate : DateTime.UtcNow.AddDays(14),
                CreatedAt = DateTime.UtcNow,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status,
                Month = month,
                Year = year
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
            if (request.Month.HasValue) invoice.Month = request.Month.Value;
            if (request.Year.HasValue) invoice.Year = request.Year.Value;

            invoice.Amount = invoice.ElectricityFee + invoice.WaterFee + invoice.RoomFee + invoice.ServiceFee;

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(invoice);
        }

        [HttpPatch("{id}/pay")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> PayInvoice(int id, [FromBody] PayInvoiceRequest? request)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với ID {id}.");
            }

            invoice.Status = "Paid";
            _context.Invoices.Update(invoice);

            var payment = new Payment
            {
                InvoiceId = id,
                Amount = invoice.Amount,
                PaymentMethod = request?.PaymentMethod ?? "Cash",
                TransactionId = string.Empty,
                PaymentDate = DateTime.UtcNow,
                Status = "Success"
            };
            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Ghi nhận thanh toán thành công.", invoiceId = id, status = "PAID" });
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
        public int StudentId { get; set; }  // Alias for UserId from Qly_ktx-main client
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;  // Format: "MM/YYYY" from admin client
        public decimal ElectricityFee { get; set; }
        public decimal WaterFee { get; set; }
        public decimal RoomFee { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal Amount { get; set; }  // Direct amount from admin client
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = "Pending";
        public int Month { get; set; }
        public int Year { get; set; }
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
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
    public class PayInvoiceRequest
    {
        public string? PaymentMethod { get; set; }
        public string? PaidDate { get; set; }
        public string? Note { get; set; }
    }
}

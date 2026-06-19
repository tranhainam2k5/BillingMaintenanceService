using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Data;
using BillingMaintenanceService.Models;
using System.Threading.Tasks;
using System;
using System.Linq;

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
        [Authorize(Roles = "Admin,Manager,Staff,MaintenanceStaff")]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i!.User)
                .ToListAsync();
            return Ok(payments);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyPayments()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var payments = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.Invoice != null && p.Invoice.UserId == userId)
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Staff,Student")]
        public async Task<IActionResult> ProcessPayment([FromBody] CreatePaymentRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu thanh toán không hợp lệ.");
            }

            var invoice = await _context.Invoices.FindAsync(request.InvoiceId);
            if (invoice == null)
            {
                return BadRequest("Hóa đơn không tồn tại");
            }

            var payment = new Payment
            {
                InvoiceId = request.InvoiceId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod ?? "Cash",
                TransactionId = request.TransactionId ?? string.Empty,
                PaymentDate = DateTime.UtcNow,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Success" : request.Status
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Calculate the total paid amount for this invoice
            var totalPaid = await _context.Payments
                .Where(p => p.InvoiceId == invoice.Id && p.Status == "Success")
                .SumAsync(p => p.Amount);

            if (totalPaid >= invoice.Amount)
            {
                invoice.Status = "Paid";
            }
            else if (totalPaid > 0)
            {
                invoice.Status = "Pending"; // Represent partial but still unpaid/pending
            }
            else
            {
                invoice.Status = "Pending";
            }

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thực hiện thanh toán thành công và cập nhật trạng thái hóa đơn.", Payment = payment });
        }

        [HttpPost("verify")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu xác minh không hợp lệ.");
            }

            var payment = await _context.Payments.FindAsync(request.PaymentId);
            if (payment == null)
            {
                return NotFound($"Không tìm thấy giao dịch thanh toán với ID {request.PaymentId}.");
            }

            payment.Status = request.IsVerified ? "Success" : "Failed";
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();

            if (payment.Status == "Success")
            {
                var invoice = await _context.Invoices.FindAsync(payment.InvoiceId);
                if (invoice != null)
                {
                    var totalPaid = await _context.Payments
                        .Where(p => p.InvoiceId == invoice.Id && p.Status == "Success")
                        .SumAsync(p => p.Amount);

                    if (totalPaid >= invoice.Amount)
                    {
                        invoice.Status = "Paid";
                        _context.Invoices.Update(invoice);
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return Ok(new
            {
                Message = "Xác minh thanh toán thành công.",
                PaymentId = payment.Id,
                Status = payment.Status,
                Remarks = request.Remarks,
                VerifiedAt = DateTime.UtcNow
            });
        }
    }

    public class CreatePaymentRequest
    {
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = "Success";
    }

    public class VerifyPaymentRequest
    {
        public int PaymentId { get; set; }
        public bool IsVerified { get; set; }
        public string Remarks { get; set; } = string.Empty;
    }
}

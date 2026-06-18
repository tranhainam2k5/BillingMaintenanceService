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
    public class ContractsController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public ContractsController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> GetContracts()
        {
            var contracts = await _context.Contracts
                .Include(c => c.User)
                .ToListAsync();
            return Ok(contracts);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyContracts()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var contracts = await _context.Contracts
                .Include(c => c.User)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return Ok(contracts);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff,Student")]
        public async Task<IActionResult> GetContract(int id)
        {
            var contract = await _context.Contracts
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null)
            {
                return NotFound($"Không tìm thấy hợp đồng với mã {id}.");
            }

            // If it is a student, make sure they only access their own contract
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty;
            if (roleClaim.ToLower() == "student")
            {
                var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || contract.UserId != userId)
                {
                    return Forbid("Bạn không có quyền truy cập hợp đồng của người khác.");
                }
            }

            return Ok(contract);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> CreateContract([FromBody] CreateContractRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu hợp đồng không hợp lệ.");
            }

            var student = await _context.Users.FindAsync(request.UserId);
            if (student == null)
            {
                return BadRequest("Sinh viên không tồn tại.");
            }

            var contract = new Contract
            {
                UserId = request.UserId,
                RoomNumber = request.RoomNumber,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                RoomFee = request.RoomFee,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status,
                CreatedAt = DateTime.UtcNow
            };

            // Update user's room number
            student.RoomNumber = request.RoomNumber;
            _context.Users.Update(student);

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> UpdateContract(int id, [FromBody] UpdateContractRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu cập nhật không hợp lệ.");
            }

            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
            {
                return NotFound($"Không tìm thấy hợp đồng với ID {id}.");
            }

            if (request.UserId.HasValue)
            {
                var student = await _context.Users.FindAsync(request.UserId.Value);
                if (student == null)
                {
                    return BadRequest("Sinh viên không tồn tại.");
                }
                contract.UserId = request.UserId.Value;
            }

            contract.RoomNumber = request.RoomNumber ?? contract.RoomNumber;
            if (request.StartDate.HasValue) contract.StartDate = request.StartDate.Value;
            if (request.EndDate.HasValue) contract.EndDate = request.EndDate.Value;
            if (request.RoomFee.HasValue) contract.RoomFee = request.RoomFee.Value;
            contract.Status = request.Status ?? contract.Status;

            // If room number updated, sync it with student
            if (!string.IsNullOrEmpty(request.RoomNumber))
            {
                var student = await _context.Users.FindAsync(contract.UserId);
                if (student != null)
                {
                    student.RoomNumber = request.RoomNumber;
                    _context.Users.Update(student);
                }
            }

            _context.Contracts.Update(contract);
            await _context.SaveChangesAsync();

            return Ok(contract);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> DeleteContract(int id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
            {
                return NotFound($"Không tìm thấy hợp đồng với ID {id}.");
            }

            _context.Contracts.Remove(contract);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa hợp đồng thành công." });
        }
    }

    public class CreateContractRequest
    {
        public int UserId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RoomFee { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class UpdateContractRequest
    {
        public int? UserId { get; set; }
        public string? RoomNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? RoomFee { get; set; }
        public string? Status { get; set; }
    }
}

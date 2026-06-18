using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Data;
using BillingMaintenanceService.Models;
using BillingMaintenanceService.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/maintenance")]
    [Authorize]
    public class MaintenanceRequestsController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;
        private readonly BillingDbContext _context;

        public MaintenanceRequestsController(IMaintenanceService maintenanceService, BillingDbContext context)
        {
            _maintenanceService = maintenanceService;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager,Staff,MaintenanceStaff")]
        public async Task<IActionResult> GetRequests()
        {
            var requests = await _maintenanceService.GetAllRequestsAsync();
            return Ok(requests);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var requests = await _maintenanceService.GetRequestsByUserIdAsync(userId);
            return Ok(requests);
        }

        [HttpPost]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateMaintenanceRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu yêu cầu sửa chữa không hợp lệ.");
            }

            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int finalUserId = request.UserId;

            if (User.IsInRole("Student"))
            {
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
                {
                    return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
                }
                finalUserId = studentId;
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == finalUserId);
            if (!userExists)
            {
                return BadRequest("Sinh viên không tồn tại");
            }

            var maintenanceRequest = new MaintenanceRequest
            {
                UserId = finalUserId,
                Title = request.Title,
                Description = request.Description ?? string.Empty,
                RoomNumber = request.RoomNumber ?? string.Empty,
                Status = "Pending",
                RepairCost = request.RepairCost,
                CreatedAt = DateTime.UtcNow,
                ResolvedAt = null
            };

            await _maintenanceService.CreateRequestAsync(maintenanceRequest);

            return CreatedAtAction(nameof(GetRequests), new { id = maintenanceRequest.Id }, maintenanceRequest);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Manager,Staff,MaintenanceStaff")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateMaintenanceStatusRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu cập nhật không hợp lệ.");
            }

            var updatedRequest = await _maintenanceService.UpdateRequestStatusAsync(id, request.Status, request.TechnicianId, request.RepairCost);
            if (updatedRequest == null)
            {
                return NotFound($"Không tìm thấy yêu cầu sửa chữa với mã {id}.");
            }

            return Ok(updatedRequest);
        }
    }

    public class CreateMaintenanceRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public decimal? RepairCost { get; set; }
    }

    public class UpdateMaintenanceStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public int? TechnicianId { get; set; }
        public decimal? RepairCost { get; set; }
    }
}

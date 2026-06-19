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
    [Route("api/maintenance-requests")]
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
        public async Task<IActionResult> GetRequests([FromQuery] string? status = null, [FromQuery] string? type = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var isPaged = HttpContext.Request.Query.ContainsKey("page");
            var requests = await _maintenanceService.GetAllRequestsAsync();
            var query = requests.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                var mappedStatus = status;
                if (status == "NEW") mappedStatus = "Pending";
                else if (status == "IN_PROGRESS") mappedStatus = "InProgress";
                else if (status == "COMPLETED") mappedStatus = "Completed";
                else if (status == "CANCELLED") mappedStatus = "Cancelled";

                query = query.Where(r => r.Status == mappedStatus);
            }

            var studentIdQuery = HttpContext.Request.Query["studentId"].ToString();
            if (!string.IsNullOrEmpty(studentIdQuery) && int.TryParse(studentIdQuery, out var studentId))
            {
                query = query.Where(r => r.UserId == studentId);
            }

            if (isPaged)
            {
                var totalItems = query.Count();
                var list = query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var mappedList = list.Select(r => new {
                    r.Id,
                    userId = r.UserId,
                    studentId = r.UserId,
                    studentName = r.User?.FullName ?? "Sinh viên",
                    studentCode = r.User?.Username ?? string.Empty,
                    title = r.Title,
                    description = r.Description,
                    roomNumber = r.RoomNumber,
                    type = "PLUMBING",
                    priority = "NORMAL",
                    assignee = r.Technician?.Name,
                    cost = r.RepairCost,
                    status = r.Status == "Pending" ? "NEW" : r.Status == "InProgress" ? "IN_PROGRESS" : r.Status.ToUpper(),
                    createdAt = r.CreatedAt,
                    resolvedAt = r.ResolvedAt
                }).ToList();

                return Ok(new { items = mappedList, totalItems = totalItems });
            }
            else
            {
                return Ok(query.OrderByDescending(r => r.CreatedAt).ToList());
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetRequestById(int id)
        {
            var request = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Include(r => r.Technician)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
            {
                return NotFound($"Không tìm thấy yêu cầu sửa chữa với mã {id}.");
            }

            var mapped = new {
                request.Id,
                userId = request.UserId,
                studentId = request.UserId,
                studentName = request.User?.FullName ?? "Sinh viên",
                studentCode = request.User?.Username ?? string.Empty,
                title = request.Title,
                description = request.Description,
                roomNumber = request.RoomNumber,
                type = "PLUMBING",
                priority = "NORMAL",
                assignee = request.Technician?.Name,
                cost = request.RepairCost,
                status = request.Status == "Pending" ? "NEW" : request.Status == "InProgress" ? "IN_PROGRESS" : request.Status.ToUpper(),
                createdAt = request.CreatedAt,
                resolvedAt = request.ResolvedAt
            };

            return Ok(mapped);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,Admin,Manager")]
        public async Task<IActionResult> GetMyRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var isPaged = HttpContext.Request.Query.ContainsKey("page");
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            var requests = await _maintenanceService.GetRequestsByUserIdAsync(userId);
            var query = requests.AsQueryable();

            if (isPaged)
            {
                var totalItems = query.Count();
                var list = query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var mappedList = list.Select(r => new {
                    r.Id,
                    userId = r.UserId,
                    studentId = r.UserId,
                    studentName = r.User?.FullName ?? "Sinh viên",
                    studentCode = r.User?.Username ?? string.Empty,
                    title = r.Title,
                    description = r.Description,
                    roomNumber = r.RoomNumber,
                    type = "PLUMBING",
                    priority = "NORMAL",
                    assignee = r.Technician?.Name,
                    cost = r.RepairCost,
                    status = r.Status == "Pending" ? "NEW" : r.Status == "InProgress" ? "IN_PROGRESS" : r.Status.ToUpper(),
                    createdAt = r.CreatedAt,
                    resolvedAt = r.ResolvedAt
                }).ToList();

                return Ok(new { items = mappedList, totalItems = totalItems });
            }
            else
            {
                return Ok(query.OrderByDescending(r => r.CreatedAt).ToList());
            }
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

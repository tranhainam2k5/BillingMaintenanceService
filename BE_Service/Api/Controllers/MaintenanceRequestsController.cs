using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;
using BillingMaintenanceService.Dtos;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/maintenance")]
    [Authorize]
    public class MaintenanceRequestsController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public MaintenanceRequestsController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            IQueryable<MaintenanceRequest> query = _context.MaintenanceRequests
                .Include(r => r.User)
                .Include(r => r.Technician);

            if (User.IsInRole("Student"))
            {
                query = query.Where(r => r.UserId == userId);
            }

            var requests = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(requests);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var request = await _context.MaintenanceRequests
                .Include(r => r.User)
                .Include(r => r.Technician)
                .SingleOrDefaultAsync(r => r.Id == id);

            if (request == null)
                return NotFound();

            if (User.IsInRole("Student") && request.UserId != userId)
                return Forbid();

            return Ok(request);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaintenanceRequestCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var request = new MaintenanceRequest
            {
                UserId = userId,
                Description = dto.Description,
                ImageUrls = "[]",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.MaintenanceRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
        }

        [HttpPost("{id}/images")]
        public async Task<IActionResult> UploadImages(int id, IFormFileCollection files)
        {
            var request = await _context.MaintenanceRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || request.UserId != int.Parse(userIdClaim))
                {
                    return Forbid();
                }
            }

            if (files == null || files.Count == 0)
                return BadRequest(new { message = "No files uploaded" });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "..", "Fe", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var imageUrlList = new System.Collections.Generic.List<string>();
            try
            {
                if (!string.IsNullOrEmpty(request.ImageUrls))
                {
                    var existing = JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(request.ImageUrls);
                    if (existing != null)
                    {
                        imageUrlList.AddRange(existing);
                    }
                }
            }
            catch
            {
                // Start fresh if invalid JSON
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var relativeUrl = "/uploads/" + fileName;
                    imageUrlList.Add(relativeUrl);
                }
            }

            request.ImageUrls = JsonSerializer.Serialize(imageUrlList);
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { imageUrls = imageUrlList });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] MaintenanceRequestUpdateStatusDto dto)
        {
            var request = await _context.MaintenanceRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            if (dto.TechnicianId.HasValue)
            {
                var technician = await _context.Technicians.FindAsync(dto.TechnicianId.Value);
                if (technician == null)
                    return BadRequest(new { message = "Technician not found" });
                request.TechnicianId = dto.TechnicianId;
            }

            request.Status = dto.Status;
            request.Notes = dto.Notes;
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(request);
        }

        [HttpGet("technicians")]
        public async Task<IActionResult> GetTechnicians()
        {
            var technicians = await _context.Technicians.ToListAsync();
            if (technicians.Count == 0)
            {
                var tech1 = new Technician { Name = "Nguyễn Văn Hùng", PhoneNumber = "0987654321", Email = "hung.nv@dorm.com", Notes = "Thợ điện, nước" };
                var tech2 = new Technician { Name = "Trần Minh Tuấn", PhoneNumber = "0912345678", Email = "tuan.tm@dorm.com", Notes = "Thợ khóa, cơ khí" };
                _context.Technicians.AddRange(tech1, tech2);
                await _context.SaveChangesAsync();
                technicians = await _context.Technicians.ToListAsync();
            }
            return Ok(technicians);
        }
    }
}

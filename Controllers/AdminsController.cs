using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    [Route("api/admins")]
    [Authorize(Roles = "Admin,Manager")]
    public class AdminsController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;

        public AdminsController(BillingDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpGet]
        public async Task<IActionResult> GetAdmins([FromQuery] string? keyword = null, [FromQuery] string? status = null, [FromQuery] string? role = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            IQueryable<User> query = _context.Users.Where(u => u.Role == "Admin" || u.Role == "Manager");

            if (!string.IsNullOrEmpty(role))
            {
                var mappedRole = role.ToLower() == "admin" ? "Admin" : "Manager";
                query = query.Where(u => u.Role == mappedRole);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                var kw = keyword.ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(kw) || u.FullName.ToLower().Contains(kw));
            }

            var totalItems = await query.CountAsync();
            var list = await query
                .OrderBy(u => u.Username)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mappedItems = list.Select(u => new {
                id = u.Id.ToString(),
                username = u.Username,
                name = u.FullName,
                role = u.Role.ToUpper(),
                status = "ACTIVE"
            }).ToList();

            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            return Ok(new {
                items = mappedItems,
                page,
                pageSize,
                totalItems,
                totalPages
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            var exists = await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (exists)
            {
                return BadRequest(new { title = "Tên đăng nhập đã tồn tại", status = 400 });
            }

            var role = request.Role?.ToUpper() == "ADMIN" ? "Admin" : "Manager";
            var newUser = new User
            {
                Username = request.Username,
                FullName = request.Name ?? string.Empty,
                Role = role,
                Email = $"{request.Username.ToLower()}@ktx.local",
                CreatedAt = DateTime.UtcNow
            };

            var defaultPassword = role == "Admin" ? "admin" : "manager";
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, defaultPassword);

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return StatusCode(201, new {
                id = newUser.Id.ToString(),
                username = newUser.Username,
                name = newUser.FullName,
                role = newUser.Role.ToUpper(),
                status = "ACTIVE"
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(string id, [FromBody] UpdateAdminRequest request)
        {
            if (request == null || !int.TryParse(id, out var userId))
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || (user.Role != "Admin" && user.Role != "Manager"))
            {
                return NotFound(new { title = "Không tìm thấy tài khoản", status = 404 });
            }

            if (!string.IsNullOrEmpty(request.Username) && request.Username.ToLower() != user.Username.ToLower())
            {
                var duplicate = await _context.Users.AnyAsync(u => u.Id != userId && u.Username.ToLower() == request.Username.ToLower());
                if (duplicate)
                {
                    return BadRequest(new { title = "Tên đăng nhập đã tồn tại", status = 400 });
                }
                user.Username = request.Username;
            }

            if (!string.IsNullOrEmpty(request.Name))
            {
                user.FullName = request.Name;
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new {
                id = user.Id.ToString(),
                username = user.Username,
                name = user.FullName,
                role = user.Role.ToUpper(),
                status = "ACTIVE"
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(string id)
        {
            if (!int.TryParse(id, out var userId))
            {
                return BadRequest("ID không hợp lệ.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || (user.Role != "Admin" && user.Role != "Manager"))
            {
                return NotFound(new { title = "Không tìm thấy tài khoản", status = 404 });
            }

            if (user.Username.ToLower() == "admin")
            {
                return BadRequest(new { title = "Không thể xóa tài khoản Quản trị viên gốc", status = 400 });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateAdminRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "MANAGER";
        public string Status { get; set; } = "ACTIVE";
    }

    public class UpdateAdminRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE";
    }
}

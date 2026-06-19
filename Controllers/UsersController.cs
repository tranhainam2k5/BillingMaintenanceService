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
using System.Net.Http;
using System.Text.Json;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class UsersController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;

        public UsersController(BillingDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            // Tự động đồng bộ sinh viên mới từ API Nhóm 2 (Contract & Student Service)
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(5);
                    var response = await httpClient.GetAsync("https://api-contract-nhom2contract-student-api.onrender.com/api/students?pageSize=200");
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        using (var doc = JsonDocument.Parse(jsonString))
                        {
                            var root = doc.RootElement;
                            if (root.TryGetProperty("items", out var itemsProp) && itemsProp.ValueKind == JsonValueKind.Array)
                            {
                                var usersChanged = false;
                                foreach (var item in itemsProp.EnumerateArray())
                                {
                                    var studentCode = item.TryGetProperty("studentCode", out var codeProp) ? codeProp.GetString() : string.Empty;
                                    var fullName = item.TryGetProperty("fullName", out var nameProp) ? nameProp.GetString() : string.Empty;
                                    var email = item.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : string.Empty;
                                    var phoneNumber = item.TryGetProperty("phoneNumber", out var phoneProp) ? phoneProp.GetString() : string.Empty;
                                    var activeRoomNumber = item.TryGetProperty("activeRoomNumber", out var roomProp) ? roomProp.GetString() : null;

                                    if (string.IsNullOrWhiteSpace(studentCode)) continue;

                                    var lowerCode = studentCode.ToLower();
                                    var exists = await _context.Users.AnyAsync(u => u.Username.ToLower() == lowerCode);
                                    if (!exists)
                                    {
                                        var newUser = new User
                                        {
                                            Username = studentCode,
                                            FullName = string.IsNullOrWhiteSpace(fullName) ? studentCode : fullName,
                                            Email = string.IsNullOrWhiteSpace(email) ? $"{studentCode}@ktx.local" : email,
                                            PhoneNumber = phoneNumber ?? string.Empty,
                                            Role = "Student",
                                            RoomNumber = activeRoomNumber,
                                            CreatedAt = DateTime.UtcNow
                                        };
                                        newUser.PasswordHash = _passwordHasher.HashPassword(newUser, "123456");
                                        _context.Users.Add(newUser);
                                        usersChanged = true;
                                    }
                                    else
                                    {
                                        // Cập nhật lại số phòng nếu có thay đổi
                                        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == lowerCode);
                                        if (existingUser != null && existingUser.RoomNumber != activeRoomNumber)
                                        {
                                            existingUser.RoomNumber = activeRoomNumber;
                                            _context.Users.Update(existingUser);
                                            usersChanged = true;
                                        }
                                    }
                                }
                                if (usersChanged)
                                {
                                    await _context.SaveChangesAsync();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Ghi log lỗi ra console và tiếp tục để tránh làm sập API nếu Service Nhóm 2 gặp lỗi mạng
                Console.WriteLine($"Error syncing students from Group 2: {ex.Message}");
            }

            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FullName,
                    u.PhoneNumber,
                    u.Role,
                    u.RoomNumber,
                    u.CreatedAt
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"Không tìm thấy tài khoản với ID {id}");
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Role,
                user.RoomNumber,
                user.CreatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Tên tài khoản và mật khẩu không được trống.");
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (usernameExists)
            {
                return BadRequest("Tên tài khoản đã tồn tại.");
            }

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email ?? string.Empty,
                FullName = request.FullName ?? string.Empty,
                PhoneNumber = request.PhoneNumber ?? string.Empty,
                Role = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role,
                RoomNumber = request.RoomNumber,
                CreatedAt = DateTime.UtcNow
            };

            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new
            {
                newUser.Id,
                newUser.Username,
                newUser.Email,
                newUser.FullName,
                newUser.PhoneNumber,
                newUser.Role,
                newUser.RoomNumber,
                newUser.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"Không tìm thấy tài khoản với ID {id}");
            }

            if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
            {
                var usernameExists = await _context.Users.AnyAsync(u => u.Id != id && u.Username.ToLower() == request.Username.ToLower());
                if (usernameExists)
                {
                    return BadRequest("Tên tài khoản đã tồn tại.");
                }
                user.Username = request.Username;
            }

            user.Email = request.Email ?? user.Email;
            user.FullName = request.FullName ?? user.FullName;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
            user.Role = request.Role ?? user.Role;
            user.RoomNumber = request.RoomNumber ?? user.RoomNumber;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Role,
                user.RoomNumber,
                user.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"Không tìm thấy tài khoản với ID {id}");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa tài khoản thành công." });
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public string? RoomNumber { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public string? RoomNumber { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly PasswordHasher<User> _passwordHasher;

        public UsersController(BillingDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetUsersAndSync()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ContractStudentService");
                var response = await client.GetAsync("api/students?pageSize=100");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using (var doc = JsonDocument.Parse(content))
                    {
                        if (doc.RootElement.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
                        {
                            bool hasNew = false;
                            foreach (var item in items.EnumerateArray())
                            {
                                var studentCode = item.GetProperty("studentCode").GetString();
                                var fullName = item.GetProperty("fullName").GetString() ?? "Unknown";
                                var email = item.TryGetProperty("email", out var eProp) ? eProp.GetString() : null;
                                var phoneNumber = item.TryGetProperty("phoneNumber", out var pProp) ? pProp.GetString() : null;
                                var activeRoomNumber = item.TryGetProperty("activeRoomNumber", out var rProp) ? rProp.GetString() : null;

                                if (string.IsNullOrEmpty(studentCode)) continue;

                                var exists = await _context.Users.AnyAsync(u => u.Username == studentCode);
                                if (!exists)
                                {
                                    var newUser = new User
                                    {
                                        Username = studentCode,
                                        Email = email ?? $"{studentCode}@example.com",
                                        FullName = fullName,
                                        PhoneNumber = phoneNumber,
                                        Role = "Student",
                                        RoomNumber = activeRoomNumber,
                                        CreatedAt = DateTime.UtcNow
                                    };
                                    newUser.PasswordHash = _passwordHasher.HashPassword(newUser, "123456");
                                    _context.Users.Add(newUser);
                                    hasNew = true;
                                }
                            }
                            if (hasNew)
                            {
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error syncing from Group 2: {ex.Message}");
            }

            var users = await _context.Users.OrderBy(u => u.Username).ToListAsync();
            return Ok(users);
        }
    }
}

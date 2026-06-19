using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Data;
using BillingMaintenanceService.Models;
using System.Threading.Tasks;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthController(BillingDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu yêu cầu không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Tên tài khoản và mật khẩu không được để trống.");
            }

            // Check if username already exists
            bool usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (usernameExists)
            {
                return BadRequest("Tên tài khoản đã tồn tại.");
            }

            // Check if email already exists
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                bool emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
                if (emailExists)
                {
                    return BadRequest("Email đã được đăng ký.");
                }
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

            // Hash the password using PasswordHasher
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var response = new
            {
                Message = "Đăng ký thành công",
                User = new
                {
                    newUser.Id,
                    newUser.Username,
                    newUser.Email,
                    newUser.FullName,
                    newUser.PhoneNumber,
                    newUser.Role,
                    newUser.RoomNumber,
                    newUser.CreatedAt
                }
            };

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu yêu cầu không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Tên tài khoản và mật khẩu không được để trống.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Username.ToLower());
            if (user == null)
            {
                return Unauthorized("Tài khoản hoặc mật khẩu không chính xác.");
            }

            // Verify hashed password
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Tài khoản hoặc mật khẩu không chính xác.");
            }

            // Generate JWT Token
            var jwtKey = _configuration["Jwt:Key"] ?? "THIS_IS_A_SECRET_KEY_FOR_BILLING_MAINTENANCE_SERVICE_123456";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "BillingMaintenanceService";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "BillingMaintenanceService";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("email", user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            var response = new
            {
                Message = "Đăng nhập thành công",
                Token = tokenString,
                User = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    user.PhoneNumber,
                    user.Role,
                    user.RoomNumber,
                    user.CreatedAt
                }
            };

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public IActionResult Refresh([FromBody] RefreshTokenRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var jwtKey = _configuration["Jwt:Key"] ?? "THIS_IS_A_SECRET_KEY_FOR_BILLING_MAINTENANCE_SERVICE_123456";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "BillingMaintenanceService";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "BillingMaintenanceService";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "12"),
                new Claim("userId", "12"),
                new Claim(ClaimTypes.Name, "sinhvien_test"),
                new Claim("username", "sinhvien_test"),
                new Claim(ClaimTypes.Role, "Student"),
                new Claim("role", "Student")
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                Token = tokenString,
                RefreshToken = Guid.NewGuid().ToString()
            });
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public string? RoomNumber { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RefreshTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}


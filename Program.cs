using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using BillingMaintenanceService.Models;
using BillingMaintenanceService.Services;
using System;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Register DbContext with PostgreSQL
var connectionString = DatabaseHelper.GetConnectionString(builder.Configuration.GetConnectionString("DefaultConnection") ?? "");
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "THIS_IS_A_SECRET_KEY_FOR_BILLING_MAINTENANCE_SERVICE_123456";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BillingMaintenanceService";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BillingMaintenanceService";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();

// Learn more about configuring Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Billing & Maintenance Service API", Version = "v1" });
    
    // Add Security Definition for JWT Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Billing & Maintenance Service API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
    try
    {
        context.Database.Migrate();

        var passwordHasher = new PasswordHasher<User>();

        // Seed Admin
        var adminUser = context.Users.FirstOrDefault(u => u.Username.ToLower() == "admin");
        if (adminUser == null)
        {
            adminUser = new User
            {
                Username = "admin",
                Email = "admin@ktx.local",
                FullName = "Quản trị viên KTX",
                PhoneNumber = "0123456789",
                Role = "Admin",
                RoomNumber = null,
                CreatedAt = DateTime.UtcNow
            };
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "admin123");
            context.Users.Add(adminUser);
        }
        else
        {
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "admin123");
            context.Users.Update(adminUser);
        }
        context.SaveChanges();

        // Seed Technicians
        if (!context.Technicians.Any())
        {
            context.Technicians.AddRange(
                new Technician { Name = "Nguyễn Văn Hùng" },
                new Technician { Name = "Trần Minh Tuấn" },
                new Technician { Name = "Lê Quốc Bảo" },
                new Technician { Name = "Phạm Văn Nam" }
            );
            context.SaveChanges();
        }

        // Seed Student
        var studentUser = context.Users.FirstOrDefault(u => u.Username.ToLower() == "student");
        if (studentUser == null)
        {
            studentUser = new User
            {
                Username = "student",
                Email = "student@ktx.local",
                FullName = "Nguyễn Văn A",
                PhoneNumber = "0987654321",
                Role = "Student",
                RoomNumber = "Room 101",
                CreatedAt = DateTime.UtcNow
            };
            studentUser.PasswordHash = passwordHasher.HashPassword(studentUser, "123456");
            context.Users.Add(studentUser);
            context.SaveChanges();
        }
        else
        {
            studentUser.PasswordHash = passwordHasher.HashPassword(studentUser, "123456");
            context.Users.Update(studentUser);
            context.SaveChanges();
        }

        // Seed default Student Invoice
        if (!context.Invoices.Any(i => i.UserId == studentUser.Id))
        {
            var invoice = new Invoice
            {
                UserId = studentUser.Id,
                Title = "Hóa đơn phòng ở & dịch vụ tháng 6/2026",
                Description = "Tiền điện nước và tiền phòng nội trú định kỳ hàng tháng.",
                ElectricityFee = 250000,
                WaterFee = 80000,
                RoomFee = 1500000,
                ServiceFee = 50000,
                Amount = 250000 + 80000 + 1500000 + 50000,
                DueDate = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                Status = "Pending"
            };
            context.Invoices.Add(invoice);
        }

        // Seed default Student Maintenance Request
        if (!context.MaintenanceRequests.Any(mr => mr.UserId == studentUser.Id))
        {
            var request = new MaintenanceRequest
            {
                UserId = studentUser.Id,
                Title = "Hỏng vòi nước nhà vệ sinh",
                Description = "Vòi nước bị rỉ nước liên tục gây lãng phí, cần kỹ thuật viên sửa chữa.",
                RoomNumber = studentUser.RoomNumber ?? "Room 101",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                ResolvedAt = null,
                RepairCost = null
            };
            context.MaintenanceRequests.Add(request);
        }

        context.SaveChanges();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred migrating or seeding the DB: {ex.Message}");
    }
}

app.Run();


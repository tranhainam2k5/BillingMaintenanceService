using BillingMaintenanceService.Models;
using BillingMaintenanceService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Hosting;
using System.Text;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Fe")
});

var configuration = builder.Configuration;

// Register JWT Service
builder.Services.AddScoped<JwtService>();
builder.Services.AddSingleton<ContractEventService>();

// Register HttpClient for RoomBuildingService integration
builder.Services.AddHttpClient("RoomBuildingService", client =>
{
    client.BaseAddress = new Uri("https://roombuildingservice-1ijx.onrender.com/");
});

// Register HttpClient for ContractStudentService (Group 2) integration
builder.Services.AddHttpClient("ContractStudentService", client =>
{
    client.BaseAddress = new Uri("https://api-contract-nhom2contract-student-api.onrender.com/");
});



// Add DB context
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

// JWT settings (add to appsettings later)
var jwtSettings = configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "ReplaceWithYourSecretKey123!";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Global auth filter (require auth by default)
builder.Services.AddControllers(config =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    config.Filters.Add(new AuthorizeFilter(policy));
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Allow anonymous on AuthController (will be annotated with [AllowAnonymous])

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register background services (implementation later)
builder.Services.AddHostedService<MonthlyInvoiceBackgroundService>();
builder.Services.AddHostedService<OverdueInvoiceBackgroundService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


// ----- DbContext -----
public class BillingDbContext : DbContext
{
    public BillingDbContext(DbContextOptions<BillingDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }
    public DbSet<Technician> Technicians { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Relationships
        modelBuilder.Entity<User>()
            .HasMany(u => u.Contracts)
            .WithOne(c => c.User)
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Invoices)
            .WithOne(i => i.User)
            .HasForeignKey(i => i.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.MaintenanceRequests)
            .WithOne(m => m.User)
            .HasForeignKey(m => m.UserId);

        modelBuilder.Entity<Contract>()
            .HasMany(c => c.Invoices)
            .WithOne(i => i.Contract)
            .HasForeignKey(i => i.ContractId);

        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.Payments)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId);

        modelBuilder.Entity<Technician>()
            .HasMany(t => t.MaintenanceRequests)
            .WithOne(m => m.Technician)
            .HasForeignKey(m => m.TechnicianId);
    }
}

// ----- Background services implementation -----
public class MonthlyInvoiceBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public MonthlyInvoiceBackgroundService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
                    var now = DateTime.UtcNow;
                    var month = now.Month;
                    var year = now.Year;

                    var activeContracts = await context.Contracts
                        .Where(c => c.Status == "Active" && c.StartDate <= now && c.EndDate >= now)
                        .ToListAsync(stoppingToken);

                    foreach (var contract in activeContracts)
                    {
                        var exists = await context.Invoices.AnyAsync(i => 
                            i.ContractId == contract.Id && 
                            i.Month == month && 
                            i.Year == year, stoppingToken);

                        if (!exists)
                        {
                            var invoice = new Invoice
                            {
                                UserId = contract.UserId,
                                ContractId = contract.Id,
                                Title = $"Hóa đơn tiền phòng tháng {month}/{year}",
                                Amount = contract.RoomFee + 100000,
                                Description = $"Hóa đơn tự động định kỳ tháng {month}/{year}",
                                RoomFee = contract.RoomFee,
                                ElectricityFee = 0,
                                WaterFee = 0,
                                ServiceFee = 100000,
                                Month = month,
                                Year = year,
                                DueDate = now.AddDays(15),
                                Status = "Unpaid",
                                CreatedAt = now
                            };
                            context.Invoices.Add(invoice);
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception)
            {
                // Ignore for background job robustness
            }

            // Run every 1 hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}

public class OverdueInvoiceBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public OverdueInvoiceBackgroundService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
                    var now = DateTime.UtcNow;

                    var unpaidInvoices = await context.Invoices
                        .Where(i => i.Status == "Unpaid" && i.DueDate < now)
                        .ToListAsync(stoppingToken);

                    foreach (var invoice in unpaidInvoices)
                    {
                        invoice.Status = "Overdue";
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception)
            {
                // Ignore for background job robustness
            }

            // Run every 1 hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}

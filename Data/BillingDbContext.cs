using BillingMaintenanceService.Models;
using Microsoft.EntityFrameworkCore;

namespace BillingMaintenanceService.Data
{
    public class BillingDbContext : DbContext
    {
        public BillingDbContext(DbContextOptions<BillingDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<Contract> Contracts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = DatabaseHelper.GetConnectionString(
                    "Host=localhost;Database=BillingDB;Username=postgres;Password=1"
                );
                optionsBuilder.UseNpgsql(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Contract>(entity =>
            {
                entity.Property(c => c.RoomFee)
                      .HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<MaintenanceRequest>(entity =>
            {
                entity.HasOne(m => m.Technician)
                      .WithMany()
                      .HasForeignKey(m => m.TechnicianId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.Property(m => m.RepairCost)
                      .HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.Property(i => i.ElectricityFee).HasColumnType("decimal(18, 2)");
                entity.Property(i => i.WaterFee).HasColumnType("decimal(18, 2)");
                entity.Property(i => i.RoomFee).HasColumnType("decimal(18, 2)");
                entity.Property(i => i.ServiceFee).HasColumnType("decimal(18, 2)");
                entity.Property(i => i.Amount).HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.Amount).HasColumnType("decimal(18, 2)");
            });
        }
    }
}
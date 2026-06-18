using System;

namespace BillingMaintenanceService.Models
{
    public class MaintenanceRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Approved, InProgress, Completed, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        public int? TechnicianId { get; set; }
        public Technician? Technician { get; set; }
        public decimal? RepairCost { get; set; }
    }
}

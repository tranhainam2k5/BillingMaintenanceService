using System;
using System.Collections.Generic;
using System.Text.Json;

namespace BillingMaintenanceService.Models
{
    public class MaintenanceRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int? TechnicianId { get; set; }
        public Technician? Technician { get; set; }
        public string Description { get; set; } = string.Empty;
        // JSON array of image URLs stored as string
        public string ImageUrls { get; set; } = "[]"; // e.g., ["/uploads/img1.jpg","/uploads/img2.jpg"]
        public string? Notes { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property for convenience
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}

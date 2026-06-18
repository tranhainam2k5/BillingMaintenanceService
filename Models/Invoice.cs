using System;
using System.Collections.Generic;

namespace BillingMaintenanceService.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Unpaid"; // Unpaid, Paid, Overdue, Cancelled

        public decimal ElectricityFee { get; set; } = 0;
        public decimal WaterFee { get; set; } = 0;
        public decimal RoomFee { get; set; } = 0;
        public decimal ServiceFee { get; set; } = 0;

        // Navigation properties
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}

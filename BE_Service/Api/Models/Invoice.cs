using System;
using System.Collections.Generic;

namespace BillingMaintenanceService.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int? ContractId { get; set; }
        public Contract? Contract { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Unpaid"; // Unpaid, Paid, Partial, Overdue
        public decimal ElectricityFee { get; set; }
        public decimal WaterFee { get; set; }
        public decimal RoomFee { get; set; }
        public decimal ServiceFee { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        // Navigation
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}

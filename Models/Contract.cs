using System;

namespace BillingMaintenanceService.Models
{
    public class Contract
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RoomFee { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired, Terminated
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

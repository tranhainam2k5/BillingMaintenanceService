using System;
using System.Collections.Generic;

namespace BillingMaintenanceService.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Transfer, etc.
        public string? TransactionReference { get; set; }
        public string Status { get; set; } = "Completed"; // Completed, Failed, Pending
    }
}

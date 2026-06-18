using System;

namespace BillingMaintenanceService.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }

        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string PaymentMethod { get; set; } = string.Empty; // Cash, BankTransfer, EWallet
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Completed, Failed
    }
}

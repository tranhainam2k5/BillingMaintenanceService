using System;
using System.ComponentModel.DataAnnotations;

namespace BillingMaintenanceService.Dtos
{
    public class ContractCreateDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public string RoomNumber { get; set; } = string.Empty;
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public decimal RoomFee { get; set; }
    }

    public class ContractUpdateDto
    {
        [Required]
        public string RoomNumber { get; set; } = string.Empty;
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public decimal RoomFee { get; set; }
        [Required]
        public string Status { get; set; } = "Active"; // Active, Completed, Cancelled
    }

    public class InvoiceCreateDto
    {
        [Required]
        public int UserId { get; set; }
        public int? ContractId { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Amount { get; set; }
        public decimal ElectricityFee { get; set; }
        public decimal WaterFee { get; set; }
        public decimal RoomFee { get; set; }
        public decimal ServiceFee { get; set; }
        [Required]
        public int Month { get; set; }
        [Required]
        public int Year { get; set; }
        [Required]
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = "Unpaid";
    }

    public class InvoiceUpdateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Amount { get; set; }
        public decimal ElectricityFee { get; set; }
        public decimal WaterFee { get; set; }
        public decimal RoomFee { get; set; }
        public decimal ServiceFee { get; set; }
        [Required]
        public int Month { get; set; }
        [Required]
        public int Year { get; set; }
        [Required]
        public DateTime DueDate { get; set; }
        [Required]
        public string Status { get; set; } = "Unpaid";
    }

    public class PaymentCreateDto
    {
        [Required]
        public int InvoiceId { get; set; }
        [Required]
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public string? TransactionReference { get; set; }
    }

    public class MaintenanceRequestCreateDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;
    }

    public class MaintenanceRequestUpdateStatusDto
    {
        [Required]
        public string Status { get; set; } = "InProgress"; // InProgress, Completed
        public string? Notes { get; set; }
        public int? TechnicianId { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace BillingMaintenanceService.Models
{
    public class Technician
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using BillingMaintenanceService.Models;

namespace BillingMaintenanceService.Services
{
    public interface IMaintenanceService
    {
        Task<IEnumerable<MaintenanceRequest>> GetAllRequestsAsync();
        Task<IEnumerable<MaintenanceRequest>> GetRequestsByUserIdAsync(int userId);
        Task<MaintenanceRequest?> GetRequestByIdAsync(int id);
        Task<MaintenanceRequest> CreateRequestAsync(MaintenanceRequest request);
        Task<MaintenanceRequest?> UpdateRequestStatusAsync(int id, string status, int? technicianId, decimal? repairCost);
        Task<IEnumerable<Technician>> GetAllTechniciansAsync();
    }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BillingMaintenanceService.Data;
using BillingMaintenanceService.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace BillingMaintenanceService.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly BillingDbContext _context;

        public MaintenanceService(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenanceRequest>> GetAllRequestsAsync()
        {
            return await _context.MaintenanceRequests
                .Include(mr => mr.User)
                .Include(mr => mr.Technician)
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenanceRequest>> GetRequestsByUserIdAsync(int userId)
        {
            return await _context.MaintenanceRequests
                .Include(mr => mr.User)
                .Include(mr => mr.Technician)
                .Where(mr => mr.UserId == userId)
                .ToListAsync();
        }

        public async Task<MaintenanceRequest?> GetRequestByIdAsync(int id)
        {
            return await _context.MaintenanceRequests
                .Include(mr => mr.User)
                .Include(mr => mr.Technician)
                .FirstOrDefaultAsync(mr => mr.Id == id);
        }

        public async Task<MaintenanceRequest> CreateRequestAsync(MaintenanceRequest request)
        {
            _context.MaintenanceRequests.Add(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<MaintenanceRequest?> UpdateRequestStatusAsync(int id, string status, int? technicianId, decimal? repairCost)
        {
            var request = await _context.MaintenanceRequests.FindAsync(id);
            if (request == null) return null;

            if (!string.IsNullOrEmpty(status))
            {
                request.Status = status;
                if (status.ToLower() == "hoàn thành" || status.ToLower() == "completed")
                {
                    request.ResolvedAt = DateTime.UtcNow;
                }
            }

            request.TechnicianId = technicianId;
            request.RepairCost = repairCost;

            _context.MaintenanceRequests.Update(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<IEnumerable<Technician>> GetAllTechniciansAsync()
        {
            return await _context.Technicians.ToListAsync();
        }
    }
}

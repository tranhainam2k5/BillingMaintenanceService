using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Services;
using System.Threading.Tasks;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/technicians")]
    [Authorize]
    public class TechniciansController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;

        public TechniciansController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTechnicians()
        {
            var technicians = await _maintenanceService.GetAllTechniciansAsync();
            return Ok(technicians);
        }
    }
}

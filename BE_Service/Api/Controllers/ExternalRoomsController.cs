using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/externalrooms")]
    [Authorize]
    public class ExternalRoomsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ExternalRoomsController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("buildings")]
        public async Task<IActionResult> GetBuildings()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("RoomBuildingService");
                var response = await client.GetAsync("api/Buildings");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }
                return StatusCode((int)response.StatusCode, new { message = "Error calling external building service" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal error connecting to external service", error = ex.Message });
            }
        }

        [HttpGet("rooms")]
        public async Task<IActionResult> GetRooms([FromQuery] string? buildingId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("RoomBuildingService");
                string path = "api/Rooms";
                if (!string.IsNullOrEmpty(buildingId))
                {
                    path += $"?buildingId={buildingId}";
                }
                
                var response = await client.GetAsync(path);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }
                return StatusCode((int)response.StatusCode, new { message = "Error calling external room service" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal error connecting to external service", error = ex.Message });
            }
        }
    }
}

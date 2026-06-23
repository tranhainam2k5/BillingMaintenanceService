using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Models;
using BillingMaintenanceService.Dtos;
using BillingMaintenanceService.Services;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContractsController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly ContractEventService _contractEventService;

        public ContractsController(BillingDbContext context, ContractEventService contractEventService)
        {
            _context = context;
            _contractEventService = contractEventService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            if (User.IsInRole("Student"))
            {
                var contracts = await _context.Contracts
                    .Include(c => c.User)
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
                return Ok(contracts);
            }
            else // Admin or Staff
            {
                var contracts = await _context.Contracts
                    .Include(c => c.User)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
                return Ok(contracts);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var contract = await _context.Contracts
                .Include(c => c.User)
                .SingleOrDefaultAsync(c => c.Id == id);

            if (contract == null)
                return NotFound();

            if (User.IsInRole("Student") && contract.UserId != userId)
                return Forbid();

            return Ok(contract);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] ContractCreateDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            var contract = new Contract
            {
                UserId = dto.UserId,
                RoomNumber = dto.RoomNumber,
                StartDate = dto.StartDate.ToUniversalTime(),
                EndDate = dto.EndDate.ToUniversalTime(),
                RoomFee = dto.RoomFee,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            // Update user's room number
            user.RoomNumber = dto.RoomNumber;

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            // Raise in-process event to generate first month's invoice
            await _contractEventService.RaiseContractCreatedAsync(contract);

            return CreatedAtAction(nameof(GetById), new { id = contract.Id }, contract);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Update(int id, [FromBody] ContractUpdateDto dto)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
                return NotFound();

            contract.RoomNumber = dto.RoomNumber;
            contract.StartDate = dto.StartDate.ToUniversalTime();
            contract.EndDate = dto.EndDate.ToUniversalTime();
            contract.RoomFee = dto.RoomFee;
            contract.Status = dto.Status;

            // Update user's room number if contract is active
            if (contract.Status == "Active")
            {
                var user = await _context.Users.FindAsync(contract.UserId);
                if (user != null)
                {
                    user.RoomNumber = contract.RoomNumber;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(contract);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Delete(int id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
                return NotFound();

            contract.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Contract cancelled successfully" });
        }
    }
}

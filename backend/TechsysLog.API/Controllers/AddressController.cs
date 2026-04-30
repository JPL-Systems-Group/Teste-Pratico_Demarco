using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechsysLog.API.Services;

namespace TechsysLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly ViaCepService _viaCepService;

    public AddressController(ViaCepService viaCepService)
    {
        _viaCepService = viaCepService;
    }

    /// <summary>Look up address data for a given CEP via ViaCEP.</summary>
    [HttpGet("{cep}")]
    [ProducesResponseType(typeof(ViaCepResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCep(string cep)
    {
        var address = await _viaCepService.GetAddressByCepAsync(cep);
        return address is null ? NotFound(new { message = "CEP not found." }) : Ok(address);
    }
}

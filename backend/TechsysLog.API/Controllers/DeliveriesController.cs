using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechsysLog.API.DTOs.Deliveries;
using TechsysLog.API.Models;
using TechsysLog.API.Services;

namespace TechsysLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeliveriesController : ControllerBase
{
    private readonly DeliveryService _deliveryService;
    private readonly NotificationService _notificationService;

    public DeliveriesController(DeliveryService deliveryService, NotificationService notificationService)
    {
        _deliveryService = deliveryService;
        _notificationService = notificationService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(DeliveryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] CreateDeliveryRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")!;

        var delivery = await _deliveryService.RegisterAsync(request, userId);

        _ = _notificationService.BroadcastEventAsync(
            NotificationType.DeliveryRegistered,
            $"Pedido #{delivery.OrderNumber} foi entregue em {delivery.DeliveredAt:dd/MM/yyyy HH:mm}.",
            delivery.OrderId);

        return CreatedAtAction(nameof(Register), delivery);
    }
}

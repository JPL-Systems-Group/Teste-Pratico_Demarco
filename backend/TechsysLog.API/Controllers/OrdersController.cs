using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechsysLog.API.DTOs.Orders;
using TechsysLog.API.Models;
using TechsysLog.API.Services;

namespace TechsysLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly NotificationService _notificationService;

    public OrdersController(OrderService orderService, NotificationService notificationService)
    {
        _orderService = orderService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<OrderResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderService.GetAllAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(id);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")!;

        var order = await _orderService.CreateAsync(request, userId);

        _ = _notificationService.BroadcastEventAsync(
            NotificationType.OrderCreated,
            $"Novo pedido #{order.OrderNumber} foi registrado.",
            order.Id);

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }
}

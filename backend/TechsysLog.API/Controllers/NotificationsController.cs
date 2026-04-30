using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechsysLog.API.DTOs.Notifications;
using TechsysLog.API.Services;

namespace TechsysLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<NotificationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")!;

        var notifications = await _notificationService.GetByUserAsync(userId);
        return Ok(notifications);
    }

    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(NotificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")!;

        var result = await _notificationService.MarkAsReadAsync(id, userId);
        return result is null ? NotFound() : Ok(result);
    }
}

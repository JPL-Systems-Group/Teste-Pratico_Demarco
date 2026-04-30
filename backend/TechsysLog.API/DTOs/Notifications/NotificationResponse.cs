using TechsysLog.API.Models;

namespace TechsysLog.API.DTOs.Notifications;

public class NotificationResponse
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public static NotificationResponse FromModel(Notification n) => new()
    {
        Id = n.Id,
        Type = n.Type.ToString(),
        Message = n.Message,
        ReferenceId = n.ReferenceId,
        IsRead = n.IsRead,
        ReadAt = n.ReadAt,
        CreatedAt = n.CreatedAt
    };
}

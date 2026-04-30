using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechsysLog.API.Models;

public enum NotificationType
{
    OrderCreated = 0,
    DeliveryRegistered = 1
}

// DECISION: One Notification document is created PER USER for each event
// (order created, delivery registered). This simplifies queries ("give me my notifications")
// at the cost of storing N copies per event (acceptable for this scale).
// An alternative would be a shared Notification + a UserNotificationRead join collection,
// which would be preferred at larger scale.
public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("type")]
    public NotificationType Type { get; set; }

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    // ReferenceId points to the Order or Delivery that triggered this notification.
    [BsonElement("referenceId")]
    public string ReferenceId { get; set; } = string.Empty;

    [BsonElement("isRead")]
    public bool IsRead { get; set; } = false;

    // ReadAt is the timestamp logged when the user opens/reads the notification.
    // This satisfies the requirement: "manter um log das notificações que já foram abertas".
    [BsonElement("readAt")]
    public DateTime? ReadAt { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

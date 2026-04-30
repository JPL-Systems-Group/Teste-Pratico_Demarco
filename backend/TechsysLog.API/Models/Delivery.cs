using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechsysLog.API.Models;

public class Delivery
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("orderId")]
    public string OrderId { get; set; } = string.Empty;

    [BsonElement("orderNumber")]
    public string OrderNumber { get; set; } = string.Empty;

    [BsonElement("deliveredAt")]
    public DateTime DeliveredAt { get; set; }

    [BsonElement("registeredBy")]
    public string RegisteredBy { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

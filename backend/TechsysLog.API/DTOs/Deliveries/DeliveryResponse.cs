using TechsysLog.API.Models;

namespace TechsysLog.API.DTOs.Deliveries;

public class DeliveryResponse
{
    public string Id { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime DeliveredAt { get; set; }
    public string RegisteredBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static DeliveryResponse FromModel(Delivery d) => new()
    {
        Id = d.Id,
        OrderId = d.OrderId,
        OrderNumber = d.OrderNumber,
        DeliveredAt = d.DeliveredAt,
        RegisteredBy = d.RegisteredBy,
        CreatedAt = d.CreatedAt
    };
}

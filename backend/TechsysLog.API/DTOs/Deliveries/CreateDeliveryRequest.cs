using System.ComponentModel.DataAnnotations;

namespace TechsysLog.API.DTOs.Deliveries;

public class CreateDeliveryRequest
{
    [Required]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    public DateTime DeliveredAt { get; set; }
}

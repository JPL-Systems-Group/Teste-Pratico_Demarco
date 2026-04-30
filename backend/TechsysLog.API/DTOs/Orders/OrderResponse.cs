using TechsysLog.API.Models;

namespace TechsysLog.API.DTOs.Orders;

public class OrderResponse
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Status { get; set; } = string.Empty;
    public AddressResponse Address { get; set; } = new();
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static OrderResponse FromModel(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        Description = order.Description,
        Value = order.Value,
        Status = order.Status.ToString(),
        Address = AddressResponse.FromModel(order.Address),
        CreatedBy = order.CreatedBy,
        CreatedAt = order.CreatedAt,
        UpdatedAt = order.UpdatedAt
    };
}

public class AddressResponse
{
    public string CEP { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;

    public static AddressResponse FromModel(Address a) => new()
    {
        CEP = a.CEP,
        Street = a.Street,
        Number = a.Number,
        Neighborhood = a.Neighborhood,
        City = a.City,
        State = a.State
    };
}

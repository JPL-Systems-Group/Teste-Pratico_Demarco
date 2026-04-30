using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechsysLog.API.Models;

// DECISION: OrderStatus is kept intentionally minimal (Pending / Delivered)
// to match the two operations described in the requirements: create order and register delivery.
// A richer state machine (e.g. InTransit, Cancelled) is reserved for future iterations.
public enum OrderStatus
{
    Pending = 0,
    Delivered = 1
}

public class Address
{
    [BsonElement("cep")]
    public string CEP { get; set; } = string.Empty;

    [BsonElement("street")]
    public string Street { get; set; } = string.Empty;

    [BsonElement("number")]
    public string Number { get; set; } = string.Empty;

    [BsonElement("neighborhood")]
    public string Neighborhood { get; set; } = string.Empty;

    [BsonElement("city")]
    public string City { get; set; } = string.Empty;

    [BsonElement("state")]
    public string State { get; set; } = string.Empty;
}

public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    // DECISION: OrderNumber is user-provided (as listed in the form fields),
    // unique across the collection (enforced via MongoDB index in MongoDbContext).
    [BsonElement("orderNumber")]
    public string OrderNumber { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("value")]
    public decimal Value { get; set; }

    [BsonElement("status")]
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [BsonElement("address")]
    public Address Address { get; set; } = new();

    // DECISION: CreatedBy stores the userId of the authenticated user who created the order.
    [BsonElement("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

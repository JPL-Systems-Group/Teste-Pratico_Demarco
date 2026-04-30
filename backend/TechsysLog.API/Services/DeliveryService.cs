using MongoDB.Driver;
using TechsysLog.API.Configuration;
using TechsysLog.API.DTOs.Deliveries;
using TechsysLog.API.Models;

namespace TechsysLog.API.Services;

public class DeliveryService
{
    private readonly MongoDbContext _db;
    private readonly OrderService _orderService;

    public DeliveryService(MongoDbContext db, OrderService orderService)
    {
        _db = db;
        _orderService = orderService;
    }

    public async Task<DeliveryResponse> RegisterAsync(CreateDeliveryRequest request, string registeredBy)
    {
        // Look up the order by its user-facing number
        var order = await _db.Orders
            .Find(o => o.OrderNumber == request.OrderNumber)
            .FirstOrDefaultAsync();

        if (order is null)
            throw new KeyNotFoundException($"Order '{request.OrderNumber}' not found.");

        if (order.Status == OrderStatus.Delivered)
            throw new InvalidOperationException($"Order '{request.OrderNumber}' is already delivered.");

        var delivery = new Delivery
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            DeliveredAt = request.DeliveredAt,
            RegisteredBy = registeredBy,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Deliveries.InsertOneAsync(delivery);

        // Transition order status to Delivered atomically after recording the delivery
        await _orderService.UpdateStatusAsync(order.Id, OrderStatus.Delivered);

        return DeliveryResponse.FromModel(delivery);
    }
}

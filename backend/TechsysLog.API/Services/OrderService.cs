using MongoDB.Driver;
using TechsysLog.API.Configuration;
using TechsysLog.API.DTOs.Orders;
using TechsysLog.API.Models;

namespace TechsysLog.API.Services;

public class OrderService
{
    private readonly MongoDbContext _db;

    public OrderService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<OrderResponse>> GetAllAsync()
    {
        var orders = await _db.Orders
            .Find(_ => true)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(OrderResponse.FromModel).ToList();
    }

    public async Task<OrderResponse?> GetByIdAsync(string id)
    {
        var order = await _db.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        return order is null ? null : OrderResponse.FromModel(order);
    }

    public async Task<OrderResponse?> GetByOrderNumberAsync(string orderNumber)
    {
        var order = await _db.Orders.Find(o => o.OrderNumber == orderNumber).FirstOrDefaultAsync();
        return order is null ? null : OrderResponse.FromModel(order);
    }

    public async Task<OrderResponse> CreateAsync(CreateOrderRequest request, string createdBy)
    {
        var order = new Order
        {
            OrderNumber = request.OrderNumber.Trim(),
            Description = request.Description.Trim(),
            Value = request.Value,
            Status = OrderStatus.Pending,
            Address = new Address
            {
                CEP = request.Address.CEP,
                Street = request.Address.Street.Trim(),
                Number = request.Address.Number.Trim(),
                Neighborhood = request.Address.Neighborhood.Trim(),
                City = request.Address.City.Trim(),
                State = request.Address.State.Trim().ToUpper()
            },
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await _db.Orders.InsertOneAsync(order);
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            throw new InvalidOperationException($"Order number '{order.OrderNumber}' already exists.");
        }

        return OrderResponse.FromModel(order);
    }

    public async Task<bool> UpdateStatusAsync(string orderId, OrderStatus status)
    {
        var update = Builders<Order>.Update
            .Set(o => o.Status, status)
            .Set(o => o.UpdatedAt, DateTime.UtcNow);

        var result = await _db.Orders.UpdateOneAsync(o => o.Id == orderId, update);
        return result.ModifiedCount > 0;
    }
}

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TechsysLog.API.Models;

namespace TechsysLog.API.Configuration;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);

        EnsureIndexes();
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("orders");
    public IMongoCollection<Delivery> Deliveries => _database.GetCollection<Delivery>("deliveries");
    public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("notifications");

    private void EnsureIndexes()
    {
        var emailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
        Users.Indexes.CreateOne(new CreateIndexModel<User>(emailIndex,
            new CreateIndexOptions { Unique = true }));

        var orderNumberIndex = Builders<Order>.IndexKeys.Ascending(o => o.OrderNumber);
        Orders.Indexes.CreateOne(new CreateIndexModel<Order>(orderNumberIndex,
            new CreateIndexOptions { Unique = true }));

        var notifIndex = Builders<Notification>.IndexKeys
            .Ascending(n => n.UserId)
            .Descending(n => n.CreatedAt);
        Notifications.Indexes.CreateOne(new CreateIndexModel<Notification>(notifIndex));
    }
}

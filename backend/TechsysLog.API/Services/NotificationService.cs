using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using TechsysLog.API.Configuration;
using TechsysLog.API.DTOs.Notifications;
using TechsysLog.API.Hubs;
using TechsysLog.API.Models;

namespace TechsysLog.API.Services;

public class NotificationService
{
    private readonly MongoDbContext _db;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(MongoDbContext db, IHubContext<NotificationHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    // Creates one notification document per registered user and broadcasts
    // to all SignalR-connected clients so the panel updates in real time.
    public async Task BroadcastEventAsync(NotificationType type, string message, string referenceId)
    {
        var users = await _db.Users.Find(_ => true).ToListAsync();

        var notifications = users.Select(u => new Notification
        {
            UserId = u.Id,
            Type = type,
            Message = message,
            ReferenceId = referenceId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        if (notifications.Count > 0)
            await _db.Notifications.InsertManyAsync(notifications);

        // Broadcast to ALL connected clients regardless of user;
        // each client will show the notification in its panel.
        // DECISION: A group-per-user strategy was considered but skipped
        // because this is an internal operations panel — all operators
        // should see all events in real time.
        await _hub.Clients.All.SendAsync("ReceiveNotification", new
        {
            type = type.ToString(),
            message,
            referenceId,
            createdAt = DateTime.UtcNow
        });
    }

    public async Task<List<NotificationResponse>> GetByUserAsync(string userId)
    {
        var notifications = await _db.Notifications
            .Find(n => n.UserId == userId)
            .SortByDescending(n => n.CreatedAt)
            .ToListAsync();

        return notifications.Select(NotificationResponse.FromModel).ToList();
    }

    public async Task<NotificationResponse?> MarkAsReadAsync(string id, string userId)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.Id, id),
            Builders<Notification>.Filter.Eq(n => n.UserId, userId)
        );

        var update = Builders<Notification>.Update
            .Set(n => n.IsRead, true)
            .Set(n => n.ReadAt, DateTime.UtcNow);

        var result = await _db.Notifications.FindOneAndUpdateAsync(
            filter, update,
            new FindOneAndUpdateOptions<Notification> { ReturnDocument = ReturnDocument.After }
        );

        return result is null ? null : NotificationResponse.FromModel(result);
    }
}

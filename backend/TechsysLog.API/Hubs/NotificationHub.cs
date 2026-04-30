using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TechsysLog.API.Hubs;

// DECISION: The hub requires authentication via JWT. The token is passed
// as a query string parameter (?access_token=...) because browsers cannot
// add Authorization headers to WebSocket upgrade requests — this is the
// official SignalR pattern for JWT over WebSockets.
[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}

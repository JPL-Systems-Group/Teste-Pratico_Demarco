# TechsysLog — Order & Delivery Control System

Full-stack application for logistics order and delivery management, built with **ASP.NET Core 8**, **MongoDB**, **Angular 17** and **SignalR**.

---

## Architecture

```
Teste-Pratico_Demarco/
├── backend/          # ASP.NET Core 8 REST API
│   └── TechsysLog.API/
│       ├── Controllers/     # Auth, Orders, Deliveries, Notifications, Address
│       ├── Models/          # MongoDB document models
│       ├── DTOs/            # Request/Response contracts
│       ├── Services/        # Business logic
│       ├── Hubs/            # SignalR NotificationHub
│       ├── Middleware/      # Global exception handler
│       └── Configuration/  # MongoDB context, settings
└── frontend/         # Angular 17 SPA
    └── src/app/
        ├── core/            # Services, guards, interceptors, models
        ├── features/        # Auth, Orders, Deliveries
        └── shared/          # Navbar with notification panel
```

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 8.x |
| MongoDB | 7.x (local) or Atlas free tier |
| Node.js | 20.x |
| Angular CLI | 17.x |

---

## Running Locally

### 1. MongoDB

**Option A — Local:**
```bash
mongod --dbpath /data/db
```

**Option B — MongoDB Atlas (recommended):**
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Copy the connection string
3. Update `backend/TechsysLog.API/appsettings.json`:
```json
"MongoDbSettings": {
  "ConnectionString": "mongodb+srv://<user>:<pass>@cluster.mongodb.net",
  "DatabaseName": "techsyslog"
}
```

### 2. Backend

```bash
cd backend
dotnet run --project TechsysLog.API
```

API runs at `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

App runs at `http://localhost:4200`

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create user account |
| POST | `/api/auth/login` | No | Authenticate, receive JWT |
| GET | `/api/orders` | JWT | List all orders |
| POST | `/api/orders` | JWT | Create new order |
| GET | `/api/orders/{id}` | JWT | Get order by ID |
| POST | `/api/deliveries` | JWT | Register delivery (updates order status) |
| GET | `/api/address/{cep}` | JWT | Look up address via ViaCEP |
| GET | `/api/notifications` | JWT | List user's notifications (log) |
| PATCH | `/api/notifications/{id}/read` | JWT | Mark notification as read |

### SignalR Hub

```
ws://localhost:5000/hubs/notifications?access_token=<JWT>
```

Client method: `ReceiveNotification(payload)`

---

## Key Design Decisions

All decisions are documented inline in the source code as `// DECISION:` comments. Summary:

| Decision | Choice | Reason |
|---|---|---|
| Order number | User-provided | Listed as a form field in the spec |
| Order status | `Pending` → `Delivered` | Only two operations defined (create / deliver) |
| Notification scope | Broadcast to all users | Internal operations panel; all operators see all events |
| Notification storage | One doc per user per event | Simplifies per-user queries at this scale |
| JWT expiration | 24 hours | Matches operator shift duration; no refresh token for simplicity |
| SignalR auth | Query string token | WebSocket upgrade requests cannot carry Authorization headers |
| Password hashing | BCrypt work factor 12 | Industry standard; protects against brute-force |
| CEP API | ViaCEP (`viacep.com.br`) | Free, no auth required, well-known in Brazil |

---

## Features

- [x] User registration and JWT login
- [x] Create orders with CEP auto-fill via ViaCEP
- [x] Register deliveries (transitions order to `Delivered`)
- [x] Real-time dashboard with SignalR (panel refreshes on new orders and deliveries)
- [x] Notification bell with unread count badge
- [x] Notification read log (persists who opened each notification and when)
- [x] Swagger UI with Bearer auth support
- [x] Global exception middleware with semantic HTTP status codes
- [x] MongoDB indexes (unique email, unique order number, compound notification index)

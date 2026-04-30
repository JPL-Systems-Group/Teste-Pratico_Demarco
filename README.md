# TechsysLog — Order & Delivery Control System

Full-stack application for logistics order and delivery management.

**Stack:** ASP.NET Core 8 · MongoDB 7 · Angular 17 · SignalR · JWT

---

## Quick Start (3 passos)

### 1. Suba o MongoDB com Docker
> Requer apenas [Docker](https://www.docker.com/products/docker-desktop) instalado.

```bash
docker compose up -d
```

Isso inicia o MongoDB na porta padrão `27017`. Nenhuma configuração adicional necessária.

### 2. Backend
```bash
cd backend
dotnet run --project TechsysLog.API
```

- API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

### 3. Frontend
```bash
cd frontend
npm install
ng serve
```

- App: `http://localhost:4200`

---

## Pré-requisitos

| Ferramenta | Versão | Obrigatório |
|---|---|---|
| [Docker](https://www.docker.com) | 20+ | Para o MongoDB |
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0) | 8.x | Backend |
| [Node.js](https://nodejs.org) | 20.x | Frontend |
| Angular CLI | 17.x (`npm install -g @angular/cli@17`) | Frontend |

---

## Estrutura do Projeto

```
Teste-Pratico_Demarco/
├── docker-compose.yml       # MongoDB local
├── backend/
│   └── TechsysLog.API/
│       ├── Controllers/     # Auth, Orders, Deliveries, Notifications, Address
│       ├── Models/          # Entidades MongoDB
│       ├── DTOs/            # Contratos de Request/Response
│       ├── Services/        # Lógica de negócio
│       ├── Hubs/            # SignalR NotificationHub
│       ├── Middleware/      # Tratamento global de exceções
│       └── Configuration/  # MongoDB context e settings
└── frontend/
    └── src/app/
        ├── core/            # Services, guards, interceptors, models
        ├── features/        # Auth, Orders, Deliveries
        └── shared/          # Navbar com painel de notificações
```

---

## API Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Não | Criar conta de usuário |
| POST | `/api/auth/login` | Não | Autenticar, receber JWT |
| GET | `/api/orders` | JWT | Listar todos os pedidos |
| POST | `/api/orders` | JWT | Criar novo pedido |
| GET | `/api/orders/{id}` | JWT | Buscar pedido por ID |
| POST | `/api/deliveries` | JWT | Registrar entrega (atualiza status do pedido) |
| GET | `/api/address/{cep}` | JWT | Buscar endereço via ViaCEP |
| GET | `/api/notifications` | JWT | Listar notificações do usuário (log) |
| PATCH | `/api/notifications/{id}/read` | JWT | Marcar notificação como lida |

### SignalR Hub

```
ws://localhost:5000/hubs/notifications?access_token=<JWT>
```

Método cliente: `ReceiveNotification(payload)`

---

## Decisões de Projeto

Todas as decisões estão documentadas inline no código como comentários `// DECISION:`. Resumo:

| Decisão | Escolha | Motivo |
|---|---|---|
| Número do pedido | Fornecido pelo usuário | Listado como campo do formulário no enunciado |
| Status do pedido | `Pending` → `Delivered` | Apenas duas operações definidas: criar e entregar |
| Escopo de notificações | Broadcast para todos os usuários | Painel operacional interno — todos os operadores veem todos os eventos |
| Armazenamento de notificações | Um documento por usuário por evento | Simplifica queries por usuário nesta escala |
| Expiração do JWT | 24 horas | Compatível com turno de trabalho; sem refresh token para manter o escopo simples |
| Auth no SignalR | Token via query string | Conexões WebSocket não suportam header Authorization no upgrade request |
| Hash de senha | BCrypt work factor 12 | Padrão da indústria contra brute-force |
| API de CEP | ViaCEP (`viacep.com.br`) | Gratuita, sem autenticação, amplamente utilizada no Brasil |

---

## Funcionalidades

- [x] Cadastro e login de usuários com JWT
- [x] Cadastro de pedidos com auto-preenchimento de endereço por CEP (ViaCEP)
- [x] Registro de entrega (transiciona pedido para `Delivered`)
- [x] Painel de pedidos em tempo real via SignalR (atualiza ao criar pedido ou entrega)
- [x] Sino de notificações com badge de não lidas
- [x] Log de notificações abertas por usuário (persiste quem abriu e quando)
- [x] Swagger UI com suporte a Bearer JWT
- [x] Middleware global de exceções com HTTP status codes semânticos
- [x] Índices MongoDB (email único, número de pedido único, índice composto de notificações)

# Go Backend for PBGui React

## Quick Start

```bash
# Install Go (1.21+)
go version

# Clone the repository (if not already)
cd backend-go

# Install dependencies
go mod tidy

# Set environment variables
export PASSIVBOT_PATH="/path/to/passivbot"
export PYTHON_PATH="python3"
export PORT="8080"

# Run the server
go run cmd/server/main.go

# Or with live reload (install air first)
go install github.com/cosmtrek/air@latest
air
```

## Environment Variables

```bash
# Required
PASSIVBOT_PATH=/path/to/passivbot    # Path to Passivbot installation
PYTHON_PATH=python3                   # Python executable path

# Optional
PORT=8080                            # Server port
DATABASE_URL=pbgui.db                # SQLite database file
REDIS_URL=redis://localhost:6379     # Redis connection
LOG_LEVEL=info                       # Logging level
ENVIRONMENT=development              # Environment mode
```

## API Endpoints

### Instance Management
- `GET /api/v1/instances` - List all instances
- `POST /api/v1/instances` - Create new instance
- `GET /api/v1/instances/:id` - Get instance details
- `PUT /api/v1/instances/:id` - Update instance
- `DELETE /api/v1/instances/:id` - Delete instance
- `POST /api/v1/instances/:id/start` - Start instance
- `POST /api/v1/instances/:id/stop` - Stop instance

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/performance` - Get performance metrics

### WebSocket Endpoints
- `WS /ws/instances/:id/logs` - Real-time log streaming
- `WS /ws/jobs/:id/progress` - Job progress updates
- `WS /ws/dashboard/metrics` - Live dashboard metrics

## Development

```bash
# Format code
go fmt ./...

# Run tests
go test ./...

# Build for production
go build -o pbgui-server cmd/server/main.go

# Cross-compile for Linux
GOOS=linux GOARCH=amd64 go build -o pbgui-server-linux cmd/server/main.go
```

## Project Structure

```
backend-go/
├── cmd/server/main.go              # Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers/               # HTTP request handlers
│   │   └── routes/                 # Route definitions
│   ├── models/                     # Data models
│   ├── services/
│   │   └── passivbot/             # Passivbot integration
│   └── websocket/                 # WebSocket handlers
├── pkg/
│   └── config/                    # Configuration management
├── go.mod                         # Go module definition
└── README.md                      # This file
```

## Deployment

### Docker
```bash
# Build image
docker build -t pbgui-backend .

# Run container
docker run -p 8080:8080 \
  -e PASSIVBOT_PATH=/opt/passivbot \
  -e PYTHON_PATH=python3 \
  pbgui-backend
```

### Systemd Service
```ini
[Unit]
Description=PBGui Backend
After=network.target

[Service]
Type=simple
User=pbgui
WorkingDirectory=/opt/pbgui
ExecStart=/opt/pbgui/pbgui-server
Environment=PASSIVBOT_PATH=/opt/passivbot
Environment=PYTHON_PATH=/opt/venv/bin/python
Restart=always

[Install]
WantedBy=multi-user.target
```

## Integration with React Frontend

Your existing React frontend will work with minimal changes:

```typescript
// Update API base URL
const API_BASE = 'http://localhost:8080/api/v1';

// WebSocket integration
const ws = new WebSocket('ws://localhost:8080/ws/instances/123/logs');
ws.onmessage = (event) => {
  console.log('New log:', event.data);
};
```

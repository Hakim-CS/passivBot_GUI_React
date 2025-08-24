# Go Backend Architecture for PBGui React

## Technology Stack

### Core Framework
- **Gin** - Fast HTTP web framework
- **GORM** - ORM for database operations
- **Gorilla WebSocket** - Real-time communication
- **go-resty** - HTTP client for external APIs
- **viper** - Configuration management
- **logrus** - Structured logging
- **air** - Live reload for development

### Database & Storage
- **SQLite/PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **File system** - Log files and configs

### External Integrations
- **SSH client** - VPS management
- **rclone** - Cloud synchronization
- **CoinMarketCap API** - Market data
- **Exchange APIs** - Trading data

## Project Structure

```
backend-go/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers/            # HTTP handlers
│   │   │   ├── instances.go
│   │   │   ├── backtest.go
│   │   │   ├── optimize.go
│   │   │   ├── dashboard.go
│   │   │   ├── vps.go
│   │   │   ├── remote.go
│   │   │   └── settings.go
│   │   ├── middleware/          # Auth, CORS, logging
│   │   └── routes/              # Route definitions
│   ├── models/                  # Data models
│   │   ├── instance.go
│   │   ├── backtest.go
│   │   ├── job.go
│   │   └── user.go
│   ├── services/                # Business logic
│   │   ├── passivbot/          # Passivbot integration
│   │   │   ├── runner.go       # PBRun wrapper
│   │   │   ├── backtest.go     # Backtest wrapper
│   │   │   └── optimizer.go    # Optimize wrapper
│   │   ├── vps/                # VPS management
│   │   ├── remote/             # PBRemote functionality
│   │   └── coinmarket/         # CoinMarketCap API
│   ├── database/               # Database operations
│   ├── websocket/              # WebSocket handlers
│   └── jobs/                   # Background job system
├── pkg/                        # Shared packages
│   ├── config/                 # Configuration
│   ├── logger/                 # Logging utilities
│   └── utils/                  # Helper functions
├── scripts/                    # Deployment scripts
├── docker/                     # Docker configurations
└── docs/                       # API documentation
```

## API Design

### RESTful Endpoints

```go
// Instance Management
GET    /api/v1/instances              # List instances
POST   /api/v1/instances              # Create instance
GET    /api/v1/instances/:id          # Get instance
PUT    /api/v1/instances/:id          # Update instance
DELETE /api/v1/instances/:id          # Delete instance
POST   /api/v1/instances/:id/start    # Start instance
POST   /api/v1/instances/:id/stop     # Stop instance
GET    /api/v1/instances/:id/logs     # Stream logs (SSE)

// Backtesting
POST   /api/v1/backtest/run           # Start backtest
GET    /api/v1/backtest/jobs          # List jobs
GET    /api/v1/backtest/jobs/:id      # Get job status
DELETE /api/v1/backtest/jobs/:id      # Cancel job
GET    /api/v1/backtest/results/:id   # Get results

// Optimization
POST   /api/v1/optimize/run           # Start optimization
GET    /api/v1/optimize/jobs          # List jobs
GET    /api/v1/optimize/jobs/:id      # Get job status
GET    /api/v1/optimize/results/:id   # Get results

// Dashboard
GET    /api/v1/dashboard/stats        # Overall statistics
GET    /api/v1/dashboard/performance  # Performance metrics

// VPS Management
GET    /api/v1/vps/servers            # List servers
POST   /api/v1/vps/servers            # Add server
PUT    /api/v1/vps/servers/:id        # Update server
DELETE /api/v1/vps/servers/:id        # Remove server
POST   /api/v1/vps/deploy/:id         # Deploy to server

// Remote Sync
POST   /api/v1/remote/sync            # Trigger sync
GET    /api/v1/remote/status          # Sync status
PUT    /api/v1/remote/config          # Update config

// Settings
GET    /api/v1/settings               # Get settings
PUT    /api/v1/settings               # Update settings
```

### WebSocket Endpoints

```go
WS /ws/instances/:id/logs    # Real-time log streaming
WS /ws/jobs/:id/progress     # Job progress updates  
WS /ws/dashboard/metrics     # Live dashboard updates
```

## Core Components

### 1. Instance Management Service

```go
type InstanceService struct {
    db     *gorm.DB
    runner *passivbot.Runner
}

func (s *InstanceService) Start(ctx context.Context, id string) error {
    instance, err := s.GetByID(id)
    if err != nil {
        return err
    }
    
    // Start passivbot process
    go s.runner.Start(instance.Config)
    
    // Update status
    instance.Status = "running"
    return s.db.Save(instance).Error
}

func (s *InstanceService) StreamLogs(id string, ch chan<- string) {
    // Goroutine for real-time log streaming
    go func() {
        defer close(ch)
        for {
            logs := s.runner.ReadLogs(id)
            for _, log := range logs {
                select {
                case ch <- log:
                case <-ctx.Done():
                    return
                }
            }
            time.Sleep(100 * time.Millisecond)
        }
    }()
}
```

### 2. Background Job System

```go
type JobManager struct {
    jobs    sync.Map
    workers int
}

func (jm *JobManager) SubmitBacktest(params BacktestParams) (string, error) {
    jobID := uuid.New().String()
    job := &Job{
        ID:     jobID,
        Type:   "backtest",
        Status: "queued",
        Params: params,
    }
    
    jm.jobs.Store(jobID, job)
    
    // Process in goroutine
    go jm.processBacktest(job)
    
    return jobID, nil
}

func (jm *JobManager) processBacktest(job *Job) {
    job.Status = "running"
    
    // Run actual backtest
    results, err := passivbot.RunBacktest(job.Params)
    if err != nil {
        job.Status = "failed"
        job.Error = err.Error()
        return
    }
    
    job.Status = "completed"
    job.Results = results
}
```

### 3. WebSocket Handler

```go
func (h *Handler) HandleLogStream(c *gin.Context) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        return
    }
    defer conn.Close()
    
    instanceID := c.Param("id")
    logChan := make(chan string, 100)
    
    // Start log streaming
    go h.instanceService.StreamLogs(instanceID, logChan)
    
    // Send logs to client
    for log := range logChan {
        if err := conn.WriteMessage(websocket.TextMessage, []byte(log)); err != nil {
            break
        }
    }
}
```

### 4. Passivbot Integration

```go
type PassivbotRunner struct {
    pythonPath string
    pbPath     string
    processes  sync.Map
}

func (r *PassivbotRunner) Start(config InstanceConfig) error {
    cmd := exec.Command(
        r.pythonPath,
        path.Join(r.pbPath, "passivbot.py"),
        "--config", config.ToJSON(),
    )
    
    cmd.Stdout = &bytes.Buffer{}
    cmd.Stderr = &bytes.Buffer{}
    
    if err := cmd.Start(); err != nil {
        return err
    }
    
    r.processes.Store(config.ID, cmd.Process)
    return nil
}

func (r *PassivbotRunner) Stop(instanceID string) error {
    if proc, ok := r.processes.Load(instanceID); ok {
        if process, ok := proc.(*os.Process); ok {
            return process.Kill()
        }
    }
    return fmt.Errorf("instance not found")
}
```

## Development Setup

### Prerequisites
```bash
# Install Go 1.21+
go version

# Install development tools
go install github.com/cosmtrek/air@latest
go install github.com/swaggo/swag/cmd/swag@latest
```

### Project Initialization
```bash
# Initialize Go module
go mod init pbgui-backend

# Install dependencies
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/sqlite
go get github.com/gorilla/websocket
go get github.com/go-resty/resty/v2
go get github.com/spf13/viper
go get github.com/sirupsen/logrus
```

### Development Workflow
```bash
# Start with live reload
air

# Generate API docs
swag init -g cmd/server/main.go

# Run tests
go test ./...

# Build for production
go build -o pbgui-server cmd/server/main.go
```

## Deployment Strategy

### Single Binary Deployment
```bash
# Build for target platform
GOOS=linux GOARCH=amd64 go build -o pbgui-server-linux cmd/server/main.go

# Deploy to VPS
scp pbgui-server-linux user@vps:/opt/pbgui/
ssh user@vps "systemctl restart pbgui"
```

### Docker Deployment
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:latest
RUN apk add --no-cache ca-certificates python3
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
```

### Performance Optimizations
- Connection pooling for database
- Redis caching for frequently accessed data
- Goroutine pools for background tasks
- HTTP/2 support for better performance
- Graceful shutdown handling

## Integration with React Frontend

Your existing React frontend will work seamlessly with minimal changes:

```typescript
// API client remains the same structure
const api = {
  instances: {
    list: () => fetch('/api/v1/instances'),
    start: (id) => fetch(`/api/v1/instances/${id}/start`, { method: 'POST' }),
    // ... existing methods work unchanged
  }
}

// WebSocket integration
const ws = new WebSocket(`ws://localhost:8080/ws/instances/${id}/logs`);
ws.onmessage = (event) => {
  setLogs(prev => [...prev, event.data]);
};
```

## Migration Benefits

1. **Performance**: 10-50x faster than Python
2. **Deployment**: Single binary, no Python dependencies
3. **Concurrency**: Built-in goroutines for real-time features
4. **Memory**: Lower resource usage
5. **Maintenance**: Simpler deployment and updates
6. **Type Safety**: Better than Python, matches your frontend

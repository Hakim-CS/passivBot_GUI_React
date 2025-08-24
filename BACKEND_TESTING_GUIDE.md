# Go Backend Testing Guide

This guide provides multiple ways to test the Go backend for the PBGui React project.

## Prerequisites

### 1. Install Go

**Windows:**
1. Download Go from https://golang.org/dl/
2. Run the installer (go1.21.x.windows-amd64.msi)
3. Verify installation: `go version`

**Alternative - Using Chocolatey:**
```powershell
choco install golang
```

**Alternative - Using Winget:**
```powershell
winget install GoLang.Go
```

### 2. Verify Go Installation

```powershell
go version
# Should output: go version go1.21.x windows/amd64
```

## Testing Methods

### Method 1: Direct Go Testing

#### Step 1: Install Dependencies
```powershell
cd "d:\internship assignment\passiv-nexus\backend-go"
go mod tidy
```

#### Step 2: Set Environment Variables (Optional)
```powershell
$env:PORT = "8080"
$env:PASSIVBOT_PATH = "C:\path\to\passivbot"  # Mock path for testing
$env:PYTHON_PATH = "python"
```

#### Step 3: Run the Server
```powershell
go run cmd/server/main.go
```

Expected output:
```
2024/01/XX XX:XX:XX Starting server on :8080
2024/01/XX XX:XX:XX Database connected successfully
2024/01/XX XX:XX:XX Server is running...
```

#### Step 4: Test API Endpoints

**Test with PowerShell (Invoke-RestMethod):**
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET

# Test instances endpoint
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/instances" -Method GET

# Test dashboard stats
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard/stats" -Method GET

# Create a new instance
$body = @{
    name = "test-instance"
    symbol = "BTCUSDT"
    config = @{
        exchange = "binance"
        mode = "spot"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/instances" -Method POST -Body $body -ContentType "application/json"
```

### Method 2: Using cURL (if installed)

```bash
# Test basic endpoints
curl http://localhost:8080/api/v1/health
curl http://localhost:8080/api/v1/instances
curl http://localhost:8080/api/v1/dashboard/stats

# Create instance
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{"name":"test-instance","symbol":"BTCUSDT","config":{"exchange":"binance","mode":"spot"}}'
```

### Method 3: Using Postman or Insomnia

1. Download Postman (https://www.postman.com/downloads/) or Insomnia (https://insomnia.rest/download)
2. Import the collection below
3. Test all endpoints

#### Postman Collection (Save as `pbgui-backend.postman_collection.json`):

```json
{
  "info": {
    "name": "PBGui Backend API",
    "description": "Collection for testing PBGui Go backend"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api/v1"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Get All Instances",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/instances"
      }
    },
    {
      "name": "Create Instance",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/instances",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"test-instance\",\n  \"symbol\": \"BTCUSDT\",\n  \"config\": {\n    \"exchange\": \"binance\",\n    \"mode\": \"spot\"\n  }\n}"
        }
      }
    },
    {
      "name": "Get Dashboard Stats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/dashboard/stats"
      }
    },
    {
      "name": "Start Backtest",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/backtest",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"symbol\": \"BTCUSDT\",\n  \"start_date\": \"2024-01-01\",\n  \"end_date\": \"2024-01-31\",\n  \"config\": {\n    \"exchange\": \"binance\",\n    \"mode\": \"spot\"\n  }\n}"
        }
      }
    }
  ]
}
```

### Method 4: Frontend Integration Testing

#### Update React Frontend API Configuration

1. Update `src/lib/api.ts`:
```typescript
// Change the base URL to point to Go backend
const API_BASE = 'http://localhost:8080/api/v1';
```

2. Test frontend with Go backend:
```powershell
# Terminal 1: Start Go backend
cd "d:\internship assignment\passiv-nexus\backend-go"
go run cmd/server/main.go

# Terminal 2: Start React frontend
cd "d:\internship assignment\passiv-nexus"
npm run dev
```

### Method 5: WebSocket Testing

#### Using Browser Developer Tools

1. Open browser console
2. Connect to WebSocket endpoints:

```javascript
// Test instance logs
const wsLogs = new WebSocket('ws://localhost:8080/ws/instances/1/logs');
wsLogs.onmessage = (event) => console.log('Log:', event.data);
wsLogs.onopen = () => console.log('Logs connected');

// Test job progress
const wsProgress = new WebSocket('ws://localhost:8080/ws/jobs/1/progress');
wsProgress.onmessage = (event) => console.log('Progress:', event.data);
wsProgress.onopen = () => console.log('Progress connected');
```

#### Using WebSocket Client Tools

- **Postman** (supports WebSocket)
- **wscat** (npm install -g wscat)
- **WebSocket King** (Chrome extension)

## Expected API Responses

### GET /api/v1/health
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

### GET /api/v1/instances
```json
{
  "instances": [
    {
      "id": "uuid-here",
      "name": "example-instance",
      "symbol": "BTCUSDT",
      "status": "running",
      "created_at": "2024-01-20T10:00:00Z",
      "config": {
        "exchange": "binance",
        "mode": "spot"
      }
    }
  ]
}
```

### GET /api/v1/dashboard/stats
```json
{
  "total_instances": 5,
  "active_instances": 3,
  "total_pnl": 1234.56,
  "active_jobs": 2,
  "system_status": "healthy"
}
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```
   Error: listen tcp :8080: bind: address already in use
   ```
   Solution: Change port or kill process using port 8080

2. **Go not found:**
   ```
   'go' is not recognized as an internal or external command
   ```
   Solution: Install Go and add to PATH

3. **Module errors:**
   ```
   go: cannot find module providing package
   ```
   Solution: Run `go mod tidy`

4. **CORS errors in frontend:**
   ```
   Access to fetch blocked by CORS policy
   ```
   Solution: Backend has CORS enabled, check network/firewall

### Performance Testing

```powershell
# Install hey (load testing tool)
go install github.com/rakyll/hey@latest

# Test API performance
hey -n 100 -c 10 http://localhost:8080/api/v1/instances
```

## Next Steps

1. **Install Go** if not already installed
2. **Run the backend** using Method 1
3. **Test basic endpoints** using Method 2 or 3
4. **Integrate with React frontend** using Method 4
5. **Test WebSocket functionality** using Method 5

## Production Considerations

For production deployment, consider:

1. **Environment variables** for configuration
2. **Database migrations** and backups
3. **Load balancing** for multiple instances
4. **Monitoring and logging** setup
5. **SSL/TLS certificates** for HTTPS
6. **Docker containerization** for easy deployment

Happy testing! 🚀

# PowerShell script to test PBGui Go Backend
# Usage: .\test-backend.ps1

param(
    [string]$Action = "all",
    [string]$BaseUrl = "http://localhost:8080/api/v1",
    [int]$Port = 8080
)

Write-Host "PBGui Go Backend Test Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

function Test-GoInstalled {
    try {
        $goVersion = go version 2>$null
        if ($goVersion) {
            Write-Host "✅ Go is installed: $goVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Go is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Go from https://golang.org/dl/" -ForegroundColor Yellow
        return $false
    }
}

function Test-ServerRunning {
    param([string]$url)
    try {
        $response = Invoke-RestMethod -Uri "$url/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Server is running and responding" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Server is not responding at $url" -ForegroundColor Red
        return $false
    }
}

function Start-Backend {
    Write-Host "🚀 Starting Go backend..." -ForegroundColor Cyan
    
    if (-not (Test-Path "backend-go")) {
        Write-Host "❌ backend-go directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "backend-go"
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    go mod tidy
    
    # Set environment variables
    $env:PORT = $Port.ToString()
    $env:PASSIVBOT_PATH = "mock-path"  # Mock for testing
    $env:PYTHON_PATH = "python"
    
    # Start server
    Write-Host "🏃 Running server on port $Port..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    go run cmd/server/main.go
}

function Test-ApiEndpoints {
    param([string]$baseUrl)
    
    Write-Host "🧪 Testing API endpoints..." -ForegroundColor Cyan
    
    $endpoints = @(
        @{ Name = "Health Check"; Url = "$baseUrl/health"; Method = "GET" }
        @{ Name = "Get Instances"; Url = "$baseUrl/instances"; Method = "GET" }
        @{ Name = "Dashboard Stats"; Url = "$baseUrl/dashboard/stats"; Method = "GET" }
        @{ Name = "Dashboard Performance"; Url = "$baseUrl/dashboard/performance"; Method = "GET" }
        @{ Name = "VPS List"; Url = "$baseUrl/vps"; Method = "GET" }
        @{ Name = "Settings"; Url = "$baseUrl/settings"; Method = "GET" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            Write-Host "Testing $($endpoint.Name)..." -NoNewline
            $response = Invoke-RestMethod -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 10
            Write-Host " ✅" -ForegroundColor Green
            
            # Pretty print first few results for verification
            if ($response -is [System.Collections.IEnumerable] -and $response -isnot [string]) {
                $count = @($response).Count
                Write-Host "  └─ Returned $count items" -ForegroundColor Gray
            } elseif ($response -is [PSCustomObject]) {
                $properties = ($response | Get-Member -MemberType NoteProperty).Count
                Write-Host "  └─ Returned object with $properties properties" -ForegroundColor Gray
            }
        } catch {
            Write-Host " ❌" -ForegroundColor Red
            Write-Host "  └─ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Test-PostEndpoints {
    param([string]$baseUrl)
    
    Write-Host "🧪 Testing POST endpoints..." -ForegroundColor Cyan
    
    # Test create instance
    try {
        Write-Host "Testing Create Instance..." -NoNewline
        $instanceData = @{
            name = "test-instance-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            symbol = "BTCUSDT"
            config = @{
                exchange = "binance"
                mode = "spot"
                wallet_exposure_limit = 0.1
                long_enabled = $true
                short_enabled = $false
            }
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$baseUrl/instances" -Method POST -Body $instanceData -ContentType "application/json" -TimeoutSec 10
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "  └─ Created instance with ID: $($response.id)" -ForegroundColor Gray
        
        # Store instance ID for further tests
        $script:testInstanceId = $response.id
        
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  └─ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test start backtest
    try {
        Write-Host "Testing Start Backtest..." -NoNewline
        $backtestData = @{
            symbol = "BTCUSDT"
            start_date = "2024-01-01"
            end_date = "2024-01-07"
            config = @{
                exchange = "binance"
                mode = "spot"
                wallet_exposure_limit = 0.1
            }
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$baseUrl/backtest" -Method POST -Body $backtestData -ContentType "application/json" -TimeoutSec 10
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "  └─ Started backtest with job ID: $($response.job_id)" -ForegroundColor Gray
        
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  └─ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-WebSocketConnections {
    param([string]$baseUrl)
    
    Write-Host "🔌 WebSocket endpoints available (manual testing required):" -ForegroundColor Cyan
    $wsBaseUrl = $baseUrl -replace "http://", "ws://" -replace "/api/v1", ""
    
    Write-Host "  • Instance Logs: $wsBaseUrl/ws/instances/1/logs" -ForegroundColor Gray
    Write-Host "  • Job Progress: $wsBaseUrl/ws/jobs/1/progress" -ForegroundColor Gray
    Write-Host "  • Dashboard Metrics: $wsBaseUrl/ws/dashboard/metrics" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Test in browser console:" -ForegroundColor Yellow
    Write-Host "const ws = new WebSocket('$wsBaseUrl/ws/instances/1/logs');" -ForegroundColor Gray
    Write-Host "ws.onmessage = (event) => console.log('Log:', event.data);" -ForegroundColor Gray
}

function Show-ServerStatus {
    param([string]$baseUrl)
    
    Write-Host "📊 Server Status Report" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    if (Test-ServerRunning -url $baseUrl) {
        try {
            $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
            $stats = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method GET
            
            Write-Host "Server URL: $baseUrl" -ForegroundColor Green
            Write-Host "Status: $($health.status)" -ForegroundColor Green
            Write-Host "Version: $($health.version)" -ForegroundColor Green
            Write-Host "Timestamp: $($health.timestamp)" -ForegroundColor Green
            Write-Host ""
            Write-Host "Dashboard Stats:" -ForegroundColor Cyan
            Write-Host "  Total Instances: $($stats.total_instances)" -ForegroundColor Gray
            Write-Host "  Active Instances: $($stats.active_instances)" -ForegroundColor Gray
            Write-Host "  Total PnL: $($stats.total_pnl)" -ForegroundColor Gray
            Write-Host "  Active Jobs: $($stats.active_jobs)" -ForegroundColor Gray
            Write-Host "  System Status: $($stats.system_status)" -ForegroundColor Gray
            
        } catch {
            Write-Host "⚠️ Server responding but API errors occurred" -ForegroundColor Yellow
        }
    }
}

# Main execution
switch ($Action.ToLower()) {
    "install" {
        if (-not (Test-GoInstalled)) {
            Write-Host "Please install Go manually from https://golang.org/dl/" -ForegroundColor Yellow
        }
    }
    
    "start" {
        if (Test-GoInstalled) {
            Start-Backend
        }
    }
    
    "test" {
        if (Test-ServerRunning -url $BaseUrl) {
            Test-ApiEndpoints -baseUrl $BaseUrl
            Test-PostEndpoints -baseUrl $BaseUrl
            Test-WebSocketConnections -baseUrl $BaseUrl
        } else {
            Write-Host "Start the server first with: .\test-backend.ps1 -Action start" -ForegroundColor Yellow
        }
    }
    
    "status" {
        Show-ServerStatus -baseUrl $BaseUrl
    }
    
    "all" {
        if (-not (Test-GoInstalled)) {
            return
        }
        
        Write-Host "Use the following commands to test the backend:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Start server:    .\test-backend.ps1 -Action start" -ForegroundColor Green
        Write-Host "2. Test endpoints:  .\test-backend.ps1 -Action test" -ForegroundColor Green
        Write-Host "3. Check status:    .\test-backend.ps1 -Action status" -ForegroundColor Green
        Write-Host ""
        Write-Host "Or test with different port: .\test-backend.ps1 -Action test -Port 3000" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: install, start, test, status, all" -ForegroundColor Yellow
    }
}

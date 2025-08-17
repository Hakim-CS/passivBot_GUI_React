"""
PBGui React - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any, List
import asyncio
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="PBGui React API",
    description="FastAPI backend for PBGui React - Passivbot management interface",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data stores (replace with actual database)
instances_db: Dict[str, Dict[str, Any]] = {}
jobs_db: Dict[str, Dict[str, Any]] = {}

# === INSTANCE MANAGEMENT ===

@app.get("/api/instances")
async def list_instances():
    """List all Passivbot instances"""
    return {"data": list(instances_db.values())}

@app.post("/api/instances")
async def create_instance(instance_data: dict):
    """Create a new Passivbot instance"""
    instance_id = f"inst_{len(instances_db) + 1}"
    instance = {
        "id": instance_id,
        "name": instance_data.get("name", f"Instance {instance_id}"),
        "exchange": instance_data.get("exchange", "binance"),
        "symbol": instance_data.get("symbol", "BTCUSDT"),
        "strategy": instance_data.get("strategy", "grid"),
        "status": "stopped",
        "pnl": 0.0,
        "position": 0.0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    instances_db[instance_id] = instance
    return {"data": instance}

@app.get("/api/instances/{instance_id}")
async def get_instance(instance_id: str):
    """Get specific instance details"""
    if instance_id not in instances_db:
        raise HTTPException(status_code=404, detail="Instance not found")
    return {"data": instances_db[instance_id]}

@app.post("/api/instances/{instance_id}/start")
async def start_instance(instance_id: str):
    """Start a Passivbot instance"""
    if instance_id not in instances_db:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    instances_db[instance_id]["status"] = "running"
    instances_db[instance_id]["updated_at"] = datetime.now().isoformat()
    
    return {"message": f"Instance {instance_id} started", "status": "running"}

@app.post("/api/instances/{instance_id}/stop")
async def stop_instance(instance_id: str):
    """Stop a Passivbot instance"""
    if instance_id not in instances_db:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    instances_db[instance_id]["status"] = "stopped"
    instances_db[instance_id]["updated_at"] = datetime.now().isoformat()
    
    return {"message": f"Instance {instance_id} stopped", "status": "stopped"}

# === BACKTESTING ===

@app.post("/api/run/backtest")
async def run_backtest(backtest_params: dict):
    """Start a backtesting job"""
    job_id = f"bt_{len(jobs_db) + 1}"
    job = {
        "id": job_id,
        "type": "backtest",
        "status": "queued",
        "progress": 0,
        "params": backtest_params,
        "created_at": datetime.now().isoformat()
    }
    jobs_db[job_id] = job
    
    # Simulate background processing
    asyncio.create_task(simulate_backtest_job(job_id))
    
    return {"job_id": job_id, "status": "queued"}

@app.post("/api/run/optimize")
async def run_optimization(optimize_params: dict):
    """Start an optimization job"""
    job_id = f"opt_{len(jobs_db) + 1}"
    job = {
        "id": job_id,
        "type": "optimize",
        "status": "queued",
        "progress": 0,
        "params": optimize_params,
        "created_at": datetime.now().isoformat()
    }
    jobs_db[job_id] = job
    
    # Simulate background processing
    asyncio.create_task(simulate_optimization_job(job_id))
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get job status and results"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"data": jobs_db[job_id]}

@app.get("/api/backtest/{job_id}/results")
async def get_backtest_results(job_id: str):
    """Get detailed backtest results"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    return {"data": job}

@app.get("/api/backtest/{job_id}/trades")
async def get_backtest_trades(job_id: str):
    """Get trade history for backtest"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Mock trade data - in real implementation, this would come from backtest results
    mock_trades = [
        {
            "id": f"trade_{i}",
            "timestamp": "2024-01-01T10:00:00Z",
            "type": "buy" if i % 2 == 0 else "sell",
            "price": 43000 + (i * 100),
            "quantity": 0.01,
            "pnl": (i % 3 - 1) * 50  # Mix of positive and negative
        }
        for i in range(10)
    ]
    
    return {"data": mock_trades}

@app.get("/api/jobs")
async def list_jobs():
    """List all jobs"""
    return {"data": list(jobs_db.values())}

# === DASHBOARD ===

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get overall dashboard statistics"""
    running_instances = len([i for i in instances_db.values() if i["status"] == "running"])
    total_pnl = sum(i.get("pnl", 0) for i in instances_db.values())
    
    return {
        "data": {
            "total_instances": len(instances_db),
            "running_instances": running_instances,
            "total_pnl": total_pnl,
            "today_trades": 24,  # Mock data
            "success_rate": 67.8  # Mock data
        }
    }

@app.get("/api/dashboard/performance")
async def get_performance_data():
    """Get performance chart data"""
    # Mock performance data
    return {
        "data": {
            "daily_pnl": [120, 150, -50, 300, 200],
            "cumulative_pnl": [120, 270, 220, 520, 720],
            "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"]
        }
    }

# === REMOTE SYNC ===

@app.post("/api/remote/sync")
async def sync_remote():
    """Trigger remote sync via rclone"""
    return {"message": "Remote sync initiated", "status": "syncing"}

@app.get("/api/remote/status")
async def get_remote_status():
    """Get remote sync status"""
    return {
        "data": {
            "last_sync": "2024-01-01T10:00:00",
            "status": "idle",
            "files_synced": 150,
            "bytes_transferred": "2.5 MB"
        }
    }

# === SETTINGS ===

@app.get("/api/settings")
async def get_settings():
    """Get application settings"""
    return {
        "data": {
            "passivbot_path": "/opt/passivbot",
            "venv_path": "/opt/passivbot/venv",
            "data_path": "/opt/passivbot/data",
            "log_level": "INFO"
        }
    }

@app.put("/api/settings")
async def update_settings(settings: dict):
    """Update application settings"""
    return {"message": "Settings updated", "data": settings}

# === COINS / MARKET DATA ===

@app.get("/api/coins")
async def list_coins():
    """Get available coins from CMC"""
    # Mock coin data
    return {
        "data": [
            {"symbol": "BTC", "name": "Bitcoin", "price": 43250.0, "change_24h": 2.5},
            {"symbol": "ETH", "name": "Ethereum", "price": 2650.0, "change_24h": -1.2},
            {"symbol": "SOL", "name": "Solana", "price": 98.5, "change_24h": 5.8}
        ]
    }

@app.get("/api/coins/markets")
async def get_market_data():
    """Get market data for coins"""
    return {
        "data": {
            "total_market_cap": "1.7T",
            "24h_volume": "85B",
            "btc_dominance": 52.3
        }
    }

# === BACKGROUND JOB SIMULATION ===

async def simulate_backtest_job(job_id: str):
    """Simulate a backtesting job with progress updates"""
    if job_id not in jobs_db:
        return
    
    jobs_db[job_id]["status"] = "running"
    
    # Simulate progress
    for progress in range(0, 101, 10):
        jobs_db[job_id]["progress"] = progress
        await asyncio.sleep(0.5)  # Simulate work
    
    # Complete the job
    jobs_db[job_id]["status"] = "completed"
    jobs_db[job_id]["completed_at"] = datetime.now().isoformat()
    jobs_db[job_id]["results"] = {
        "total_return": 15.7 + (hash(job_id) % 20),  # Vary results
        "sharpe_ratio": 1.35 + (hash(job_id) % 100) / 100,
        "max_drawdown": 8.2 + (hash(job_id) % 5),
        "total_trades": 156 + (hash(job_id) % 50),
        "win_rate": 65.0 + (hash(job_id) % 20)
    }

async def simulate_optimization_job(job_id: str):
    """Simulate an optimization job with progress updates"""
    if job_id not in jobs_db:
        return
    
    jobs_db[job_id]["status"] = "running"
    
    # Simulate progress
    for progress in range(0, 101, 5):
        jobs_db[job_id]["progress"] = progress
        await asyncio.sleep(1)  # Simulate longer work
    
    # Complete the job
    jobs_db[job_id]["status"] = "completed"
    jobs_db[job_id]["completed_at"] = datetime.now().isoformat()
    jobs_db[job_id]["results"] = {
        "best_parameters": {"grid_span": 0.02, "position_size": 0.1},
        "best_return": 23.4,
        "optimization_runs": 100
    }

# === HEALTH CHECK ===

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
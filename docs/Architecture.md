# PBGui React - Architecture Plan

## Overview
Modern React + FastAPI rebuild of pbgui, preserving all Passivbot trading bot management features with enhanced UX/UI.

## Frontend Architecture (React 18 + TypeScript)

### Pages & Routes
```
/                    → Dashboard (instances overview, performance)
/instances           → Instance Manager (create, edit, start/stop bots)
/instances/:id       → Individual Instance Details & Logs
/backtest           → Backtesting Interface
/optimize           → Optimization Tools
/remote             → PBRemote Sync Management
/settings           → Configuration (paths, API keys, preferences)
/coins              → CMC Coin Picker & Market Data
/vps                → VPS Setup & Management
```

### Component Structure
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout with sidebar
│   │   ├── Header.tsx         # Top navigation
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── dashboard/
│   │   ├── PerformanceChart.tsx
│   │   ├── InstanceGrid.tsx
│   │   └── QuickStats.tsx
│   ├── instances/
│   │   ├── InstanceCard.tsx
│   │   ├── InstanceForm.tsx
│   │   ├── LogViewer.tsx
│   │   └── InstanceControls.tsx
│   ├── trading/
│   │   ├── BacktestForm.tsx
│   │   ├── OptimizeForm.tsx
│   │   ├── CoinPicker.tsx
│   │   └── StrategySelector.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── DataTable.tsx
```

### State Management
- **Zustand stores** (only for complex global state):
  - `useInstanceStore` - Active bot instances
  - `useSettingsStore` - User preferences & configuration
- **React Query** for server state & caching
- **Local state** with useState/useReducer for component-specific data

### API Layer
```typescript
// src/lib/api.ts
const api = {
  instances: {
    list: () => GET('/api/instances'),
    create: (data) => POST('/api/instances', data),
    start: (id) => POST(`/api/instances/${id}/start`),
    stop: (id) => POST(`/api/instances/${id}/stop`),
    logs: (id) => SSE(`/api/instances/${id}/logs`)
  },
  backtest: {
    run: (params) => POST('/api/run/backtest', params),
    results: (jobId) => GET(`/api/jobs/${jobId}/results`)
  },
  optimize: {
    run: (params) => POST('/api/run/optimize', params),
    progress: (jobId) => SSE(`/api/jobs/${jobId}/progress`)
  },
  dashboard: {
    stats: () => GET('/api/dashboard/stats'),
    performance: () => GET('/api/dashboard/performance')
  },
  remote: {
    sync: () => POST('/api/remote/sync'),
    status: () => GET('/api/remote/status')
  },
  settings: {
    get: () => GET('/api/settings'),
    update: (data) => PUT('/api/settings', data)
  }
}
```

## Backend Architecture (FastAPI)

### API Endpoints
```
/api/instances
├── GET /                     # List all instances
├── POST /                    # Create new instance
├── GET /{id}                 # Get instance details
├── PUT /{id}                 # Update instance
├── DELETE /{id}              # Delete instance
├── POST /{id}/start          # Start bot instance
├── POST /{id}/stop           # Stop bot instance
└── GET /{id}/logs            # SSE log stream

/api/run
├── POST /backtest            # Start backtest job
├── POST /optimize            # Start optimization job
└── GET /jobs/{id}/status     # Job progress/results

/api/dashboard
├── GET /stats                # Overall statistics
├── GET /performance          # Performance metrics
└── GET /instances/summary    # Instance summaries

/api/remote
├── POST /sync                # Trigger PBRemote sync
├── GET /status               # Sync status
└── GET /config               # rclone configuration

/api/settings
├── GET /                     # Get all settings
├── PUT /                     # Update settings
├── GET /paths                # Passivbot paths
└── PUT /paths                # Update paths

/api/coins
├── GET /                     # Available coins (CMC)
├── GET /markets              # Market data
└── POST /analyze             # Coin analysis
```

### Background Job System
```python
# Celery-like job queue for long-running tasks
from backend.jobs import JobManager

job_manager = JobManager()

@app.post("/api/run/backtest")
async def run_backtest(params: BacktestParams):
    job_id = job_manager.submit(
        task="backtest",
        params=params.dict(),
        user_id=current_user.id
    )
    return {"job_id": job_id, "status": "queued"}
```

### Module Integration
```python
# Wrapper classes for existing Python modules
from backend.wrappers import (
    PBRunWrapper,      # Passivbot instance management
    BacktestWrapper,   # Backtesting engine
    OptimizeWrapper,   # Optimization tools
    PBDataWrapper,     # Data management
    PBStatWrapper,     # Statistics & analytics
    PBRemoteWrapper    # Remote sync via rclone
)
```

## Data Flow

### Instance Management
1. User creates instance via React form
2. POST to `/api/instances` validates & stores config
3. Background service manages PBRun process
4. SSE streams live logs to frontend
5. WebSocket updates instance status

### Backtesting Workflow
1. User configures backtest parameters
2. POST to `/api/run/backtest` queues job
3. Background worker executes via BacktestWrapper
4. Progress updates via SSE
5. Results stored & returned when complete

### Live Data Updates
- **Instance logs**: Server-Sent Events (SSE)
- **Job progress**: SSE with progress percentage
- **Dashboard metrics**: Polling every 30s
- **Instance status**: WebSocket for real-time updates

## Technology Stack

### Frontend
- **React 18** - Component framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **React Query v4** - Server state management
- **Zustand** - Global state (minimal usage)
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Pre-built components
- **Recharts** - Data visualization
- **React Hook Form** - Form management

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **SQLAlchemy** - Database ORM
- **Alembic** - Database migrations
- **Celery** - Background task queue
- **Redis** - Task queue broker
- **SSE** - Real-time log streaming
- **rclone** - Remote file sync

### Development
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **ESLint + Prettier** - Code quality
- **TypeScript** - Static type checking

## Security Considerations
- **Bearer token auth** - Simple but secure
- **API rate limiting** - Prevent abuse
- **Input validation** - Pydantic schemas
- **Environment variables** - Sensitive config
- **CORS configuration** - Frontend/backend separation

## Performance Optimizations
- **React Query caching** - Reduce API calls
- **Code splitting** - Lazy load routes
- **Image optimization** - WebP format
- **Bundle analysis** - Monitor bundle size
- **SSE connection pooling** - Efficient log streaming

## Deployment Strategy
- **Docker containers** - Consistent environments
- **Docker Compose** - Local development
- **Environment configs** - Dev/staging/prod
- **Health checks** - Service monitoring
- **Logging** - Structured JSON logs
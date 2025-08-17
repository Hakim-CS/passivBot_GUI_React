# PBGui React - Modern Passivbot Management Interface

A modern React + FastAPI rebuild of pbgui, providing a comprehensive interface for managing Passivbot trading instances with enhanced UX/UI.

## 🚀 Features

### Core Trading Management
- **Instance Manager**: Create, configure, and control Passivbot instances
- **Real-time Monitoring**: Live P&L tracking, position monitoring, and status updates
- **Log Streaming**: Live log viewing with filtering and search capabilities
- **Multi-Exchange Support**: Binance, Bybit, OKX, and more

### Advanced Analytics
- **Backtesting Engine**: Test strategies against historical data
- **Strategy Optimization**: Find optimal parameters using various algorithms
- **Performance Analytics**: Detailed reporting with interactive charts
- **Risk Management**: Portfolio-level risk monitoring and alerts

### Remote Operations
- **VPS Deployment**: Automated deployment to remote servers
- **PBRemote Sync**: Synchronize configurations via rclone
- **Cloud Integration**: Support for major cloud providers
- **SSH Management**: Secure remote access and monitoring

### Market Intelligence
- **Coin Picker**: CMC integration for coin analysis and selection
- **Market Data**: Real-time price feeds and technical indicators
- **Strategy Selection**: Built-in strategy library and custom configurations

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** + **shadcn/ui** for beautiful, responsive UI
- **React Query** for efficient server state management
- **React Router** for navigation
- **Zustand** for minimal global state

### Backend
- **FastAPI** with Python 3.11+
- **SQLAlchemy** for database operations
- **Celery** for background job processing
- **Redis** for caching and job queues
- **rclone** for remote file synchronization

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** and npm/yarn
- **Python 3.11+** 
- **Redis** (for background jobs)

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd pbgui-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/api/docs`

### Redis Setup (Required for background jobs)

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# macOS with Homebrew
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

## 🏗️ Project Structure

```
pbgui-react/
├── src/
│   ├── components/
│   │   ├── layout/          # App layout components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── instances/       # Instance management
│   │   ├── trading/         # Trading-specific components
│   │   └── common/          # Shared components
│   ├── pages/               # Route components
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── state/              # Zustand stores
├── backend/
│   ├── main.py             # FastAPI application
│   ├── wrappers/           # Passivbot integration
│   ├── jobs/               # Background job system
│   ├── models/             # Database models
│   └── api/                # API endpoints
├── docs/
│   ├── Architecture.md     # System architecture
│   └── Feature-Parity-Checklist.md
└── tests/                  # Test suites
```

## 🔧 Development

### Frontend Development

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Building for production
npm run build
```

### Backend Development

```bash
# Start with auto-reload
uvicorn main:app --reload

# Run tests
pytest

# Code formatting
black .
isort .

# Type checking
mypy .
```

### Environment Variables

Create `.env` files for configuration:

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
```

**Backend (.env)**
```env
# Database
DATABASE_URL=sqlite:///./pbgui.db

# Redis
REDIS_URL=redis://localhost:6379

# Passivbot paths
PASSIVBOT_PATH=/opt/passivbot
VENV_PATH=/opt/passivbot/venv

# API Keys (optional)
CMC_API_KEY=your_coinmarketcap_key
```

## 🧪 Testing

### Frontend Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test Dashboard.test.tsx
```

### Backend Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test
pytest tests/test_instances.py
```

### End-to-End Tests
```bash
# Install Playwright
npm install @playwright/test

# Run E2E tests
npm run test:e2e
```

## 📊 Performance

- **Lighthouse Score**: Target ≥90 for all metrics
- **Bundle Size**: Optimized with code splitting
- **API Response**: <100ms for most endpoints
- **Real-time Updates**: SSE for live data streaming

## 🔒 Security

- **Authentication**: Bearer token-based auth
- **API Rate Limiting**: Prevents abuse
- **Input Validation**: Comprehensive Pydantic schemas
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Sensitive data protection

## 📚 Migration from Streamlit pbgui

### Key Differences
- **Modern UI**: React-based interface vs. Streamlit
- **Better Performance**: Optimized for speed and responsiveness
- **Enhanced UX**: Improved navigation and user workflows
- **Real-time Updates**: Live data streaming instead of page refreshes
- **Mobile Support**: Fully responsive design

### Migration Guide
1. **Export configurations** from existing pbgui
2. **Update API endpoints** to new FastAPI structure
3. **Migrate data** using provided migration scripts
4. **Update environment variables** to new format

See `docs/Migration.md` for detailed migration instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint + Prettier**: Code formatting and linting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: Maintain ≥80% coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🗺️ Roadmap

- [ ] Complete instance management implementation
- [ ] Real-time log streaming with WebSockets
- [ ] Advanced backtesting with parallel processing
- [ ] Machine learning-based optimization
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests

---

**Built with ❤️ for the Passivbot trading community**

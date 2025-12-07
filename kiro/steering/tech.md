# Technology Stack

## Frontend

### Core Technologies
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **Zustand** for state management

### Key Libraries
- `pica` - High-quality image resizing
- `browser-image-compression` - Smart compression
- `jszip` - ZIP archive creation
- `file-saver` - File downloads
- `lucide-react` - Icons
- `socket.io-client` - WebSocket communication (full-stack mode)
- `axios` - HTTP client (full-stack mode)

### Build Commands
```bash
# Development
npm run dev              # Start dev server on localhost:5173

# Production
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build

# Frontend-specific (in /frontend directory)
cd frontend
npm run dev              # Full-stack frontend dev server
```

## Backend

### Core Technologies
- **FastAPI** - Web framework
- **Celery** - Distributed task queue
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Redis** - Message broker and result backend
- **Pillow** - Image processing

### Key Libraries
- `pydantic` - Data validation
- `alembic` - Database migrations
- `uvicorn` - ASGI server
- `websockets` - Real-time updates
- `piexif` - EXIF metadata handling

### Backend Commands
```bash
# Development
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery worker
celery -A app.celery_app worker --loglevel=info

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Testing
pytest tests/
pytest --cov=app tests/
```

## Docker

### Full Stack
```bash
# Start all services
docker-compose up

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]
```

### Services
- `redis` - Message broker (port 6379)
- `db` - PostgreSQL database (port 5432)
- `backend` - FastAPI server (port 8000)
- `celery` - Background workers
- `frontend` - Vite dev server (port 5173)

## Deployment

### Static Frontend (Client-Side Mode)
- Vercel: `vercel`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Build and push `dist/` folder

### Full Stack
- Docker Compose for production
- Separate frontend/backend deployments
- Environment variables required (see `.env.example`)

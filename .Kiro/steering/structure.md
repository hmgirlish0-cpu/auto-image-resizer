# Project Structure

## Dual Implementation

This repository contains TWO implementations:

1. **Client-Side Only** (`/src`, root `package.json`) - Original browser-based version
2. **Full Stack** (`/frontend` + `/backend`) - Server-based processing with job queue

## Root Level

```
/
├── src/                    # Client-side only implementation
├── frontend/               # Full-stack frontend
├── backend/                # Full-stack backend
├── dist/                   # Build output (client-side)
├── docker-compose.yml      # Full-stack orchestration
└── package.json            # Client-side dependencies
```

## Client-Side Implementation (`/src`)

```
src/
├── components/
│   ├── UploadView.tsx      # File upload interface
│   ├── ConfigView.tsx      # Processing configuration
│   └── ResultsView.tsx     # Results and downloads
├── utils/
│   └── imageProcessor.ts   # Core processing logic
├── types.ts                # TypeScript definitions
├── presets.ts              # Preset configurations
├── store.ts                # Zustand state management
├── App.tsx                 # Main component
└── main.tsx                # Entry point
```

## Full-Stack Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/         # React components (similar to /src)
│   ├── api.ts              # Backend API client
│   ├── store.ts            # State management
│   └── App.tsx             # Main app
├── Dockerfile              # Container config
└── package.json            # Dependencies
```

## Backend (`/backend`)

```
backend/
├── app/
│   ├── operations/         # Image processing operations
│   │   ├── base.py         # Abstract base classes
│   │   ├── resize.py       # Resize operation
│   │   ├── compression.py  # Compression operation
│   │   ├── watermark.py    # Watermark operation
│   │   ├── crop.py         # Crop operation
│   │   ├── convert.py      # Format conversion
│   │   └── metadata.py     # Metadata handling
│   ├── routers/            # API endpoints
│   │   ├── upload.py       # File upload
│   │   ├── jobs.py         # Job management
│   │   └── websocket.py    # Real-time updates
│   ├── models.py           # Data models (SQLAlchemy + Pydantic)
│   ├── database.py         # Database connection
│   ├── tasks.py            # Celery tasks
│   ├── celery_app.py       # Celery configuration
│   ├── config.py           # App configuration
│   ├── presets.py          # Preset definitions
│   └── main.py             # FastAPI app
├── alembic/                # Database migrations
│   └── versions/           # Migration files
├── requirements.txt        # Python dependencies
├── pyproject.toml          # Poetry config
└── Dockerfile              # Container config
```

## Architecture Patterns

### Backend Operations Pattern

All image operations follow the `ImageOperation` abstract base class:

```python
class ImageOperation(ABC):
    @abstractmethod
    def execute(self, image: Image.Image, params: Any) -> Image.Image:
        pass
    
    @abstractmethod
    def validate_params(self, params: Any) -> bool:
        pass
    
    @property
    @abstractmethod
    def operation_name(self) -> str:
        pass
```

Operations are chained using `ProcessingPipeline` for sequential execution.

### Frontend State Management

Uses Zustand for global state:
- Uploaded files
- Processing configuration
- Job status and progress
- Results and downloads

### API Communication

- REST endpoints for job creation and status
- WebSocket for real-time progress updates
- File uploads via multipart/form-data

## Key Conventions

### File Naming
- React components: PascalCase (e.g., `UploadView.tsx`)
- Python modules: snake_case (e.g., `image_processor.py`)
- Types/Models: PascalCase (e.g., `JobStatus`, `ResizeParams`)

### Code Organization
- Backend: Separate concerns (routers, operations, models, tasks)
- Frontend: Component-based with shared state
- Operations: Composable, testable, single-responsibility

### Environment Variables
- Backend uses `.env` files (see `.env.example`)
- Frontend uses Vite env vars (`VITE_` prefix)
- Docker Compose overrides for containerized deployment

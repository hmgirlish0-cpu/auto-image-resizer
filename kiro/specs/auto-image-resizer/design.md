# Auto Image Resizer - Design Document

## Overview

The Auto Image Resizer is a modern web application built with a FastAPI backend and React frontend, leveraging the Pillow (PIL) library for core image operations. The system follows a modular architecture with clear separation between the REST API, processing engine, job queue, and frontend interface. The design emphasizes scalability, allowing multiple users to process images concurrently with asynchronous job processing.

The application will support batch processing of common image formats (JPEG, PNG, WEBP, HEIC) with operations including resize, compress, watermark, crop, format conversion, and metadata management. A job-based architecture enables users to submit processing tasks and retrieve results later, with progress tracking via WebSocket connections.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Upload View  │  │ Config View  │  │ Results View │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │  WebSocket     │                       │
│                    │  (Progress)    │                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │ HTTP/WS
┌────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              REST API Endpoints                       │ │
│  │  /upload  /process  /jobs/{id}  /download/{id}      │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              WebSocket Handler                        │ │
│  │         (Real-time progress updates)                  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                    Job Queue (Celery + Redis)              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Task Queue Manager                       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                   Processing Engine                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Operation Pipeline Manager                  │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Resize  │ │ Compress │ │Watermark │ │   Crop   │    │
│  │ Operator │ │ Operator │ │ Operator │ │ Operator │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐                                │
│  │ Convert  │ │ Metadata │                                │
│  │ Operator │ │ Operator │                                │
│  └──────────┘ └──────────┘                                │
└────────────────────────────┬──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│              Storage & Database                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ File Storage │  │  Job Database│  │ Config Store │   │
│  │  (uploads/   │  │  (SQLite/    │  │   (JSON)     │   │
│  │   outputs)   │  │  PostgreSQL) │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend (React):**
- Upload View: Drag-and-drop file upload, file validation, thumbnail display
- Config View: Interactive operation configuration, preset selection
- Results View: Progress tracking, before/after previews, download management
- WebSocket Client: Real-time progress updates from backend

**Backend API (FastAPI):**
- REST Endpoints: Handle file uploads, job creation, status queries, downloads
- WebSocket Handler: Broadcast real-time progress updates to connected clients
- Request Validation: Validate uploaded files and processing parameters
- Response Formatting: Format job status and results for frontend consumption

**Job Queue (Celery + Redis):**
- Task Queue: Manage asynchronous processing jobs
- Worker Pool: Execute processing tasks in parallel
- Progress Tracking: Update job status and progress in real-time
- Result Storage: Store processing results and metadata

**Processing Engine:**
- Operation Pipeline Manager: Orchestrates multiple operations in sequence
- Individual Operators: Encapsulate specific image transformations
- Each operator implements a common interface for consistency

**Storage & Database:**
- File Storage: Temporary storage for uploaded and processed images
- Job Database: Track job status, metadata, and results (SQLite for MVP, PostgreSQL for production)
- Config Store: Store preset configurations and system settings
- Cleanup Service: Remove old files and completed jobs after retention period

## Components and Interfaces

### Core Interfaces

```python
class ImageOperation(ABC):
    """Base interface for all image operations"""
    
    @abstractmethod
    def execute(self, image: Image, params: OperationParams) -> Image:
        """Execute the operation on an image"""
        pass
    
    @abstractmethod
    def validate_params(self, params: OperationParams) -> bool:
        """Validate operation parameters"""
        pass

class ProcessingPipeline:
    """Manages sequential execution of operations"""
    
    def add_operation(self, operation: ImageOperation, params: OperationParams):
        """Add an operation to the pipeline"""
        pass
    
    def execute(self, image_path: Path) -> ProcessingResult:
        """Execute all operations on an image"""
        pass

class BatchProcessor:
    """Handles batch processing with progress tracking"""
    
    def process_batch(self, 
                     image_paths: List[Path], 
                     pipeline: ProcessingPipeline,
                     callback: ProgressCallback) -> BatchResult:
        """Process multiple images with progress updates"""
        pass
```

### Resize Operator

Implements three resize modes:
- **Maintain Aspect Ratio**: Calculate new dimensions preserving original ratio
- **Stretch**: Direct resize to target dimensions
- **Pad**: Resize maintaining ratio, then add borders to reach exact dimensions

```python
class ResizeOperator(ImageOperation):
    def execute(self, image: Image, params: ResizeParams) -> Image:
        if params.mode == ResizeMode.MAINTAIN_ASPECT:
            return self._resize_maintain_aspect(image, params)
        elif params.mode == ResizeMode.STRETCH:
            return image.resize((params.width, params.height), Image.LANCZOS)
        elif params.mode == ResizeMode.PAD:
            return self._resize_with_padding(image, params)
```

### Compression Operator

Uses iterative quality reduction to meet target file size:

```python
class CompressionOperator(ImageOperation):
    def execute(self, image: Image, params: CompressionParams) -> Image:
        """Compress image to target size using binary search on quality"""
        quality = 95
        min_quality = 10
        max_quality = 95
        
        while max_quality - min_quality > 5:
            # Binary search for optimal quality level
            # Save to BytesIO and check size
            # Adjust quality bounds based on result
        
        return image  # Quality metadata stored in params
```

### Watermark Operator

Supports text and image watermarks with positioning:

```python
class WatermarkOperator(ImageOperation):
    def execute(self, image: Image, params: WatermarkParams) -> Image:
        if params.type == WatermarkType.TEXT:
            return self._apply_text_watermark(image, params)
        elif params.type == WatermarkType.IMAGE:
            return self._apply_image_watermark(image, params)
        elif params.type == WatermarkType.REPEATING:
            return self._apply_repeating_watermark(image, params)
```

### Crop Operator

Implements multiple cropping strategies:

```python
class CropOperator(ImageOperation):
    def execute(self, image: Image, params: CropParams) -> Image:
        if params.mode == CropMode.CENTER:
            return self._center_crop(image, params)
        elif params.mode == CropMode.ASPECT_RATIO:
            return self._aspect_ratio_crop(image, params)
        elif params.mode == CropMode.SMART:
            return self._smart_crop(image, params)
```

Smart crop uses edge detection to identify content boundaries and remove empty space.

### Format Converter

Handles format transformations with quality preservation:

```python
class FormatConverter(ImageOperation):
    SUPPORTED_CONVERSIONS = {
        ('PNG', 'JPEG'): {'quality': 95},
        ('JPEG', 'WEBP'): {'quality': 85, 'method': 6},
        ('HEIC', 'JPEG'): {'quality': 95},
    }
    
    def execute(self, image: Image, params: ConversionParams) -> Image:
        # Handle color mode conversions (RGBA -> RGB for JPEG)
        # Apply format-specific optimization settings
        return converted_image
```

### Metadata Manager

Uses piexif library for EXIF manipulation:

```python
class MetadataOperator(ImageOperation):
    def execute(self, image: Image, params: MetadataParams) -> Image:
        if params.action == MetadataAction.REMOVE:
            return self._strip_metadata(image)
        elif params.action == MetadataAction.ADD:
            return self._add_metadata(image, params.metadata_dict)
        elif params.action == MetadataAction.PRESERVE:
            return image  # No modification needed
```

## Data Models

### Configuration Models

```python
@dataclass
class ResizeParams:
    width: int
    height: int
    mode: ResizeMode  # MAINTAIN_ASPECT, STRETCH, PAD
    pad_color: Tuple[int, int, int] = (255, 255, 255)

@dataclass
class CompressionParams:
    target_size_kb: Optional[int] = None
    target_quality: Optional[int] = None
    max_iterations: int = 10

@dataclass
class WatermarkParams:
    type: WatermarkType  # TEXT, IMAGE, REPEATING
    content: str  # Text or path to watermark image
    position: Position  # CENTER, TOP_LEFT, BOTTOM_RIGHT, etc.
    transparency: int  # 0-100
    size_percent: int = 10  # Relative to image size

@dataclass
class CropParams:
    mode: CropMode  # CENTER, ASPECT_RATIO, SMART
    target_aspect: Optional[Tuple[int, int]] = None
    target_dimensions: Optional[Tuple[int, int]] = None

@dataclass
class ConversionParams:
    target_format: str  # JPEG, PNG, WEBP
    quality: int = 95

@dataclass
class MetadataParams:
    action: MetadataAction  # REMOVE, PRESERVE, ADD
    metadata_dict: Optional[Dict[str, str]] = None

@dataclass
class PresetConfig:
    name: str
    description: str
    operations: List[Tuple[str, OperationParams]]
    
# Predefined presets
PRESETS = {
    'instagram_post': PresetConfig(
        name='Instagram Post',
        description='1080x1080, optimized for Instagram feed',
        operations=[
            ('resize', ResizeParams(1080, 1080, ResizeMode.PAD)),
            ('compress', CompressionParams(target_size_kb=500)),
            ('convert', ConversionParams('JPEG', 90))
        ]
    ),
    'website_banner': PresetConfig(
        name='Website Banner',
        description='1920x1080, WEBP format for fast loading',
        operations=[
            ('resize', ResizeParams(1920, 1080, ResizeMode.MAINTAIN_ASPECT)),
            ('convert', ConversionParams('WEBP', 85))
        ]
    ),
    # Additional presets...
}
```

### Processing Results

```python
@dataclass
class ProcessingResult:
    success: bool
    input_path: Path
    output_path: Optional[Path]
    operations_applied: List[str]
    original_size_kb: float
    final_size_kb: Optional[float]
    error_message: Optional[str] = None
    processing_time_seconds: float = 0.0

@dataclass
class BatchResult:
    total_files: int
    successful: int
    failed: int
    results: List[ProcessingResult]
    total_time_seconds: float
```

### Web API Models

```python
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size_bytes: int
    format: str

class ProcessingRequest(BaseModel):
    file_ids: List[str]
    preset: Optional[str] = None
    operations: List[Dict[str, Any]]  # List of operation configs

class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    created_at: datetime
    progress_percent: int
    total_files: int
    processed_files: int
    estimated_time_remaining_seconds: Optional[int]
    download_url: Optional[str]
    errors: List[str]

class JobCreateResponse(BaseModel):
    job_id: str
    tracking_url: str
    status: JobStatus

class ProgressUpdate(BaseModel):
    job_id: str
    progress_percent: int
    current_file: str
    processed_files: int
    total_files: int
    estimated_time_remaining_seconds: Optional[int]

# Database Models (SQLAlchemy)
from sqlalchemy import Column, String, Integer, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True)
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    total_files = Column(Integer)
    processed_files = Column(Integer, default=0)
    progress_percent = Column(Integer, default=0)
    operations = Column(JSON)  # Serialized operation configs
    input_files = Column(JSON)  # List of uploaded file paths
    output_files = Column(JSON)  # List of processed file paths
    errors = Column(JSON)  # List of error messages
    result_zip_path = Column(String, nullable=True)
```

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Resize Properties

**Property 1: Resize produces target dimensions**
*For any* batch of images and any valid target dimensions, resizing all images should result in every output image having the specified dimensions (when using stretch or pad mode).
**Validates: Requirements 1.1, 1.3**

**Property 2: Maintain aspect ratio preserves ratio**
*For any* image, when resized with maintain aspect ratio mode, the ratio of width to height in the output should equal the ratio in the input (within floating-point tolerance).
**Validates: Requirements 1.2**

**Property 3: Pad mode maintains content aspect ratio**
*For any* image resized with pad mode, the non-padded content region should maintain the original aspect ratio while the overall image meets exact target dimensions.
**Validates: Requirements 1.4**

**Property 4: Original files are preserved**
*For any* image processing operation, after completion both the original file and the processed file should exist at different paths.
**Validates: Requirements 1.5**

### Compression Properties

**Property 5: Compression meets target size**
*For any* image and target file size, compression should produce an output file that is at or below the target size (or report that the target is unachievable).
**Validates: Requirements 2.1**

**Property 6: Compression results include metadata**
*For any* batch of compressed images, the result should contain final size and quality level information for each processed image.
**Validates: Requirements 2.4**

### Watermark Properties

**Property 7: Watermarks appear in output**
*For any* image and watermark configuration (text or logo), applying the watermark should produce an output image that differs from the input in the expected watermark region.
**Validates: Requirements 3.1, 3.2**

**Property 8: Transparency affects watermark visibility**
*For any* image and watermark, applying the same watermark with different transparency levels should produce visibly different outputs (measured by pixel difference in watermark region).
**Validates: Requirements 3.3**

**Property 9: Position parameter controls watermark location**
*For any* image and watermark, applying the watermark at different positions (center, corners, custom coordinates) should result in the watermark appearing at the specified location.
**Validates: Requirements 3.4**

**Property 10: Repeating mode creates multiple instances**
*For any* image with repeating watermark mode, the output should contain multiple instances of the watermark pattern distributed across the image.
**Validates: Requirements 3.5**

### Crop Properties

**Property 11: Center crop is centered**
*For any* image and crop dimensions, center crop should produce output where the cropped region is centered on the original image's center point.
**Validates: Requirements 4.1**

**Property 12: Aspect ratio crop produces correct ratio**
*For any* image and target aspect ratio, aspect ratio cropping should produce an output with the specified width-to-height ratio.
**Validates: Requirements 4.2**

### Format Conversion Properties

**Property 13: Format conversion produces target format**
*For any* supported format conversion pair (PNG→JPEG, JPEG→WEBP, HEIC→JPEG), the output file should be in the target format and readable as that format.
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 14: WEBP conversion reduces file size**
*For any* image converted from JPEG to WEBP, the WEBP file size should be at least 30% smaller than the equivalent JPEG file size.
**Validates: Requirements 5.4**

### Web Upload Properties

**Property 15: Upload validation rejects unsupported formats**
*For any* file uploaded through the web interface, if the file is not a supported image format, the system should reject it with an appropriate error message.
**Validates: Requirements 6.5**

**Property 16: Uploaded files are stored temporarily**
*For any* successfully uploaded file, the file should be stored in the upload directory with a unique identifier.
**Validates: Requirements 6.3**

### Job Management Properties

**Property 17: Job creation returns unique identifier**
*For any* processing request, creating a job should return a unique job ID that can be used to track progress.
**Validates: Requirements 10.1**

**Property 18: Job status reflects processing state**
*For any* job, querying the job status should return accurate information about progress, including percentage complete and processed file count.
**Validates: Requirements 10.3**

**Property 19: Completed jobs remain accessible**
*For any* completed job, the results should remain accessible for at least 24 hours after completion.
**Validates: Requirements 10.4**

### Metadata Properties

**Property 18: Metadata removal strips EXIF data**
*For any* image with EXIF metadata, processing with remove metadata mode should produce an output with no EXIF data present.
**Validates: Requirements 7.1**

**Property 19: Metadata preservation retains EXIF data**
*For any* image with EXIF metadata, processing with preserve metadata mode should produce an output containing the same EXIF data as the input.
**Validates: Requirements 7.2**

**Property 20: Custom metadata is added**
*For any* image and custom metadata fields (author, copyright, caption), processing should produce an output containing the specified metadata fields with the correct values.
**Validates: Requirements 7.3**

### Preset Properties

**Property 21: Presets apply all configured operations**
*For any* preset configuration, processing an image with that preset should apply all operations defined in the preset (resize, compress, convert, etc.).
**Validates: Requirements 8.2**

**Property 22: Custom presets persist**
*For any* custom preset created and saved, restarting the system should still make that preset available with all its configured operations intact.
**Validates: Requirements 8.4**

### Interface Properties

**Property 23: CLI displays progress information**
*For any* batch processing operation via CLI, the output should include progress indicators showing completed and remaining items.
**Validates: Requirements 9.3**

**Property 24: Processing produces summary reports**
*For any* completed processing operation (CLI or GUI), a summary report should be generated containing all operations performed and their results.
**Validates: Requirements 9.5**

### Batch Processing Properties

**Property 25: Batch operations provide progress tracking**
*For any* batch operation, progress information should be available showing the count of completed and remaining items.
**Validates: Requirements 10.1**

**Property 26: Errors are logged with details**
*For any* processing error, the error log should contain the filename and a description of the failure reason.
**Validates: Requirements 10.2**

**Property 27: Batch processing continues after errors**
*For any* batch containing one corrupted or invalid file, the remaining valid files should still be processed successfully.
**Validates: Requirements 10.3**

**Property 28: Batch results include success and failure counts**
*For any* completed batch operation, the summary should include counts of successful and failed operations along with details for each file.
**Validates: Requirements 10.4**

## Error Handling

### Error Categories

**Input Validation Errors:**
- Invalid file paths or non-existent files
- Unsupported image formats
- Invalid parameter values (negative dimensions, transparency > 100, etc.)
- Corrupted image files

**Processing Errors:**
- Insufficient memory for large images
- Disk space exhausted during save operations
- Watermark image file not found
- Format conversion not supported for specific image modes (e.g., RGBA to JPEG)

**File System Errors:**
- Permission denied for reading input or writing output
- Output directory does not exist
- File locked by another process

### Error Handling Strategy

**Fail Fast for Configuration Errors:**
- Validate all parameters before starting any processing
- Provide clear error messages indicating what's wrong and how to fix it
- Exit immediately if configuration is invalid

**Graceful Degradation for Processing Errors:**
- Log detailed error information including filename and stack trace
- Continue processing remaining files in batch operations
- Return partial results with error details for failed items

**User Notification:**
- CLI: Print errors to stderr with color coding (red for errors, yellow for warnings)
- GUI: Display error dialogs with actionable information
- Both: Generate error reports listing all failures with reasons

**Recovery Mechanisms:**
- Automatic retry for transient errors (file locks, temporary permission issues)
- Fallback quality levels if target compression size is unachievable
- Skip corrupted files in batch operations rather than failing entire batch

### Example Error Messages

```
Error: Invalid resize dimensions
  File: photo.jpg
  Issue: Width must be positive (got -100)
  Fix: Specify width > 0

Warning: Compression target not achievable
  File: small-icon.png
  Target: 10 KB
  Achieved: 15 KB (minimum without severe quality loss)
  Action: Saved best achievable result

Error: Format conversion failed
  File: image.png
  Conversion: PNG → JPEG
  Issue: Image has transparency (RGBA mode), JPEG doesn't support alpha channel
  Fix: Use PNG output format or remove transparency first
```

## Testing Strategy

### Unit Testing

The system will use pytest as the testing framework with the following unit test coverage:

**Core Operation Tests:**
- Test each operator (Resize, Compress, Watermark, Crop, Convert, Metadata) with specific examples
- Test edge cases: empty images, 1x1 pixel images, very large images
- Test error conditions: invalid parameters, corrupted files, unsupported formats

**Integration Tests:**
- Test pipeline execution with multiple operations in sequence
- Test batch processing with mixed valid and invalid files
- Test watch mode activation, file detection, and processing
- Test preset loading and application

**File System Tests:**
- Test file reading and writing with various permissions
- Test output directory creation
- Test original file preservation

### Property-Based Testing

The system will use Hypothesis (Python property-based testing library) to verify universal properties across randomly generated inputs.

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will use Hypothesis strategies to generate random images, dimensions, and parameters
- Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document

**Tag Format:**
```python
# Feature: auto-image-resizer, Property 1: Resize produces target dimensions
@given(image=image_strategy(), width=st.integers(1, 4000), height=st.integers(1, 4000))
def test_resize_produces_target_dimensions(image, width, height):
    # Test implementation
```

**Property Test Coverage:**
- All 28 correctness properties listed above will be implemented as property-based tests
- Each property will be tested with randomly generated images of varying sizes, formats, and content
- Parameters will be generated within valid ranges using Hypothesis strategies

**Test Data Generation:**
- Random images: Generate PIL Image objects with random dimensions, color modes (RGB, RGBA, L), and pixel data
- Random parameters: Generate valid parameter combinations for each operation
- Edge cases: Hypothesis will automatically discover edge cases through shrinking when tests fail

### Test Execution

**Local Development:**
```bash
# Run all tests
pytest tests/

# Run only unit tests
pytest tests/unit/

# Run only property tests
pytest tests/property/ -v

# Run with coverage
pytest --cov=image_processor tests/
```

**Continuous Integration:**
- All tests must pass before merging
- Property tests run with increased iteration count (500) in CI
- Performance benchmarks for common operations
- Test against multiple Python versions (3.8, 3.9, 3.10, 3.11)

## Implementation Notes

### Technology Stack

**Backend Dependencies:**
- Python 3.9+
- FastAPI 0.100+ for REST API and WebSocket support
- Celery 5.3+ for asynchronous task queue
- Redis 7.0+ for Celery broker and result backend
- SQLAlchemy 2.0+ for database ORM
- SQLite (development) / PostgreSQL (production) for job database
- Pillow (PIL Fork) 10.0+ for image processing
- piexif for EXIF metadata manipulation
- pydantic for request/response validation
- python-multipart for file upload handling
- uvicorn for ASGI server
- pytest for unit testing
- hypothesis for property-based testing

**Frontend Dependencies:**
- React 18+ with TypeScript
- Vite for build tooling
- TanStack Query (React Query) for API state management
- Zustand for client state management
- React Dropzone for file uploads
- Socket.IO client for WebSocket connections
- Tailwind CSS for styling
- Radix UI or shadcn/ui for component library

**Optional Dependencies:**
- pillow-heif for HEIC format support
- numpy for advanced image operations (smart crop)
- opencv-python for face detection in smart crop

### Performance Considerations

**Memory Management:**
- Process images in streaming mode for very large files
- Implement batch size limits to prevent memory exhaustion
- Use lazy loading for batch operations

**Parallel Processing:**
- Use multiprocessing.Pool for batch operations
- Process independent images in parallel
- Limit worker count based on available CPU cores and memory

**Optimization:**
- Cache resized watermark images to avoid repeated resizing
- Use efficient image resampling algorithms (LANCZOS for downscaling)
- Implement early exit for compression when target size is reached

### Platform Compatibility

**Cross-Platform Support:**
- Use pathlib for path handling (Windows/Unix compatibility)
- Backend runs on any platform supporting Python 3.9+
- Frontend is browser-based, works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Handle platform-specific file system limitations (filename length, special characters)

**Browser Compatibility:**
- Support modern browsers with ES2020+ support
- Graceful degradation for older browsers
- Mobile-responsive design for tablet and phone access
- Progressive Web App (PWA) capabilities for offline preset configuration

### Extensibility

**Adding New Operations:**
1. Create new class inheriting from ImageOperation
2. Implement execute() and validate_params() methods
3. Register operation in operation factory
4. Add to preset configurations as needed

**Adding New Presets:**
- Presets are defined in configuration file (JSON or YAML)
- Users can create custom presets through GUI or by editing config
- Presets can be shared as configuration files

**Plugin System (Future Enhancement):**
- Define plugin interface for custom operations
- Load plugins from designated directory
- Allow community-contributed operations

## Deployment

### Distribution

**Docker Deployment (Recommended):**
- Multi-container setup with Docker Compose:
  - FastAPI backend container
  - Celery worker container(s)
  - Redis container
  - PostgreSQL container (production)
  - Nginx container for frontend static files and reverse proxy
- Single command deployment: `docker-compose up -d`
- Easy scaling: add more Celery workers as needed

**Cloud Deployment Options:**
- **Heroku**: Deploy with Procfile, use Redis add-on
- **AWS**: ECS for containers, S3 for file storage, RDS for database
- **DigitalOcean**: App Platform or Droplet with Docker
- **Vercel/Netlify**: Frontend only, with separate backend deployment

**Local Development:**
- Backend: `uvicorn main:app --reload`
- Celery worker: `celery -A tasks worker --loglevel=info`
- Redis: `redis-server` or Docker container
- Frontend: `npm run dev`

### Configuration

**Backend Configuration:**
- Environment variables for sensitive data (database URL, Redis URL, secret keys)
- Configuration file for presets and system settings
- Location: `.env` file or environment-specific configs

**Configuration Variables:**
```env
DATABASE_URL=sqlite:///./jobs.db  # or postgresql://...
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_FILE_SIZE_MB=50
MAX_FILES_PER_JOB=100
JOB_RETENTION_HOURS=24
CELERY_WORKERS=4
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Frontend Configuration:**
- API base URL configured via environment variable
- Build-time configuration for production deployment
- Runtime configuration for API endpoints

### Documentation

**User Documentation:**
- README with quick start guide
- CLI reference with all commands and options
- GUI user guide with screenshots
- Preset configuration examples
- Troubleshooting common issues

**Developer Documentation:**
- API reference for all classes and methods
- Architecture overview and design decisions
- Contributing guidelines
- Testing guide
- Plugin development guide

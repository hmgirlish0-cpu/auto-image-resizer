# Product Overview

Auto Image Resizer is a dual-mode image processing application that supports both client-side and server-side batch processing.

## Core Functionality

- Bulk image processing (up to 100 images)
- Resize with multiple modes (maintain aspect, stretch, pad)
- Smart compression (target size or quality-based)
- Watermarking (text, image, repeating patterns)
- Cropping (center, aspect ratio, smart)
- Format conversion (JPEG, PNG, WEBP)
- Preset configurations for common use cases

## Deployment Modes

1. **Client-Side Only**: Pure browser-based processing with no backend (original implementation in `/src`)
2. **Full Stack**: FastAPI backend with Celery workers for server-side processing (`/frontend` + `/backend`)

## Key Features

- Privacy-first: Client-side mode processes everything in the browser
- Batch processing with progress tracking
- Before/after preview comparison
- Download individual files or ZIP archives
- Preset configurations (Instagram, Website Banner, Profile Picture, E-commerce)

## Target Users

- Content creators needing bulk image optimization
- E-commerce teams preparing product images
- Social media managers formatting posts
- Web developers optimizing site assets

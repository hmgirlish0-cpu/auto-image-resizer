# Auto Image Resizer

A powerful, client-side image processing web application that runs entirely in your browser. No server required, no uploads to external services - all processing happens locally on your device.

## Features

- **Bulk Image Processing**: Process up to 100 images simultaneously
- **Resize**: Multiple modes (maintain aspect ratio, stretch, pad with color)
- **Compression**: Target file size or quality-based compression
- **Watermarking**: Add text or repeating watermarks with customizable position and transparency
- **Cropping**: Center crop or aspect ratio-based cropping
- **Format Conversion**: Convert between JPEG, PNG, and WEBP formats
- **Presets**: Quick configurations for Instagram, website banners, profile pictures, and e-commerce
- **Privacy First**: All processing happens in your browser - no data leaves your device
- **Download Options**: Download individual files or all as a ZIP

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

## Deployment

This app can be deployed to any static hosting service:

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist/` folder to your GitHub Pages branch

## Usage

1. **Upload Images**: Drag and drop images or click to browse
2. **Configure Processing**: 
   - Choose a preset or customize settings
   - Enable/disable operations as needed
   - Adjust parameters for each operation
3. **Process**: Click "Process Images" and wait for completion
4. **Download**: Download individual images or all as a ZIP file

## Presets

- **Instagram Post**: 1080x1080, optimized for Instagram feed
- **Website Banner**: 1920x1080, WEBP format for fast loading
- **Profile Picture**: 512x512, square crop for avatars
- **E-commerce Product**: 1000x1000, white background

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Pica** for high-quality image resizing
- **browser-image-compression** for smart compression
- **JSZip** for creating ZIP archives
- **file-saver** for downloading files

## Browser Support

Works on all modern browsers that support:
- Canvas API
- Web Workers
- ES2020+

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy & Security

- **100% Client-Side**: All image processing happens in your browser
- **No Server Uploads**: Your images never leave your device
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full source code available for inspection

## Performance

- Uses Web Workers for non-blocking processing
- High-quality resizing with Pica library
- Efficient compression algorithms
- Handles large batches of images

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

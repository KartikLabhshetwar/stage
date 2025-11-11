# Stage Architecture Documentation

## Overview

Stage is a modern web-based canvas editor built with Next.js 16 and React 19. It enables users to create stunning visual designs by uploading images, adding text overlays, customizing backgrounds, and exporting high-quality graphics—all in the browser.

## Tech Stack

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler enabled
- **TypeScript** - Type safety throughout the codebase

### Canvas & Rendering

- **Konva/React-Konva** - 2D canvas rendering engine for user images and overlays
- **html2canvas** - DOM-to-canvas conversion for background rendering
- **modern-screenshot** - 3D transform capture for perspective effects

### State Management

- **Zustand** - Lightweight state management with two main stores:
  - `useImageStore` - Main image and design state
  - `useEditorStore` - Canvas rendering state (synced with image store)

### Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Image Processing & Storage

- **Cloudinary** (optional) - Image optimization, CDN, and screenshot caching
- **Screen-Shot.xyz API** - Free website screenshot capture service (no API key required)
- **IndexedDB** - Client-side storage for images and exports
- **Sharp** - Server-side image processing (dev dependency)

### Analytics

- **Umami** - Privacy-focused analytics

## Project Structure

```text
stage/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   └── screenshot/       # Website screenshot API endpoint
│   ├── home/                 # Editor page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
│
├── components/              # React components
│   ├── canvas/              # Canvas rendering components
│   │   ├── ClientCanvas.tsx  # Main Konva canvas renderer
│   │   ├── CanvasContext.tsx # Canvas state management
│   │   └── EditorCanvas.tsx  # Canvas wrapper component
│   ├── controls/            # Editor control panels
│   │   ├── BorderControls.tsx
│   │   ├── ShadowControls.tsx
│   │   ├── Perspective3DControls.tsx
│   │   └── UploadDropzone.tsx
│   ├── editor/              # Editor layout components
│   │   ├── EditorLayout.tsx
│   │   ├── editor-left-panel.tsx
│   │   └── editor-right-panel.tsx
│   ├── export/              # Export UI components
│   ├── overlays/            # Overlay management
│   ├── presets/             # Preset selector
│   ├── text-overlay/        # Text overlay controls
│   ├── landing/             # Landing page components
│   └── ui/                  # Reusable UI components (shadcn/ui)
│
├── lib/                     # Core libraries and utilities
│   ├── store/               # Zustand stores
│   │   └── index.ts         # useImageStore & useEditorStore
│   ├── export/              # Export functionality
│   │   ├── export-service.ts # Main export logic
│   │   └── export-utils.ts   # Export utilities
│   ├── constants/           # Configuration constants
│   │   ├── aspect-ratios.ts
│   │   ├── backgrounds.ts
│   │   ├── fonts.ts
│   │   ├── gradient-colors.ts
│   │   ├── presets.ts
│   │   └── solid-colors.ts
│   ├── canvas/              # Canvas utilities
│   ├── cloudinary.ts        # Cloudinary integration
│   ├── image-storage.ts     # IndexedDB image storage
│   └── export-storage.ts    # IndexedDB export storage
│
├── hooks/                   # Custom React hooks
│   ├── useExport.ts         # Export hook
│   ├── useCanvas.ts         # Canvas operations hook
│   └── useAspectRatioDimensions.ts
│
├── types/                   # TypeScript type definitions
│   ├── canvas.ts
│   └── editor.ts
│
└── public/                  # Static assets
    ├── assets/              # Demo images
    ├── overlays/            # Overlay images
    └── backgrounds/          # Background images
```

## Architecture Patterns

### State Management

The application uses a dual-store pattern with Zustand:

#### 1. Image Store (`useImageStore`)

Manages the main design state:

- Uploaded image URL and metadata
- Background configuration (gradient, solid, image)
- Text overlays array
- Image overlays array
- Image transformations (scale, opacity, border radius)
- Border and shadow configurations
- 3D perspective transforms
- Aspect ratio selection

#### 2. Editor Store (`useEditorStore`)

Manages canvas rendering state:

- Screenshot/image state (for Konva)
- Background mode (solid/gradient)
- Shadow configuration
- Pattern configuration
- Frame configuration
- Canvas dimensions and padding
- Noise configuration

**Store Synchronization**: `EditorStoreSync` component keeps both stores in sync using React effects.

### Canvas Rendering Architecture

The canvas rendering uses a hybrid approach:

1. **Background Layer** - Rendered via HTML/CSS, captured with html2canvas
2. **User Image Layer** - Rendered via Konva Stage
3. **Overlay Layer** - Text and image overlays rendered separately, composited on top

This separation allows:

- High-quality background rendering with CSS effects
- Precise image positioning with Konva
- Proper layering of overlays above user content

### Export Pipeline

The export process follows a multi-step compositing pipeline:

```text
1. Export Background (html2canvas)
   ├── Clone background element
   ├── Apply blur effects
   └── Apply noise overlay

2. Export Konva Stage (user images)
   ├── Hide background layer
   ├── Export at high pixel ratio
   └── Scale to export dimensions

3. Export Overlays (html2canvas)
   ├── Create temporary DOM container
   ├── Render text overlays with fonts
   ├── Render image overlays
   └── Capture with html2canvas

4. Composite Layers
   ├── Background (bottom)
   ├── User Image (middle)
   └── Overlays (top)

5. Add Watermark
6. Convert to Blob/DataURL
```

### Image Storage

Images are stored using a hybrid approach:

1. **Blob URLs** - Temporary URLs for uploaded images
2. **IndexedDB** - Persistent storage for:
   - Uploaded image blobs (keyed by unique ID)
   - Exported images with metadata
   - Export preferences

When an image is uploaded:

- A blob URL is created for immediate use
- The blob is saved to IndexedDB with a unique ID
- The ID is stored in canvas objects for persistence

### Component Architecture

#### Layout Components

- `EditorLayout` - Main editor container with responsive panels
- `EditorLeftPanel` - Left sidebar with controls
- `EditorRightPanel` - Right sidebar with style options
- `EditorBottomBar` - Bottom bar with export/actions

#### Canvas Components

- `EditorCanvas` - Wrapper that shows upload UI or canvas
- `ClientCanvas` - Main Konva canvas renderer (client-only)
- `CanvasContext` - Context provider for canvas operations

#### Control Components

- `BorderControls` - Border style and configuration
- `ShadowControls` - Shadow customization
- `Perspective3DControls` - 3D transform controls
- `BackgroundEffects` - Background blur and noise

## Key Features Implementation

### 1. Image Upload

- **File Upload**: Uses `react-dropzone` for drag-and-drop
- **Website Screenshot**: API route calls [Screen-Shot.xyz](https://screen-shot.xyz) service
  - Supports desktop (1920x1080) and mobile (375x667) viewport sizes
  - Device type selection via UI dropdown
  - Screenshots cached separately by device type
- **Validation**: File type and size validation, URL validation
- **Storage**: Blob URL creation + IndexedDB persistence

### 2. Background System

Supports three background types:

- **Gradient**: CSS linear gradients with customizable colors and angles
- **Solid**: Single color backgrounds
- **Image**: Cloudinary-hosted images or uploaded images

Background effects:

- **Blur**: Applied via CSS filter, captured in export
- **Noise**: Generated noise texture with overlay blend mode

### 3. Text Overlays

- Multiple text overlays with independent positioning
- Custom fonts, colors, sizes, weights
- Text shadows with customizable properties
- Vertical/horizontal orientation
- Position stored as percentage for responsive scaling

### 4. Image Overlays

- Decorative overlays from Cloudinary gallery
- Custom uploaded overlays
- Position, size, rotation, flip controls
- Opacity and visibility toggles

### 5. Image Transformations

- **Scale**: Percentage-based scaling
- **Opacity**: 0-100% opacity control
- **Border Radius**: Rounded corners
- **Borders**: Multiple border styles (glassy, window, ruler, etc.)
- **Shadows**: Customizable shadow with blur, offset, spread, color
- **3D Perspective**: CSS 3D transforms with perspective

### 6. Export System

- **Format**: PNG (with transparency support)
- **Quality**: 0-1 quality slider
- **Scale**: Up to 5x scaling for high-resolution exports
- **Watermark**: Automatic watermark addition
- **Storage**: Exported images saved to IndexedDB

### 7. Presets

Pre-configured design presets that apply:

- Aspect ratio
- Background configuration
- Border and shadow settings
- Image transformations

Presets are defined in `lib/constants/presets.ts` and can be applied with one click.

## Data Flow

### Upload Flow

```text
User uploads image
  ↓
File validation
  ↓
Create blob URL
  ↓
Update useImageStore (uploadedImageUrl)
  ↓
EditorStoreSync syncs to useEditorStore (screenshot.src)
  ↓
ClientCanvas renders image on Konva stage
```

### Export Flow

```text
User clicks export
  ↓
useExport hook called
  ↓
Get Konva stage reference
  ↓
exportElement() called with all state
  ↓
1. Export background (html2canvas)
2. Export Konva stage (user image)
3. Export overlays (html2canvas)
4. Composite all layers
5. Add watermark
6. Convert to blob
  ↓
Download file + save to IndexedDB
```

### State Update Flow

```text
User changes control (e.g., border width)
  ↓
Control component calls store setter
  ↓
Zustand store updates
  ↓
Components subscribed to store re-render
  ↓
EditorStoreSync syncs changes to editor store
  ↓
ClientCanvas re-renders with new state
```

## Performance Considerations

### Canvas Rendering

- Konva stage uses `batchDraw()` to minimize redraws
- Pattern and noise textures are cached
- Background images are loaded once and reused

### Export Performance

- Background and overlays exported separately to optimize memory
- High-resolution exports use scaling instead of large canvas dimensions
- Export operations are async to prevent UI blocking

### Image Loading

- Cloudinary images use optimized URLs with auto-format and quality
- Images are cached in browser cache
- IndexedDB provides persistent storage for offline access

## Environment Variables

```bash
# Required for screenshot caching: Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Screenshot API URL (defaults to free Screen-Shot.xyz API)
# Uses https://api.screen-shot.xyz by default (no API key required)
# Can be set to your own Cloudflare Worker instance
SCREENSHOT_API_URL=https://api.screen-shot.xyz

# Optional: Analytics
BETTER_AUTH_URL=https://your-domain.com
```

## API Routes

### `/api/screenshot`

- **Method**: POST
- **Purpose**: Capture website screenshots using Screen-Shot.xyz API
- **Body**:
  ```json
  {
    "url": "string (required)",
    "deviceType": "desktop" | "mobile" (optional, defaults to "desktop"),
    "forceRefresh": "boolean" (optional)
  }
  ```
- **Returns**:
  ```json
  {
    "screenshot": "string (base64)",
    "url": "string",
    "cached": "boolean",
    "deviceType": "desktop" | "mobile",
    "strategy": "string"
  }
  ```
- **Technology**: [Screen-Shot.xyz API](https://screen-shot.xyz) - Free, open-source screenshot service
  - Default endpoint: `https://api.screen-shot.xyz/take`
  - Supports viewport customization (width/height parameters)
  - Desktop: 1920x1080 viewport
  - Mobile: 375x667 viewport
  - Can be self-hosted on Cloudflare Workers
- **Caching**: Screenshots cached in Cloudinary and database, keyed by URL and device type
- **Rate Limiting**: 20 requests per minute per IP

## Browser Storage

### IndexedDB Stores

1. **`image-blobs`** - Stored uploaded images
   - Key: Unique image ID
   - Value: Blob, type, timestamp

2. **`exports`** - Stored exported images
   - Key: Unique export ID
   - Value: Blob, format, quality, scale, timestamp, fileName

3. **`export-preferences`** - Export settings
   - Key: `'preferences'`
   - Value: format, quality, scale

### LocalStorage

- `canvas-objects` - Canvas object state (for persistence)
- `canvas-background-prefs` - Background preferences

## Dependencies Overview

### Production Dependencies

- **next** (16.0.1) - React framework
- **react** (19.2.0) - UI library
- **konva** (10.0.8) - Canvas library
- **react-konva** (19.2.0) - React bindings for Konva
- **zustand** (5.0.8) - State management
- **html2canvas** (1.4.1) - DOM to canvas
- **modern-screenshot** (4.6.6) - 3D transform capture
- **cloudinary** (2.8.0) - Image optimization
- **radix-ui** - UI primitives
- **tailwindcss** (4) - Styling

### Development Dependencies

- **typescript** (5) - Type checking
- **sharp** (0.34.4) - Image processing
- **tsx** (4.20.6) - TypeScript execution

## Security Considerations

1. **File Upload Validation**: File type and size validation on client and server
2. **CORS**: Images loaded with `crossOrigin: 'anonymous'` for canvas operations
3. **API Keys**: Environment variables for sensitive credentials
4. **XSS Prevention**: React's built-in XSS protection
5. **Content Security**: No eval() or dangerous code execution

## Future Architecture Considerations

### Potential Improvements

1. **Web Workers**: Move heavy export operations to web workers
2. **Service Worker**: Cache assets and enable offline functionality
3. **Virtual Scrolling**: For large overlay galleries
4. **Incremental Export**: Stream large exports to prevent memory issues
5. **Undo/Redo**: Implement history stack for canvas operations
6. **Collaboration**: Real-time collaboration with WebSockets
7. **Cloud Storage**: Optional cloud storage for designs

## Testing Strategy

### Unit Tests

- Store logic (Zustand stores)
- Utility functions (export, image processing)
- Component logic (hooks)

### Integration Tests

- Export pipeline
- Store synchronization
- Image upload flow

### E2E Tests

- Complete user workflows
- Export functionality
- Cross-browser compatibility

## Deployment

### Vercel Configuration

- Serverless functions for API routes
- Edge functions for static assets
- Environment variables configured in Vercel dashboard

### Build Process

```bash
npm run build  # Next.js production build
```

### Runtime Configuration

- `vercel.json` configures function timeouts and memory
- Screenshot API route has 60s timeout (maxDuration) for external API calls

## Monitoring & Analytics

- **Umami Analytics**: Privacy-focused analytics integration
- **Error Tracking**: Error boundaries catch React errors
- **Performance**: Next.js built-in performance monitoring

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

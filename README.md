# Stage

A modern web-based canvas editor for creating stunning visual designs. Upload images, add text overlays, customize backgrounds, and export high-quality graphics—all in your browser.

![Stage](https://img.shields.io/badge/Stage-Canvas%20Editor-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Image Editing

- **Image Upload** - Drag & drop or file picker for image uploads
- **Website Screenshots** - Capture screenshots of websites via URL
- **Image Transformations** - Scale, opacity, rotation, and border radius controls
- **3D Perspective** (coming soon) - Apply 3D transforms with perspective effects
- **Borders** - Multiple border styles (glassy, window, ruler, eclipse, dotted, focus, and more)
- **Shadows** - Customizable shadows with blur, offset, spread, and color controls

### Text & Overlays

- **Text Overlays** - Add multiple text layers with independent positioning
- **Custom Fonts** - Choose from a variety of font families
- **Text Styling** - Customize font size, weight, color, and opacity
- **Text Shadows** - Add shadows to text with customizable properties
- **Image Overlays** - Decorative overlays from gallery or custom uploads
- **Overlay Controls** - Position, size, rotation, flip, and opacity controls

### Backgrounds

- **Gradient Backgrounds** - Beautiful gradient presets with customizable colors and angles
- **Solid Colors** - Choose from a palette of solid color backgrounds
- **Image Backgrounds** - Upload your own or use Cloudinary-hosted backgrounds
- **Background Effects** - Apply blur and noise effects to backgrounds

### Design Tools

- **Aspect Ratios** - Support for Instagram, social media, and standard formats
  - Square (1:1), Portrait (4:5, 9:16), Landscape (16:9)
  - Open Graph, Twitter Banner, LinkedIn Banner, YouTube Banner
- **Presets** - One-click professional styling presets
- **Export Options** - PNG format with adjustable quality (0-1) and scale (up to 5x)
  - **Fully In-Browser Export** - All export operations run client-side without external services
- **Copy to Clipboard** - Copy designs directly to clipboard

### User Experience

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Preview** - See changes instantly as you edit
- **Local Storage** - Designs persist in browser storage
- **High-Quality Export** - Export at up to 5x scale for high-resolution output

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stage.git
   cd stage
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)

   Create a `.env.local` file in the root directory:

   ```env
   # Optional: Cloudinary Configuration (for image optimization)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Optional: Screenshot API (for website screenshots)
   SCREENSHOTAPI_KEY=your-screenshot-api-key
   ```

   > **Note**: The app works completely without these environment variables. All core features including **export work fully in-browser**. Cloudinary is only used for optional image optimization of backgrounds and overlays.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Basic Workflow

1. **Upload an Image**
   - Drag and drop an image onto the canvas, or
   - Click to browse and select a file, or
   - Enter a website URL to capture a screenshot

2. **Customize Your Design**
   - Adjust image properties (scale, opacity, border radius)
   - Choose a background (gradient, solid color, or image)
   - Add text overlays with custom styling
   - Add decorative image overlays
   - Apply borders and shadows
   - Use 3D perspective transforms

3. **Select Aspect Ratio**
   - Choose from various aspect ratios for different use cases
   - Instagram posts, stories, social media banners, etc.

4. **Export Your Design**
   - Click the export button
   - Adjust quality and scale settings
   - Download as PNG or copy to clipboard
   - **All export processing happens in your browser** - no external services required

## 🛠️ Tech Stack

### Core

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with React Compiler
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Canvas & Rendering

- **[Konva](https://konvajs.org/)** - 2D canvas rendering engine
- **[React-Konva](https://github.com/konvajs/react-konva)** - React bindings for Konva
- **[html2canvas](https://html2canvas.hertzen.com/)** - DOM-to-canvas conversion
- **[modern-screenshot](https://github.com/1000px/modern-screenshot)** - 3D transform capture

### State Management

- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management

### Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library

### Image Processing

- **[Cloudinary](https://cloudinary.com/)** - Image optimization and CDN (optional)
- **[Sharp](https://sharp.pixelplumbing.com/)** - Server-side image processing

## 📁 Project Structure

```text
stage/
├── app/                 # Next.js pages and API routes
│   ├── api/            # API endpoints
│   ├── home/           # Editor page
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── canvas/        # Canvas rendering
│   ├── controls/      # Editor controls
│   ├── editor/        # Editor layout
│   └── ui/            # UI components
├── lib/               # Core libraries
│   ├── store/         # State management
│   ├── export/        # Export functionality
│   └── constants/     # Configuration
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
└── public/            # Static assets
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📜 Available Scripts

- `npm run dev` - Start development server on [http://localhost:3000](http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run upload-backgrounds` - Upload backgrounds to Cloudinary
- `npm run upload-demo-images` - Upload demo images to Cloudinary
- `npm run upload-overlays` - Upload overlays to Cloudinary

## 🏗️ Architecture

Stage is a **fully in-browser canvas editor** that requires no external services for core functionality.

### Export Pipeline (100% Client-Side)

Stage uses a hybrid canvas rendering approach with complete in-browser processing:

- **Background Layer** - Rendered via HTML/CSS, captured with html2canvas
- **User Image Layer** - Rendered via Konva Stage for precise positioning
- **Overlay Layer** - Text and image overlays composited on top

The export pipeline composites these layers client-side in the correct order to produce high-quality output without any server or external API calls.

### Optional Services

- **Cloudinary** - Used only for image optimization when configured (completely optional)
- **Screenshot API** - Used only for website screenshot capture feature (optional)

For comprehensive architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[LICENSE](./LICENSE)** - License information

## 🐛 Known Issues

- Export may take a few seconds for high-resolution images
- Some browsers may have limitations with large canvas operations
- Website screenshot feature requires API key

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## Support

- **Issues**: [GitHub Issues](https://github.com/KartikLabhshetwar/stage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KartikLabhshetwar/stage/discussions)

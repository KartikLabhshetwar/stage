# Stage

A modern web-based canvas editor for creating stunning visual designs. Upload images, add text overlays, customize backgrounds, and export high-quality graphics—all in your browser.

![Stage](https://img.shields.io/badge/Stage-Canvas%20Editor-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Image Editing

- **Image Upload** - Drag & drop or file picker for image uploads
- **Website Screenshots** - Capture screenshots of websites via URL using the free [Screen-Shot.xyz](https://screen-shot.xyz) API (no API key required)
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

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database (Required for screenshot caching)
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

   # Cloudinary (Required for screenshot storage)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dlbe0tua7
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Cache Cleanup Security (Required for production)
   CLEANUP_SECRET=your-random-secret-string

   # Screenshot API URL (Optional - defaults to free Screen-Shot API)
   # Uses https://api.screen-shot.xyz by default (free, no API key required)
   # You can deploy your own instance or use a different service
   SCREENSHOT_API_URL=https://api.screen-shot.xyz
   ```

   > **Note**: Screenshot feature requires database and Cloudinary. All other core features including **export work fully in-browser**. Cloudinary is also used for optional image optimization of backgrounds and overlays. The screenshot API uses the free [Screen-Shot.xyz](https://screen-shot.xyz) service by default (no API key required).

4. **Set up the database**

   ```bash
   # Run Prisma migrations to create the database schema
   npx prisma migrate dev --name init

   # Or use db push for quick setup (no migration files)
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

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

### Image Processing & Storage

- **[Cloudinary](https://cloudinary.com/)** - Image optimization, CDN, and screenshot storage
- **[Sharp](https://sharp.pixelplumbing.com/)** - Server-side image processing
- **[Screen-Shot.xyz API](https://screen-shot.xyz)** - Free website screenshot capture service (no API key required)

### Database & Caching

- **[Prisma](https://www.prisma.io/)** - Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database for screenshot caching

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

## 🔒 Production Setup

### Environment Variables for Vercel

Set these in your Vercel project settings:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLEANUP_SECRET=your-random-secret-string

# Screenshot API URL (Optional - defaults to free Screen-Shot API)
SCREENSHOT_API_URL=https://api.screen-shot.xyz
```

**Note**: `SCREENSHOT_API_URL` defaults to `https://api.screen-shot.xyz` which is a free, open-source screenshot API that requires no API key. You can deploy your own instance to Cloudflare Workers or use a different service by setting this variable.

### Screenshot Cache Cleanup

Stage automatically caches website screenshots in Cloudinary to improve performance and reduce API calls. The cleanup process removes old cached screenshots from both Cloudinary storage and your database.

#### How It Works

- **Cache Duration**: Screenshots are cached for 2 days (48 hours) by default
- **Automatic Expiration**: Old cache entries are automatically invalidated when accessed after expiration
- **Manual Cleanup**: Use the cleanup API to proactively remove old screenshots

#### Setting Up Cleanup Secret

The `CLEANUP_SECRET` is **not provided by any service** - you need to create it yourself. It's a security token that prevents unauthorized access to your cleanup endpoint.

**Generate a secure random string:**

```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# Option 4: Online generator (use a trusted source)
# Visit: https://www.random.org/strings/
```

**Add to your `.env.local` file:**

```env
CLEANUP_SECRET=your-generated-secret-string-here
```

**For production (Vercel):**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CLEANUP_SECRET` with your generated secret value
4. Select the appropriate environments (Production, Preview, Development)
5. Click **Save**

**Security Notes:**

- Use a long, random string (at least 32 characters, 64+ recommended)
- Never commit this to version control (it's already in `.gitignore`)
- Use different secrets for development and production
- Treat it like a password - keep it secure

#### Manual Cleanup via API

To remove screenshots older than 2 days from both Cloudinary and the database:

```bash
# Production
curl -X POST https://your-domain.com/api/cleanup-cache \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cleanup-secret"}'

# Local development
curl -X POST http://localhost:3000/api/cleanup-cache \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cleanup-secret"}'
```

**Response**:

```json
{
  "success": true,
  "message": "Cache cleanup completed"
}
```

#### Automated Cleanup (Recommended)

**Option 1: Vercel Cron Jobs** (Pro/Enterprise plans)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup-cache",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

Then create a cron route at `app/api/cleanup-cache/cron/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { clearOldCache } from '@/lib/screenshot-cache';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await clearOldCache();
  return NextResponse.json({ success: true });
}
```

**Option 2: External Cron Service** (Free tier compatible)

Use services like:

- [cron-job.org](https://cron-job.org) (free)
- [EasyCron](https://www.easycron.com) (free tier available)
- GitHub Actions scheduled workflows

Set up a weekly cron job that calls your cleanup endpoint.

**Option 3: Manual Trigger**

Run the cleanup API call manually when needed, especially when approaching Cloudinary storage limits.

#### What Gets Cleaned

The cleanup process:

1. Finds all screenshot cache entries older than 2 days (default)
2. Deletes the images from Cloudinary storage
3. Removes the database records
4. Logs the number of entries cleared

**Note**: Only cached screenshots are cleaned. Your uploaded backgrounds, overlays, and other assets are **not** affected.

#### Monitoring Cloudinary Storage

Check your Cloudinary dashboard to monitor:

- **Storage Usage**: Total storage consumed
- **Bandwidth**: Monthly bandwidth usage
- **Transformations**: Number of image transformations

**Free Tier Limits**:

- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month

**Recommended**: Run cleanup weekly or when storage exceeds 20 GB to stay within free tier limits.

### Rate Limiting

The screenshot API includes built-in rate limiting:

- **Limit**: 20 requests per minute per IP
- **Response**: 429 status with `Retry-After` header
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## 🏗️ Architecture

Stage is a **fully in-browser canvas editor** that requires no external services for core functionality.

### Export Pipeline (100% Client-Side)

Stage uses a hybrid canvas rendering approach with complete in-browser processing:

- **Background Layer** - Rendered via HTML/CSS, captured with html2canvas
- **User Image Layer** - Rendered via Konva Stage for precise positioning
- **Overlay Layer** - Text and image overlays composited on top

The export pipeline composites these layers client-side in the correct order to produce high-quality output without any server or external API calls.

### Optional Services

- **Cloudinary** - Used only for screenshot caching and image optimization when configured (required for screenshot feature)
- **Screen-Shot.xyz API** - Free screenshot capture service (no API key required, defaults to public instance)
  - Can be self-hosted on Cloudflare Workers for better control
  - See [Screen-Shot.xyz documentation](https://screen-shot.xyz/docs) for deployment options

For comprehensive architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, and contribution guidelines.

## Contributors

Thanks to all our amazing contributors for their support and code!

<a href="https://github.com/KartikLabhshetwar/stage/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=KartikLabhshetwar/stage" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=KartikLabhshetwar/stage&type=Date)](https://star-history.com/#KartikLabhshetwar/stage&Date)

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[LICENSE](./LICENSE)** - License information

## 🐛 Known Issues

- Export may take a few seconds for high-resolution images
- Some browsers may have limitations with large canvas operations
- Website screenshot may timeout for slow-loading websites (55s timeout)
- Screenshot feature requires database and Cloudinary configuration
- Manual cache cleanup required on free Vercel account (no cron jobs)
- Screenshot API uses free Screen-Shot.xyz service (no API key required, but rate limits may apply)

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## Support

- **Issues**: [GitHub Issues](https://github.com/KartikLabhshetwar/stage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KartikLabhshetwar/stage/discussions)

# Contributing to Stage

Thank you for your interest in contributing to Stage! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Next.js

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/stage.git
   cd stage
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Required for screenshot caching: Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Optional: Screenshot API URL (defaults to free Screen-Shot.xyz API)
   # Uses https://api.screen-shot.xyz by default (no API key required)
   # Can be set to your own Cloudflare Worker instance
   SCREENSHOT_API_URL=https://api.screen-shot.xyz
   ```

   Note: The app works without Cloudinary, but screenshot caching will be limited. The screenshot API uses the free Screen-Shot.xyz service by default (no API key required).

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

Understanding the project structure will help you navigate the codebase:

```
stage/
├── app/                 # Next.js pages and API routes
├── components/         # React components
│   ├── canvas/        # Canvas rendering components
│   ├── controls/      # Editor control panels
│   ├── editor/        # Editor layout components
│   ├── ui/            # Reusable UI components
│   └── ...
├── lib/               # Core libraries and utilities
│   ├── store/         # Zustand state management
│   ├── export/        # Export functionality
│   └── constants/    # Configuration constants
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── public/           # Static assets
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define types and interfaces for all data structures
- Avoid `any` types; use `unknown` if type is truly unknown
- Use type inference where appropriate, but be explicit for function parameters and return types

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Use `'use client'` directive for client components
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### Code Style

- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use early returns to reduce nesting

### File Naming

- Components: PascalCase (e.g., `EditorCanvas.tsx`)
- Utilities: camelCase (e.g., `export-utils.ts`)
- Constants: camelCase (e.g., `aspect-ratios.ts`)
- Types: PascalCase interfaces/types (e.g., `CanvasObject`)

### Linting and Code Quality

We use ESLint to maintain code quality and consistency across the project.

**Running Linters:**
```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

**Before Committing:**
- Always run `npm run lint` before committing your changes
- Fix any linting errors or warnings
- Use `npm run lint:fix` to automatically fix auto-fixable issues

**Linting Rules:**
- TypeScript strict mode is enforced
- React hooks rules are enforced
- Unused variables must be prefixed with `_` (e.g., `_unusedVar`)
- `any` types are discouraged (warnings will be shown)
- Console statements are limited to `console.warn` and `console.error`

**Configuration:**
- ESLint config: `eslint.config.mjs` (flat config format)
- The configuration includes:
  - ESLint recommended rules
  - TypeScript ESLint recommended rules
  - React and React Hooks plugins
  - Custom rules for Next.js best practices

### Import Organization

```typescript
// 1. React and Next.js
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Third-party libraries
import Konva from 'konva'
import { useImageStore } from '@/lib/store'

// 3. Internal components
import { EditorCanvas } from '@/components/canvas/EditorCanvas'

// 4. Utilities and types
import { cn } from '@/lib/utils'
import type { CanvasObject } from '@/types/canvas'

// 5. Styles (if needed)
import './styles.css'
```

## Making Changes

### Branch Strategy

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Follow existing patterns and conventions
   - Update documentation if needed

3. **Test Your Changes**
   - Test manually in the browser
   - Check for TypeScript errors: `npm run build`
   - Verify the feature works as expected

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(export): add watermark to exported images
fix(canvas): fix image positioning on resize
docs: update architecture documentation
refactor(store): simplify state management
```

### Common Development Tasks

#### Adding a New Control Component

1. Create component in `components/controls/`
2. Add to appropriate panel (`editor-left-panel.tsx` or `editor-right-panel.tsx`)
3. Connect to Zustand store
4. Update types if needed

Example:
```typescript
// components/controls/NewControl.tsx
'use client'

import { useImageStore } from '@/lib/store'

export function NewControl() {
  const { someValue, setSomeValue } = useImageStore()
  
  return (
    <div>
      {/* Your control UI */}
    </div>
  )
}
```

#### Adding a New Background Type

1. Add background definition to `lib/constants/backgrounds.ts`
2. Update `BackgroundConfig` type if needed
3. Add UI selector in background controls
4. Update export logic if needed

#### Adding a New Preset

1. Add preset to `lib/constants/presets.ts`
2. Ensure all referenced values exist (aspect ratios, backgrounds, etc.)
3. Preset will automatically appear in preset selector

#### Modifying Export Logic

1. Edit `lib/export/export-service.ts`
2. Test with various configurations
3. Ensure backward compatibility
4. Update export utilities if needed

## Testing

### Manual Testing Checklist

Before submitting changes, test:

- [ ] Image upload (drag & drop and file picker)
- [ ] Website screenshot functionality (desktop and mobile device types)
- [ ] Device type selector works correctly (desktop/mobile)
- [ ] All control panels work correctly
- [ ] Export functionality (PNG format)
- [ ] Copy to clipboard functionality
- [ ] Responsive design (mobile and desktop)
- [ ] Presets apply correctly
- [ ] Text overlays can be added and edited
- [ ] Image overlays can be added and positioned
- [ ] Background changes work (gradient, solid, image)
- [ ] Border and shadow controls work
- [ ] 3D perspective transforms work
- [ ] Aspect ratio changes work

### Type Checking

```bash
npm run build
```

This will:
- Check TypeScript types
- Verify imports
- Catch compilation errors

### Linting

The project uses ESLint (via Next.js). Check for linting errors:

```bash
npm run lint
```

## Submitting Changes

### Pull Request Process

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested manually
   - [ ] TypeScript compiles without errors
   - [ ] No console errors

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Respond to Feedback**
   - Address review comments
   - Make requested changes
   - Keep the PR updated

### PR Review Criteria

Your PR will be reviewed for:

- **Functionality**: Does it work as intended?
- **Code Quality**: Is the code clean and maintainable?
- **Performance**: Does it impact performance negatively?
- **Compatibility**: Does it break existing features?
- **Documentation**: Is documentation updated?
- **Testing**: Has it been tested?

## Feature Requests

### Suggesting Features

1. **Check Existing Issues**
   - Search for similar feature requests
   - Comment on existing issues if relevant

2. **Create Feature Request**
   - Use the "Feature Request" template
   - Provide clear description
   - Explain use case and benefits
   - Include mockups or examples if possible

### Implementing Features

1. **Discuss First**
   - Comment on the feature request issue
   - Get feedback before implementing
   - Ensure the feature aligns with project goals

2. **Get Approval**
   - Wait for maintainer approval
   - Clarify implementation details
   - Ask questions if unsure

3. **Implement**
   - Follow coding standards
   - Write clean, documented code
   - Test thoroughly

## Bug Reports

### Reporting Bugs

Use the bug report template and include:

1. **Description**
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior

2. **Environment**
   - Browser and version
   - Operating system
   - Device (desktop/mobile)

3. **Screenshots/Video**
   - Visual evidence of the bug
   - Console errors (if any)

4. **Reproduction**
   - Minimal steps to reproduce
   - Does it happen consistently?

### Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Device: [e.g., Desktop]

## Screenshots
[Add screenshots if applicable]

## Console Errors
[Any console errors]
```

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props with TypeScript
- Explain non-obvious logic with inline comments

### Example

```typescript
/**
 * Exports the canvas element as an image
 * 
 * @param elementId - ID of the element to export
 * @param options - Export options (format, quality, scale)
 * @param konvaStage - Konva stage instance
 * @returns Promise resolving to export result with dataURL and blob
 */
export async function exportElement(
  elementId: string,
  options: ExportOptions,
  konvaStage: Konva.Stage | null
): Promise<ExportResult> {
  // Implementation
}
```

### Updating Documentation

- Update `ARCHITECTURE.md` for architectural changes
- Update `README.md` for user-facing changes
- Update this file (`CONTRIBUTING.md`) for process changes

## Getting Help

### Questions?

- Open a GitHub Discussion for questions
- Check existing issues and discussions
- Review the architecture documentation

### Stuck?

- Ask in GitHub Discussions
- Check existing code for examples
- Review similar features for patterns

## Recognition

Contributors will be:
- Listed in the project README (if desired)
- Credited in release notes
- Appreciated by the community!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to Stage! 🎨


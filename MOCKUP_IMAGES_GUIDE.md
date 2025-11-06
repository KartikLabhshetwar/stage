# Mockup Images Guide

This guide will help you find and add mockup images for the Tweet Card and iPhone mockups.

## Required Images

You need to add the following images to `/public/mockups/`:

1. **tweet-card.png** - Main Tweet card mockup image
2. **iphone-mockup.png** - Main iPhone mockup image
3. **tweet-card-preview.png** (optional) - Preview thumbnail for Tweet card
4. **iphone-mockup-preview.png** (optional) - Preview thumbnail for iPhone

## Where to Get Mockup Images

### Free Resources

#### 1. **Figma Community** (Recommended)
- **Tweet Card**: Search "Twitter mockup" or "Tweet card template"
- **iPhone**: Search "iPhone mockup" or "iPhone frame"
- **URL**: https://www.figma.com/community
- **How to use**: 
  1. Find a template you like
  2. Export as PNG (recommended size: 2x for high quality)
  3. Save to `/public/mockups/`

#### 2. **Canva**
- **URL**: https://www.canva.com/create/iphone-mockups/
- **Features**: 
  - Pre-made iPhone mockup templates
  - Customizable designs
  - Free tier available
- **How to use**: Create account → Search "iPhone mockup" → Customize → Download as PNG

#### 3. **Pixabay / Pexels / Unsplash**
- **URLs**: 
  - https://pixabay.com/images/search/iphone-mockup/
  - https://www.pexels.com/search/iphone%20mockup/
  - https://unsplash.com/s/photos/iphone-mockup
- **License**: Free for commercial use (check individual licenses)
- **Search terms**: "iPhone mockup", "Twitter mockup", "tweet card"

#### 4. **Mockup World**
- **URL**: https://www.mockupworld.co/
- **Features**: High-quality free mockups
- **Categories**: Includes device mockups, social media mockups

#### 5. **FreePik**
- **URL**: https://www.freepik.com/search?format=search&query=iphone+mockup
- **Note**: Requires attribution for free version
- **Features**: Large collection of mockup templates

### Paid Resources (Higher Quality)

#### 1. **GraphicRiver (Envato)**
- **URL**: https://graphicriver.net/category/graphics/mockups
- **Price**: ~$5-15 per mockup
- **Quality**: Professional, high-resolution

#### 2. **Creative Market**
- **URL**: https://creativemarket.com/mockups
- **Price**: Varies
- **Quality**: Premium designs

## Creating Your Own Mockups

### Option 1: Using Figma (Free)

1. **Tweet Card Mockup**:
   - Create a new Figma file
   - Set canvas size: 600x400px (matches template dimensions)
   - Design a Twitter/X post card with:
     - Profile picture area
     - Username and handle
     - Tweet content area (this is your safe zone: x:50, y:100, width:500, height:300)
     - Like/Retweet buttons
   - Export as PNG

2. **iPhone Mockup**:
   - Create a new Figma file
   - Set canvas size: 500x900px (matches template dimensions)
   - Design an iPhone frame with:
     - Device bezels
     - Screen area (this is your safe zone: x:100, y:150, width:300, height:600)
     - Home indicator
   - Export as PNG

### Option 2: Using Online Mockup Generators

1. **Smartmockups**: https://smartmockups.com/
   - Free tier available
   - Upload your design to see it in mockup
   - Download the result

2. **Mockup Generator**: https://mockupgenerator.com/
   - Free device mockups
   - Customizable backgrounds

## Image Specifications

### Tweet Card Mockup
- **Dimensions**: 600x400px (or higher, will be scaled)
- **Safe Zone**: x:50, y:100, width:500, height:300
- **Format**: PNG (with transparency preferred)
- **File**: `/public/mockups/tweet-card.png`

### iPhone Mockup
- **Dimensions**: 500x900px (or higher, will be scaled)
- **Safe Zone**: x:100, y:150, width:300, height:600
- **Format**: PNG (with transparency preferred)
- **File**: `/public/mockups/iphone-mockup.png`

### Preview Images (Optional)
- **Dimensions**: 200-400px width (maintain aspect ratio)
- **Format**: PNG or JPG
- **Purpose**: Thumbnails shown in the mockup selector
- **Files**: 
  - `/public/mockups/tweet-card-preview.png`
  - `/public/mockups/iphone-mockup-preview.png`

## Quick Start: Using Existing MacBook Mockup as Reference

Since you already have MacBook mockups in `/public/mac/`, you can:

1. **For Tweet Card**: 
   - Use a similar style/quality
   - Create a simple Twitter post card design
   - Match the visual quality of your MacBook mockups

2. **For iPhone**:
   - Use a similar style/quality
   - Create an iPhone frame design
   - Match the visual quality of your MacBook mockups

## Testing After Adding Images

1. Start your development server: `npm run dev`
2. Navigate to the editor
3. Open the Style Tabs in the left panel
4. You should see the Mockup Selector section
5. Click on a mockup to apply it
6. Upload an image - it should appear within the safe zone

## Troubleshooting

### Image Not Showing
- Check file path: Should be `/public/mockups/filename.png`
- Check file name: Must match exactly (case-sensitive)
- Clear browser cache
- Check browser console for 404 errors

### Image Position Wrong
- Update safe zone coordinates in `lib/canvas/templates.ts`
- Safe zone should match the screen/content area of your mockup

### Image Quality Issues
- Use higher resolution images (2x or 3x)
- Ensure PNG format for transparency
- Optimize file size if needed (use tools like TinyPNG)

## Recommended Quick Solution

**Fastest way to get started:**

1. Go to **Figma Community**: https://www.figma.com/community
2. Search "iPhone mockup free" → Download a template → Export as PNG
3. Search "Twitter mockup" or "Tweet card" → Download a template → Export as PNG
4. Save both to `/public/mockups/` with the correct filenames
5. Test in your application

This should get you up and running in about 10-15 minutes!


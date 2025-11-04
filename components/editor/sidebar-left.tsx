'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useImageStore } from '@/lib/store';
import { ExportDialog } from '@/components/canvas/dialogs/ExportDialog';
import { StyleTabs } from './style-tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { uploadedImageUrl, selectedAspectRatio } = useImageStore();
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const handleExport = async (format: 'png' | 'jpg', quality: number, scale: number = 3): Promise<{ dataURL: string; blob: Blob }> => {
    // Wait a bit to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const element = document.getElementById('image-render-card');
    if (!element) {
      throw new Error('Image render card not found. Please ensure an image is uploaded.');
    }

    // Get actual pixel dimensions from aspect ratio preset
    const preset = getAspectRatioPreset(selectedAspectRatio);
    if (!preset) {
      throw new Error('Invalid aspect ratio selected');
    }
    
    // Use actual pixel dimensions for export
    // The scale parameter will multiply the resolution/quality
    const exportWidth = preset.width;
    const exportHeight = preset.height;

    // Wait for all images to load
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Image load timeout')), 5000);
      });
    });

    try {
      await Promise.all(imagePromises);
    } catch (error) {
      console.warn('Some images failed to load, continuing with export:', error);
    }

    // Use html2canvas directly with format options
    const html2canvas = (await import('html2canvas')).default;
    
    // Function to convert CSS variables and computed styles to RGB
    const convertStylesToRGB = (element: HTMLElement, doc: Document) => {
      // Get computed style from the cloned document's window
      const win = doc.defaultView || (doc as any).parentWindow;
      if (!win) return;
      
      try {
        const computedStyle = win.getComputedStyle(element);
        const allProps = [
          'color', 'backgroundColor', 'borderColor', 'borderTopColor',
          'borderRightColor', 'borderBottomColor', 'borderLeftColor',
          'outlineColor', 'boxShadow', 'textShadow', 'background',
          'backgroundImage', 'backgroundColor', 'fill', 'stroke'
        ];
        
        // Convert all relevant CSS properties
        allProps.forEach(prop => {
          try {
            const value = computedStyle.getPropertyValue(prop);
            if (value && (value.includes('oklch') || value.includes('var('))) {
              const computed = (computedStyle as any)[prop];
              if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent' && computed !== 'none' && !computed.includes('oklch')) {
                element.style.setProperty(prop, computed, 'important');
              }
            }
          } catch (e) {
            // Ignore errors for individual properties
          }
        });
        
        // Also check inline styles
        if (element.style && element.style.cssText) {
          const cssText = element.style.cssText;
          if (cssText.includes('oklch') || cssText.includes('var(')) {
            // Re-apply computed styles
            allProps.forEach(prop => {
              try {
                const computed = (computedStyle as any)[prop];
                if (computed && !computed.includes('oklch')) {
                  element.style.setProperty(prop, computed, 'important');
                }
              } catch (e) {
                // Ignore
              }
            });
          }
        }
      } catch (e) {
        // Ignore errors
      }
      
      // Convert all children recursively
      Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
          convertStylesToRGB(child, doc);
        }
      });
    };
    
    // Function to inject CSS overrides to replace oklch variables
    const injectRGBOverrides = (doc: Document) => {
      // Remove or disable stylesheets that might contain oklch
      const stylesheets = Array.from(doc.styleSheets);
      stylesheets.forEach((sheet) => {
        try {
          if (sheet.href && sheet.href.includes('globals.css')) {
            // Try to disable the stylesheet
            try {
              (sheet as any).disabled = true;
            } catch (e) {
              // Ignore
            }
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      });
      
      // Inject CSS overrides with high specificity
      const style = doc.createElement('style');
      style.id = 'oklch-rgb-converter';
      style.textContent = `
        :root, :root * {
          --background: rgb(255, 255, 255) !important;
          --foreground: rgb(33, 33, 33) !important;
          --card: rgb(255, 255, 255) !important;
          --card-foreground: rgb(33, 33, 33) !important;
          --popover: rgb(255, 255, 255) !important;
          --popover-foreground: rgb(33, 33, 33) !important;
          --primary: rgb(37, 37, 37) !important;
          --primary-foreground: rgb(251, 251, 251) !important;
          --secondary: rgb(247, 247, 247) !important;
          --secondary-foreground: rgb(37, 37, 37) !important;
          --muted: rgb(247, 247, 247) !important;
          --muted-foreground: rgb(140, 140, 140) !important;
          --accent: rgb(247, 247, 247) !important;
          --accent-foreground: rgb(37, 37, 37) !important;
          --destructive: rgb(239, 68, 68) !important;
          --border: rgb(237, 237, 237) !important;
          --input: rgb(237, 237, 237) !important;
          --ring: rgb(180, 180, 180) !important;
          --sidebar: rgb(251, 251, 251) !important;
          --sidebar-foreground: rgb(33, 33, 33) !important;
          --sidebar-primary: rgb(37, 37, 37) !important;
          --sidebar-primary-foreground: rgb(251, 251, 251) !important;
          --sidebar-accent: rgb(247, 247, 247) !important;
          --sidebar-accent-foreground: rgb(37, 37, 37) !important;
          --sidebar-border: rgb(237, 237, 237) !important;
          --sidebar-ring: rgb(180, 180, 180) !important;
        }
        *:not(img) {
          border-color: rgb(237, 237, 237) !important;
          outline-color: rgba(180, 180, 180, 0.5) !important;
        }
      `;
      
      const head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
      if (head) {
        // Insert at the beginning to ensure it overrides
        head.insertBefore(style, head.firstChild);
      }
    };
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: scale, // Scale multiplies the resolution/quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc, clonedElement) => {
          // Inject CSS overrides first - this replaces all oklch CSS variables
          injectRGBOverrides(clonedDoc);
          
          // Get the target element
          const targetElement = clonedDoc.getElementById('image-render-card') || clonedElement;
          
          if (targetElement) {
            (targetElement as HTMLElement).style.width = `${exportWidth}px`;
            (targetElement as HTMLElement).style.height = `${exportHeight}px`;
            (targetElement as HTMLElement).style.maxWidth = 'none';
            (targetElement as HTMLElement).style.maxHeight = 'none';
            
            // Also ensure parent containers don't constrain the size
            let parent = targetElement.parentElement;
            while (parent && parent !== clonedDoc.body) {
              if (parent.style) {
                parent.style.width = 'auto';
                parent.style.height = 'auto';
                parent.style.maxWidth = 'none';
                parent.style.maxHeight = 'none';
                parent.style.display = 'flex';
                parent.style.alignItems = 'center';
                parent.style.justifyContent = 'center';
              }
              parent = parent.parentElement;
            }
            // Ensure all images are loaded in the cloned document
            const images = targetElement.getElementsByTagName('img');
            Array.from(images).forEach((img) => {
              // Force display for images that might be hidden
              if (img.style.display === 'none') {
                img.style.display = '';
              }
              
              // Preserve border styles - get from original document and apply with !important
              const originalImg = document.querySelector(`img[src="${img.getAttribute('src')}"]`);
              if (originalImg && originalImg instanceof HTMLElement) {
                const originalStyle = window.getComputedStyle(originalImg);
                
                // Get border properties and colors separately to ensure they're properly converted
                const borderTop = originalStyle.borderTop;
                const borderRight = originalStyle.borderRight;
                const borderBottom = originalStyle.borderBottom;
                const borderLeft = originalStyle.borderLeft;
                const borderRadius = originalStyle.borderRadius;
                const boxShadow = originalStyle.boxShadow;
                const opacity = originalStyle.opacity;
                const transform = originalStyle.transform;
                
                // Get border colors separately to ensure they're properly converted
                const borderTopColor = originalStyle.borderTopColor;
                const borderRightColor = originalStyle.borderRightColor;
                const borderBottomColor = originalStyle.borderBottomColor;
                const borderLeftColor = originalStyle.borderLeftColor;
                
                if (borderTop && borderTop !== '0px none rgb(0, 0, 0)' && borderTop !== '0px none') {
                  // Extract border width and style from borderTop
                  const borderTopWidth = originalStyle.borderTopWidth;
                  const borderTopStyle = originalStyle.borderTopStyle;
                  if (borderTopWidth !== '0px' && borderTopStyle !== 'none') {
                    const borderValue = `${borderTopWidth} ${borderTopStyle} ${borderTopColor}`;
                    img.style.setProperty('border-top', borderValue, 'important');
                  }
                }
                if (borderRight && borderRight !== '0px none rgb(0, 0, 0)' && borderRight !== '0px none') {
                  const borderRightWidth = originalStyle.borderRightWidth;
                  const borderRightStyle = originalStyle.borderRightStyle;
                  if (borderRightWidth !== '0px' && borderRightStyle !== 'none') {
                    const borderValue = `${borderRightWidth} ${borderRightStyle} ${borderRightColor}`;
                    img.style.setProperty('border-right', borderValue, 'important');
                  }
                }
                if (borderBottom && borderBottom !== '0px none rgb(0, 0, 0)' && borderBottom !== '0px none') {
                  const borderBottomWidth = originalStyle.borderBottomWidth;
                  const borderBottomStyle = originalStyle.borderBottomStyle;
                  if (borderBottomWidth !== '0px' && borderBottomStyle !== 'none') {
                    const borderValue = `${borderBottomWidth} ${borderBottomStyle} ${borderBottomColor}`;
                    img.style.setProperty('border-bottom', borderValue, 'important');
                  }
                }
                if (borderLeft && borderLeft !== '0px none rgb(0, 0, 0)' && borderLeft !== '0px none') {
                  const borderLeftWidth = originalStyle.borderLeftWidth;
                  const borderLeftStyle = originalStyle.borderLeftStyle;
                  if (borderLeftWidth !== '0px' && borderLeftStyle !== 'none') {
                    const borderValue = `${borderLeftWidth} ${borderLeftStyle} ${borderLeftColor}`;
                    img.style.setProperty('border-left', borderValue, 'important');
                  }
                }
                if (borderRadius && borderRadius !== '0px') {
                  img.style.setProperty('border-radius', borderRadius, 'important');
                }
                if (boxShadow && boxShadow !== 'none') {
                  // Convert box-shadow colors if needed
                  // Box shadow might contain color values that need conversion
                  img.style.setProperty('box-shadow', boxShadow, 'important');
                }
                if (opacity && opacity !== '1') {
                  img.style.setProperty('opacity', opacity, 'important');
                }
                if (transform && transform !== 'none') {
                  img.style.setProperty('transform', transform, 'important');
                }
              }
            });
            
            // Convert SVG elements fill/stroke attributes
            const svgElements = targetElement.querySelectorAll('svg, [fill], [stroke]');
            svgElements.forEach((svg) => {
              if (svg instanceof HTMLElement || svg instanceof SVGElement) {
                const fill = svg.getAttribute('fill');
                const stroke = svg.getAttribute('stroke');
                
                if (fill && (fill.includes('oklch') || fill.includes('var('))) {
                  const temp = clonedDoc.createElement('div');
                  temp.style.color = fill;
                  const computed = clonedDoc.defaultView?.getComputedStyle(temp).color;
                  if (computed && !computed.includes('oklch')) {
                    svg.setAttribute('fill', computed);
                  }
                  temp.remove();
                }
                
                if (stroke && (stroke.includes('oklch') || stroke.includes('var('))) {
                  const temp = clonedDoc.createElement('div');
                  temp.style.color = stroke;
                  const computed = clonedDoc.defaultView?.getComputedStyle(temp).color;
                  if (computed && !computed.includes('oklch')) {
                    svg.setAttribute('stroke', computed);
                  }
                  temp.remove();
                }
              }
            });
            
            // Convert all CSS variables and oklch colors to RGB - convert ALL elements recursively
            // But preserve border colors on img elements
            const allElements = targetElement.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement || el instanceof SVGElement) {
                // Skip img elements - their border colors are already preserved above
                if (el.tagName.toLowerCase() !== 'img') {
                  convertStylesToRGB(el as HTMLElement, clonedDoc);
                } else {
                  // For img elements, only convert non-border properties
                  const imgEl = el as HTMLElement;
                  const win = clonedDoc.defaultView || (clonedDoc as any).parentWindow;
                  if (win) {
                    try {
                      const computedStyle = win.getComputedStyle(imgEl);
                      // Convert only non-border properties
                      const nonBorderProps = [
                        'color', 'backgroundColor', 'outlineColor', 
                        'background', 'backgroundImage', 'fill', 'stroke'
                      ];
                      nonBorderProps.forEach(prop => {
                        try {
                          const value = computedStyle.getPropertyValue(prop);
                          if (value && (value.includes('oklch') || value.includes('var('))) {
                            const computed = (computedStyle as any)[prop];
                            if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent' && computed !== 'none' && !computed.includes('oklch')) {
                              imgEl.style.setProperty(prop, computed, 'important');
                            }
                          }
                        } catch (e) {
                          // Ignore errors for individual properties
                        }
                      });
                    } catch (e) {
                      // Ignore errors
                    }
                  }
                }
              }
            });
            
            // Also convert the root element itself
            convertStylesToRGB(targetElement as HTMLElement, clonedDoc);
            
            // Force a reflow to ensure styles are applied
            void clonedDoc.defaultView?.getComputedStyle(targetElement).width;
          }
        },
      });

      if (!canvas) {
        throw new Error('Failed to create canvas');
      }

      // Convert canvas to blob and data URL with specified format
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      
      // Create blob first for better quality storage
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          resolve(blob);
        }, mimeType, quality);
      });
      
      // Also create data URL for immediate download
      const dataURL = canvas.toDataURL(mimeType, quality);
      
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Failed to generate image data URL');
      }

      return { dataURL, blob };
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <Sidebar className="border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl" {...props}>
        <SidebarHeader className="p-6 border-b border-sidebar-border">
          <Button
            onClick={() => setExportDialogOpen(true)}
            disabled={!uploadedImageUrl}
            className="w-full"
            size="lg"
            variant="default"
          >
            Export Image
          </Button>
        </SidebarHeader>
        <SidebarContent className="px-6 py-7 space-y-6 overflow-x-hidden">
          <StyleTabs />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </>
  );
}

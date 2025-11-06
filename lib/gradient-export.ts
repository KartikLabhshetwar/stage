'use client';

// Export gradient as JSON
export function exportGradientAsJSON(gradient: string, name: string = 'gradient'): void {
  const data = {
    name,
    gradient,
    exportedAt: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export gradient as CSS
export function exportGradientAsCSS(gradient: string, name: string = 'gradient'): void {
  const css = `.${name.replace(/\s+/g, '-').toLowerCase()} {\n  background: ${gradient};\n}`;
  
  const blob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-')}.css`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copy gradient to clipboard
export async function copyGradientToClipboard(gradient: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(gradient);
  } catch (error) {
    console.error('Failed to copy gradient:', error);
    throw error;
  }
}


"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore, useImageStore } from "@/lib/store";
import { Loader2, Globe } from "lucide-react";

export function WebsiteScreenshotInput() {
  const [url, setUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setScreenshot } = useEditorStore();
  const { setImage } = useImageStore();

  const normalizeUrl = (urlString: string): string => {
    let normalized = urlString.trim();

    // Remove leading/trailing whitespace
    normalized = normalized.trim();

    // If URL doesn't start with http:// or https://, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  };

  const validateUrl = (
    urlString: string,
  ): { valid: boolean; normalized?: string; error?: string } => {
    try {
      const normalized = normalizeUrl(urlString);
      const urlObj = new URL(normalized);

      // Ensure URL has http or https protocol
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return { valid: false, error: "URL must use http or https protocol" };
      }

      // Basic validation - must have a hostname
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return {
          valid: false,
          error: "Please enter a valid URL with a domain name",
        };
      }

      return { valid: true, normalized };
    } catch (error) {
      return {
        valid: false,
        error:
          "Please enter a valid URL (e.g., example.com or https://example.com)",
      };
    }
  };

  const handleCapture = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Validate and normalize URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || "Please enter a valid URL");
      return;
    }

    const finalUrl = validation.normalized!;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: finalUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to capture screenshot");
      }

      // Convert base64 to blob URL
      const base64Data = data.screenshot;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      // Create a File object from the blob
      const file = new File([blob], "screenshot.png", { type: "image/png" });

      // Update stores immediately
      setScreenshot({ src: blobUrl });
      setImage(file);

      // Clear form
      setUrl("");
    } catch (error) {
      console.error("Screenshot error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to capture screenshot. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleCapture();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="website-url" className="text-sm font-medium">
          Website URL
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="website-url"
              type="url"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onBlur={(e) => {
                // Auto-normalize URL when user leaves the input field
                const value = e.target.value.trim();
                if (value) {
                  const validation = validateUrl(value);
                  if (
                    validation.valid &&
                    validation.normalized &&
                    validation.normalized !== value
                  ) {
                    setUrl(validation.normalized);
                  }
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleCapture}
            disabled={isLoading || !url.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Capturing...
              </>
            ) : (
              "Capture"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a website URL to capture a viewport screenshot (visible browser
          area). https:// will be added automatically if missing.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-xs sm:text-sm text-destructive">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-muted p-8 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Capturing screenshot...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This may take a few seconds
          </p>
        </div>
      )}
    </div>
  );
}

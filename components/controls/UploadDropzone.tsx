"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FaImage } from "react-icons/fa";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { useEditorStore, useImageStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WebsiteScreenshotInput } from "./WebsiteScreenshotInput";

export function UploadDropzone() {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setScreenshot } = useEditorStore();
  const { addImages } = useImageStore();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const validateFile = React.useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(
        ", "
      )}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${
        MAX_IMAGE_SIZE / 1024 / 1024
      }MB`;
    }
    return null;
  }, []);
  const handleFile = React.useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const imageUrl = URL.createObjectURL(file);

      // IMPORTANT: keep screenshot for canvas
      setScreenshot({ src: imageUrl });
    },
    [validateFile, setScreenshot]
  );

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      // add all images to slideshow
      addImages(acceptedFiles);

      // set first image as active canvas image
      handleFile(acceptedFiles[0]);
    },
    [addImages, handleFile]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
    onDragEnter: () => {
      setIsDragActive(true);
      setError(null);
    },
    onDragLeave: () => setIsDragActive(false),
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError(
            `File size too large. Maximum size is ${
              MAX_IMAGE_SIZE / 1024 / 1024
            }MB`
          );
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          setError(
            `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(
              ", "
            )}`
          );
        } else {
          setError("Failed to upload file. Please try again.");
        }
      }
    },
  });

  // Handle paste event
  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!containerRef.current) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.startsWith("image/")) {
          e.preventDefault();

          const file = item.getAsFile();
          if (file) {
            addImages([file]);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [addImages]);

  const active = isDragActive || dropzoneActive;

  return (
    <div ref={containerRef} className="w-full max-w-lg mx-auto">
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Upload Image
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Drag and drop, paste, or click to upload an image
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-12 p-1.5 gap-1.5 border border-border">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-black/20 rounded-md border-0 data-[state=active]:border-2 data-[state=active]:border-border transition-all duration-200"
            >
              Upload Image
            </TabsTrigger>
            <TabsTrigger
              value="screenshot"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-black/20 rounded-md border-0 data-[state=active]:border-2 data-[state=active]:border-border transition-all duration-200"
            >
              Website Screenshot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 sm:p-12 md:p-16",
                "cursor-pointer transition-all duration-200",
                "flex flex-col items-center justify-center",
                "min-h-[240px] sm:min-h-[280px]",
                active
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-accent/50",
                error && "border-destructive"
              )}
            >
              <input {...getInputProps()} />

              <div
                className={cn(
                  "mb-4 sm:mb-6 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <FaImage size={48} className="sm:hidden" />
                <FaImage size={56} className="hidden sm:block" />
              </div>

              {active ? (
                <p className="text-sm sm:text-base font-medium text-primary">
                  Drop the image here...
                </p>
              ) : (
                <div className="space-y-2 text-center px-2">
                  <p className="text-sm sm:text-base font-medium">
                    Drag & drop an image here
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    or tap to browse • PNG, JPG, WEBP up to{" "}
                    {MAX_IMAGE_SIZE / 1024 / 1024}MB • or paste an image
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 sm:p-4 mt-4">
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="screenshot" className="mt-6">
            <WebsiteScreenshotInput />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

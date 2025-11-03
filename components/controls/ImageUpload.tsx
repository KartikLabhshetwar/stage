"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/hooks/useCanvas";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { CloudArrowUp, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageUploaded?: (file: File, url: string) => void;
  className?: string;
}

export function ImageUpload({ onImageUploaded, className }: ImageUploadProps) {
  const { operations } = useCanvas();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const url = URL.createObjectURL(file);
      setUploadedFile(file);
      setPreviewUrl(url);

      // Add image to canvas
      try {
        await operations.addImage(url);
        onImageUploaded?.(file, url);
      } catch (err) {
        setError("Failed to load image. Please try again.");
        console.error(err);
      }
    },
    [operations, validateFile, onImageUploaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0]);
      }
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  const removeImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
    operations.deleteObject(undefined);
  }, [previewUrl, operations]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>Drag and drop or click to upload</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              error && "border-destructive"
            )}
          >
            <input {...getInputProps()} />
            <CloudArrowUp className="mx-auto mb-4 text-gray-400" size={48} weight="regular" />
            {isDragActive ? (
              <p className="text-sm">Drop the image here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X size={16} weight="regular" />
              </Button>
            </div>
            {uploadedFile && (
              <p className="text-xs text-muted-foreground">
                {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageSquare as ImageIcon } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (imageUrl: string) => Promise<void>;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setUploadError(null);
      
      // Use blob URL for maximum quality - persistence handled via IndexedDB
      const blobUrl = URL.createObjectURL(file);
      
      try {
        await onUpload(blobUrl);
        onOpenChange(false);
      } catch (err) {
        setUploadError("Failed to load image. Please try again.");
        console.error(err);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Upload Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-10 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center touch-manipulation ${
              isDragActive
                ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className={`mb-3 sm:mb-4 transition-colors flex items-center justify-center w-full ${isDragActive ? "text-blue-500" : "text-gray-400"}`}>
              <ImageIcon size={48} weight="duotone" className="sm:w-14 sm:h-14" />
            </div>
            {isDragActive ? (
              <p className="text-sm font-medium text-blue-600 text-center">Drop the image here...</p>
            ) : (
              <div className="space-y-2 text-center px-2">
                <p className="text-sm font-semibold text-gray-700">
                  Drag & drop an image here
                </p>
                <p className="text-xs text-gray-500">
                  or tap to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                </p>
              </div>
              )}
            </div>
            {uploadError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {uploadError}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }


"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvasContext } from "../CanvasContext";
import { useRouter } from "next/navigation";

interface SaveDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId?: string; // If provided, this is an update operation
  designName?: string; // Existing design name if updating
}

export function SaveDesignDialog({
  open,
  onOpenChange,
  designId,
  designName,
}: SaveDesignDialogProps) {
  const { saveDesign } = useCanvasContext();
  const [name, setName] = useState(designName || "");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Update name when designName prop changes
  useEffect(() => {
    if (designName) {
      setName(designName);
    }
  }, [designName]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Design name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Get canvas data and preview
      const { canvasData, previewUrl } = await saveDesign();

      // Save to API
      const url = designId ? `/api/designs/${designId}` : "/api/designs";
      const method = designId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          canvasData,
          previewUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save design");
      }

      // Close dialog and refresh
      onOpenChange(false);
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      console.error("Error saving design:", err);
      setError(err instanceof Error ? err.message : "Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {designId ? "Update Design" : "Save Design"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label
              htmlFor="design-name"
              className="text-sm font-medium mb-2 block"
            >
              Design Name *
            </label>
            <Input
              id="design-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Design"
              disabled={isSaving}
            />
          </div>
          <div>
            <label
              htmlFor="design-description"
              className="text-sm font-medium mb-2 block"
            >
              Description (optional)
            </label>
            <Input
              id="design-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your design"
              disabled={isSaving}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? "Saving..." : designId ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

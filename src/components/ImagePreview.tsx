"use client";

import type { FC } from "react";

interface ImagePreviewProps {
  file?: File;
  previewUrl?: string;
  onRetake: () => void;
}

const ImagePreview: FC<ImagePreviewProps> = ({ file, previewUrl, onRetake }) => {
  if (!file) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 text-xs text-slate-500">
        No photo selected yet.
      </div>
    );
  }

  const sizeKb = Math.round(file.size / 1024);

  return (
    <div className="space-y-2">
      {previewUrl && (
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-black/60">
          {/* Browser handles orientation from modern cameras via EXIF; for MVP we rely on that. */}
          <img
            src={previewUrl}
            alt="Uploaded item preview"
            className="max-h-64 w-full object-contain bg-black"
          />
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{file.name}</span>
        <span>{sizeKb} KB</span>
      </div>
      <button
        type="button"
        onClick={onRetake}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
      >
        Retake / choose another photo
      </button>
    </div>
  );
};

export default ImagePreview;

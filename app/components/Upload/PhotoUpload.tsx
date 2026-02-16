"use client";

import React from "react";
import DragDropFile from "@/components/Upload/DragDropFile";

export interface PhotoUploadProps {
  previewUrl: string;
  onFileSelect: (file: File | null) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  label?: string;
  isMandatory?: boolean;
  error?: string;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  previewUrl,
  onFileSelect,
  onFileRemove,
  disabled = false,
  label = "Foto Profil",
  isMandatory = false,
  error,
  className = "",
}) => {
  return (
    <div className={`form-item ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {isMandatory && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-4">
        {/* Image Preview */}
        {/* {previewUrl && (
          <div className="relative w-fit">
            <Image
              src={previewUrl}
              alt="Preview"
              width={120}
              height={120}
              className="rounded-lg object-cover border-2 border-gray-200"
            />
            {!disabled && (
              <button
                type="button"
                onClick={onFileRemove}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-md"
                aria-label="Remove photo"
              >
                <LuX size={16} />
              </button>
            )}
          </div>
        )} */}

        {/* Drag Drop File */}
        <DragDropFile
          accept="image/*"
          multiple={false}
          disabled={disabled}
          onFile={(file) => onFileSelect(file || null)}
          previewUrl={previewUrl || undefined}
          showPreview={true}
          onRemove={onFileRemove}
          onValidate={(file) => {
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
              return "Ukuran file maksimal 5MB";
            }
            // Validate file type
            if (!file.type.startsWith("image/")) {
              return "File harus berupa gambar";
            }
            return null;
          }}
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Helper Text */}
        <p className="text-xs text-gray-500">
          Format: JPG, PNG, GIF. Ukuran maksimal: 5MB
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;

import { TextButton } from "@/components/Buttons/TextButton";
import React, { useRef, useState } from "react";
import { LuFileText, LuUpload } from "react-icons/lu";

export interface DragDropFileProps {
  accept?: string; // e.g. "image/*,application/pdf"
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  previewUrl?: string | null; // existing file url (remote or previously uploaded)
  initialFile?: File | null;
  label?: string;
  description?: string;
  textButton?: string;
  className?: string;
  showPreview?: boolean;
  onFiles?: (files: File[]) => void;
  onFile?: (file: File | null) => void;
  onValidate?: (file: File) => string | null;
  onRemove?: () => void;
}

export default function DragDropFile({
  accept = "image/*",
  multiple = false,
  maxFiles = 1,
  disabled = false,
  previewUrl = null,
  initialFile = null,
  className = "",
  showPreview = true,
  textButton = "Ganti Foto",
  onFiles,
  onFile,
  onValidate,
  onRemove,
}: DragDropFileProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevBlobRef = React.useRef<string | null>(null);

  const getFileKindFromName = (name?: string | null) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    if (ext === "png") return "png";
    if (ext === "pdf") return "pdf";
    // if (ext === "doc") return "doc";
    // if (ext === "docx") return "docx";
    return null;
  };

  const getFileKindFromFile = (file: File | null) => {
    if (!file) return null;
    const mime = file.type.toLowerCase();
    if (mime === "image/png") return "png";
    if (mime === "application/pdf") return "pdf";
    // if (mime === "application/msword") return "doc";
    // if (
    //   mime ===
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // )
    //   return "docx";

    return getFileKindFromName(file.name);
  };

  const getFileKindFromUrl = (url: string | null) => {
    if (!url) return null;
    const cleanUrl = url.split("?")[0].split("#")[0];
    return getFileKindFromName(cleanUrl);
  };

  const selectedFileKind =
    getFileKindFromFile(selectedFile) ?? getFileKindFromUrl(selectedPreviewUrl);
  const isImagePreview = selectedFileKind === "png";
  const fileTypeLabel = selectedFileKind
    ? selectedFileKind.toUpperCase()
    : "FILE";

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, maxFiles);

    // validate first file (or all files for multiple)
    if (onValidate) {
      for (const f of arr) {
        const err = onValidate(f);
        if (err) {
          setError(err);
          if (onFile) onFile(null);
          if (onFiles) onFiles([]);
          return;
        }
      }
    }

    setError(null);
    const first = arr[0] ?? null;

    if (prevBlobRef.current) {
      URL.revokeObjectURL(prevBlobRef.current);
      prevBlobRef.current = null;
    }

    if (first) {
      setSelectedFile(first);
      const url = URL.createObjectURL(first);
      prevBlobRef.current = url;
      setSelectedPreviewUrl(url);
    }

    if (multiple) {
      onFiles?.(arr);
    } else {
      onFile?.(first);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ""; // reset so same file can be reselected
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Keep component controlled by parent previewUrl / initialFile
  // When parent clears previewUrl and initialFile we clear internal state
  React.useEffect(() => {
    if (initialFile) {
      if (prevBlobRef.current) {
        URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = null;
      }
      setSelectedFile(initialFile);
      const u = URL.createObjectURL(initialFile);
      prevBlobRef.current = u;
      setSelectedPreviewUrl(u);
      setError(null);
      return;
    }

    if (
      typeof previewUrl === "string" &&
      (previewUrl.startsWith("blob:") || previewUrl.startsWith("data:"))
    ) {
      if (prevBlobRef.current) {
        URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = null;
      }
      setSelectedFile(null);
      setSelectedPreviewUrl(previewUrl);
      setError(null);
      return;
    }

    if (typeof previewUrl === "string" && previewUrl.trim().length > 0) {
      setSelectedFile(null);
      setSelectedPreviewUrl(previewUrl);
      setError(null);
      return;
    }

    if (!initialFile) {
      if (prevBlobRef.current) {
        URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = null;
      }
      setSelectedPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [initialFile, previewUrl]);

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (prevBlobRef.current) {
        URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = null;
      }
    };
  }, []);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => {
    setDragging(false);
  };

  const pickFile = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const removeFile = () => {
    if (prevBlobRef.current) {
      URL.revokeObjectURL(prevBlobRef.current);
      prevBlobRef.current = null;
    }
    setSelectedPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    onFile?.(null);
    onFiles?.([]);
    onRemove?.();
  };

  return (
    <div className={`${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={pickFile}
        onKeyDown={(e) => e.key === "Enter" && pickFile()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        className={`w-full h-full flex flex-col border-2 border-dashed rounded-xl justify-center items-center bg-gray-100 p-2 cursor-pointer transition-all duration-150 ${
          dragging ? "bg-green-50 border-green-300" : ""
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
        />

        {selectedPreviewUrl && showPreview ? (
          <div className="w-full flex flex-col items-center gap-2">
            {isImagePreview ? (
              <img
                src={selectedPreviewUrl}
                alt={selectedFile?.name ?? "preview"}
                className="max-w-48 max-h-64 object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-700">
                <LuFileText className="text-6xl text-gray-500" />
                <div className="text-sm font-semibold">
                  Jenis File: {fileTypeLabel}
                </div>
                <p className="text-sm">{selectedFile?.name}</p>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <TextButton
                variant="primary"
                text={textButton}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col text-primary">
            <LuUpload className="text-5xl mb-2" />
            <TextButton text={textButton} className="font-semibold" />
            <div className="text-base text-gray-600 mt-2">
              Seret dan Lepas dokumen
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <span className="text-red-500">*</span> Jenis file yang didukung:
              JPG/PNG/PDF
            </div>
            {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

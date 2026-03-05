"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { LuGripVertical, LuImagePlus, LuTrash2 } from "react-icons/lu";

export interface MultipleImageItem {
  clientId: string;
  id?: number;
  previewUrl: string;
  file?: File;
  order: number;
}

interface MultipleImageUploaderProps {
  label?: string;
  items: MultipleImageItem[];
  onChange: (nextItems: MultipleImageItem[]) => void;
  disabled?: boolean;
  isLoadingAddButton?: boolean;
  isMandatory?: boolean;
  error?: string;
  className?: string;
  maxItems?: number;
  maxSizeInMB?: number;
  onValidationError?: (message: string) => void;
}

const MAX_SIZE_DEFAULT = 5;

const normalizeOrder = (items: MultipleImageItem[]) =>
  items.map((item, index) => ({ ...item, order: index }));

const isAllowedImageMime = (mimeType: string) =>
  ["image/png", "image/jpeg", "image/jpg"].includes(mimeType.toLowerCase());

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });

const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function MultipleImageUploader({
  label = "Foto Kegiatan",
  items,
  onChange,
  disabled = false,
  isLoadingAddButton = false,
  isMandatory = false,
  error,
  className = "",
  maxItems,
  maxSizeInMB = MAX_SIZE_DEFAULT,
  onValidationError,
}: MultipleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draggingClientId, setDraggingClientId] = useState<string | null>(null);

  const canAddMore = !maxItems || items.length < maxItems;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items],
  );

  const emitChange = (nextItems: MultipleImageItem[]) => {
    onChange(normalizeOrder(nextItems));
  };

  const reorderItems = (sourceClientId: string, targetClientId: string) => {
    if (disabled || sourceClientId === targetClientId) {
      return;
    }

    const fromIndex = sortedItems.findIndex(
      (item) => item.clientId === sourceClientId,
    );
    const toIndex = sortedItems.findIndex(
      (item) => item.clientId === targetClientId,
    );

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const next = [...sortedItems];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    emitChange(next);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    clientId: string,
  ) => {
    if (disabled) {
      return;
    }

    setDraggingClientId(clientId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clientId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetClientId: string,
  ) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const sourceClientId =
      event.dataTransfer.getData("text/plain") || draggingClientId;

    if (!sourceClientId) {
      return;
    }

    reorderItems(sourceClientId, targetClientId);
    setDraggingClientId(null);
  };

  const handleDragEnd = () => {
    setDraggingClientId(null);
  };

  const removeItem = (clientId: string) => {
    if (disabled) {
      return;
    }

    emitChange(sortedItems.filter((item) => item.clientId !== clientId));
  };

  const handleFileSelection = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled || !canAddMore) {
      return;
    }

    try {
      const selectedFiles = Array.from(files);
      const availableSlots = maxItems
        ? Math.max(0, maxItems - sortedItems.length)
        : selectedFiles.length;
      const limitedFiles = selectedFiles.slice(0, availableSlots);

      const nextImages: MultipleImageItem[] = [];

      for (const file of limitedFiles) {
        if (!isAllowedImageMime(file.type)) {
          onValidationError?.("Format file harus png, jpg, atau jpeg");
          continue;
        }

        if (file.size > maxSizeInMB * 1024 * 1024) {
          onValidationError?.(`Ukuran file maksimal ${maxSizeInMB}MB`);
          continue;
        }

        const previewUrl = await readFileAsDataUrl(file);

        nextImages.push({
          clientId: createClientId("gallery"),
          previewUrl,
          file,
          order: sortedItems.length + nextImages.length,
        });
      }

      if (nextImages.length > 0) {
        emitChange([...sortedItems, ...nextImages]);
      }
    } catch (fileError) {
      console.error("Failed to process gallery images", fileError);
      onValidationError?.("Gagal memproses file gambar");
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2">
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        className="hidden"
        disabled={disabled || isLoadingAddButton || !canAddMore}
        onChange={(event) => {
          handleFileSelection(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="flex flex-row w-full flex-wrap gap-4">
        {sortedItems.map((item, index) => (
          <div
            key={item.clientId}
            draggable={!disabled}
            onDragStart={(event) => handleDragStart(event, item.clientId)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, item.clientId)}
            onDragEnd={handleDragEnd}
            className={`relative w-64 rounded-sm border border-gray-300 bg-white p-2 ${
              disabled ? "" : "cursor-move"
            } ${draggingClientId === item.clientId ? "opacity-60" : ""}`}
          >
            <Image
              src={item.previewUrl}
              alt={`Gallery ${index + 1}`}
              className="h-32 w-full rounded border border-gray-300 object-cover"
              width={1200}
              height={800}
              unoptimized
              loading="lazy"
            />

            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 text-gray-500">
                <LuGripVertical className="text-sm" />
              </div>
              <button
                type="button"
                className="rounded border border-red-300 p-1 text-red-500 hover:bg-red-50 disabled:opacity-40"
                disabled={disabled}
                onClick={() => removeItem(item.clientId)}
              >
                <LuTrash2 className="text-sm" />
              </button>
            </div>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isLoadingAddButton}
            className="h-32 w-64 rounded-sm border-2 border-dashed border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            {isLoadingAddButton ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
                <span className="text-xs font-medium">Mengunggah...</span>
              </>
            ) : (
              <>
                <LuImagePlus className="text-2xl" />
                <span className="text-xs font-medium">Tambah Foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Format: JPG, JPEG, PNG • Maksimal {maxSizeInMB}MB per file
        {maxItems ? ` • Maksimal ${maxItems} foto` : ""}
      </p>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

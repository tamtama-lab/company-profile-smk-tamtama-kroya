"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  AiOutlineZoomIn,
  AiOutlineZoomOut,
} from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiResetLeftLine } from "react-icons/ri";

interface ImageZoomModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  imageSrc,
  imageAlt,
  onClose,
}) => {
  const [zoom, setZoom] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 300;
  const ZOOM_STEP = 25;

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Download current image
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = imageAlt || "image";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab if blob download fails
      window.open(imageSrc, "_blank");
      console.error("Failed to download image", error);
    }
  }, [imageAlt, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, zoomIn, zoomOut, resetZoom]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center text-xl max-md:text-base justify-center z-1000"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-screen md:w-[70vw] lg:w-[60vw] sm:max-w-screen sm:w-screen md:max-w-screen max-h-[90vh] flex sm:flex-col max-md:flex-col lg:flex-row p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {/* <div className="hidden justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{imageAlt}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <AiOutlineClose size={24} />
          </button>
        </div> */}

        {/* Image Container */}
        <div className="flex-1 flex items-center text-xl max-md:text-base justify-center overflow-auto bg-gray-200 p-4">
          <div
            className="relative cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom / 100}) translate(${offset.x}px, ${offset.y}px)`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={600}
              height={800}
              priority
              className="rounded transition-transform duration-200 select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Controls Footer */}
        <div className="flex sm:flex-row md:flex-row lg:flex-col justify-between items-center gap-4 border-t border-white bg-white pl-4 sm:pl-0 md:pl-0 lg:pl-4 pt-4 sm:pt-2 md:pt-2 lg:pt-4">
          <button
            onClick={onClose}
            className="flex items-center text-xl max-md:text-base gap-2 p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <IoClose />
          </button>
          <div className="h-full flex sm:flex-row md:flex-row lg:flex-col justify-center items-center gap-4">
            <button
              onClick={zoomIn}
              disabled={zoom === MAX_ZOOM}
              className="flex items-center text-xl max-md:text-base gap-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <AiOutlineZoomIn />
            </button>

            <div className="flex items-center text-xl max-md:text-base p-2 gap-2 bg-gray-200 rounded-lg w-fit justify-center">
              <span className="font-semibold text-gray-700">{zoom}%</span>
            </div>
            <button
              onClick={zoomOut}
              disabled={zoom === MIN_ZOOM}
              className="flex items-center text-xl max-md:text-base gap-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <AiOutlineZoomOut />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              <RiResetLeftLine />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <MdOutlineFileDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

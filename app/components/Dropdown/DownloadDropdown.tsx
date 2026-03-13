"use client";

import { useEffect, useRef, useState } from "react";
import { LuDownload, LuFileSpreadsheet, LuFileText } from "react-icons/lu";

export interface DownloadDropdownProps {
  onDownloadExcel?: () => void;
  onDownloadPdf?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DownloadDropdown({
  onDownloadExcel,
  onDownloadPdf,
  disabled = false,
  className = "",
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none"
      >
        <span>Unduh Data</span>
        <svg
          className={`ml-0.5 h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Format Unduhan
          </div>
          <div className="h-px bg-gray-100" />

          {/* Excel option */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDownloadExcel?.();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-600">
              <LuFileSpreadsheet className="text-base" />
            </span>
            <div className="text-left">
              <p className="font-medium leading-none">Excel</p>
              <p className="mt-0.5 text-[11px] text-gray-400">Format .xlsx</p>
            </div>
          </button>

          {/* PDF option */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDownloadPdf?.();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-500">
              <LuFileText className="text-base" />
            </span>
            <div className="text-left">
              <p className="font-medium leading-none">PDF</p>
              <p className="mt-0.5 text-[11px] text-gray-400">Format .pdf</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

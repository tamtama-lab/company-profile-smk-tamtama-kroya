"use client";

import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: ReactNode | null;
  hiddenOverlay?: boolean;
}

const sizeClasses = {
  sm: "max-w-xs",
  md: "max-w-md md:w-[50vw]",
  lg: "max-w-lg md:w-[60vw]",
  xl: "max-w-xl md:w-[70vw]",
  full: "max-w-screen md:w-[70vw] lg:w-[60vw]",
};

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = "",
  contentClassName = "",
  hiddenOverlay = false,
  size = "lg",
  footer = null,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className={`fixed inset-0${hiddenOverlay ? "" : " bg-black/70"} flex items-center justify-center z-9000 ${className}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl max-h-[90vh] w-fit max-w-[80vw] min-h-fit h-fit max-sm:w-[90vw] overflow-hidden flex flex-col ${sizeClasses[size]} max-md:flex-col max-md:max-w-[90vw] max-2xl:w-1/2 ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full">
          {(title || showCloseButton) && (
            <div className="w-full p-3 pb-0 max-sm:p-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg max-sm:text-xs font-semibold text-primary">
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 max-sm:p-1 hover:bg-gray-100 rounded-full transition-colors text-2xl max-sm:text-xl"
                    aria-label="Close modal"
                  >
                    <IoClose />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 w-full pt-0 h-[80%]">{children}</div>
        {footer && <div className="p-4 border-t border-gray-300">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

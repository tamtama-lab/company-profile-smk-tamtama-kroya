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
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md md:w-[50vw]",
  lg: "max-w-lg md:w-[60vw]",
  xl: "max-w-xl md:w-[70vw]",
  full: "max-w-screen md:w-[70vw] lg:w-[60vw]",
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = "",
  contentClassName = "",
  size = "lg",
  footer = null,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-1000 ${className}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col ${sizeClasses[size]} sm:max-w-screen sm:w-screen max-md:flex-col max-md:max-w-screen ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full">
          {(title || showCloseButton) && (
            <div className="w-full p-4">
              <div className="flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-semibold text-primary">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-3xl"
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
        <div className="flex-1 p-4 h-[80%] overflow-y-scroll">{children}</div>
        {footer && <div className="p-4 border-t border-gray-300">{footer}</div>}
      </div>
    </div>
  );
};

import { ReactNode } from "react";
import { IoChevronDown } from "react-icons/io5";

export interface DropdownProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  position?: "left" | "right" | "bottom" | "top";
  label: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  width?: string; // e.g., "w-full", "w-[60%]", "w-32"
  height?: string; // e.g., "h-full", "h-[60%]", "h-32"
  color?: string; // e.g., "bg-primary", "bg-green-500", "bg-[#25d366]"
  textColor?: string; // e.g., "text-white", "text-gray-900"
  rounded?: string; // e.g., "rounded-sm", "rounded-md", "rounded-full"
  children: ReactNode; // Dropdown menu items
  borderColor?: string; // e.g., "border-primary", "border-gray-300"
  className?: string; // Additional custom classes
  hideChevron?: boolean; // Hide the chevron icon
  dropdownWidth?: string; // Custom width for dropdown menu
  disabled?: boolean; // Disable the dropdown button
}

const getPositionClasses = (position: string) => {
  switch (position) {
    case "right":
      return "right-0 mt-2";
    case "top":
      return "bottom-full mb-2 left-0";
    case "bottom":
      return "top-full mt-2 left-0";
    case "left":
    default:
      return "left-0 mt-2";
  }
};

const getChevronRotation = (position: string, isOpen: boolean) => {
  if (!isOpen) return "";

  switch (position) {
    case "right":
      return "-rotate-180";
    case "top":
      return "rotate-180";
    case "bottom":
      return "-rotate-90";
    case "left":
    default:
      return "-rotate-90";
  }
};

export default function Dropdown({
  isOpen,
  onOpen,
  onClose,
  label,
  leftIcon,
  rightIcon,
  width = "w-full",
  height = "h-full",
  color = "bg-primary",
  textColor = "text-white",
  position = "bottom",
  rounded = "rounded-sm",
  children,
  borderColor = "border-primary",
  className = "px-6 py-2",
  hideChevron = false,
  dropdownWidth = "w-full",
  disabled = false,
}: DropdownProps) {
  const positionClasses = getPositionClasses(position);
  const chevronRotation = getChevronRotation(position, isOpen);

  return (
    <div className={`relative ${width} ${height}`}>
      <button
        className={`h-full w-full ${isOpen ? `${borderColor}` : borderColor} flex flex-row ${rounded} ${color} justify-between items-center space-x-4 max-md:px-1 max-md:py-1 max-md:text-sm ${textColor} group transition-transform duration-200 ease-in-out cursor-pointer ${className}`}
        onClick={onOpen}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          {leftIcon && <div className="shrink-0">{leftIcon}</div>}
        </div>
        {label}
        <div className="flex items-center space-x-2">
          {rightIcon && <div className="shrink-0">{rightIcon}</div>}
          {!hideChevron && (
            <IoChevronDown
              className={`w-3 h-3 transition-transform duration-300 ${chevronRotation}`}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-1"
          onClick={onClose}
          style={{ background: "transparent" }}
        />
      )}

      {isOpen && (
        <div
          className={`absolute ${positionClasses} ${dropdownWidth} z-100 flex items-start justify-start`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full p-2 rounded-lg bg-white border border-gray-300 shadow-lg">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

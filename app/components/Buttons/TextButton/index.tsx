import React from "react";

export const TextButton: React.FC<{
  text?: string;
  ref?: React.Ref<HTMLButtonElement>;
  variant:
    | "primary"
    | "accent"
    | "secondary"
    | "light"
    | "outline"
    | "outline-danger"
    | "ghost";
  className?: string;
  onClick?: () => void;
  width?: "full" | "half" | "fit";
  icon?: React.ReactNode;
  isSubmit?: boolean;
  disabled?: boolean;
  hoverEffect?: boolean;
}> = ({
  text,
  variant,
  className,
  onClick,
  width,
  icon,
  isSubmit,
  disabled,
  hoverEffect = true,
}) => {
  let defaultStyle = "";
  switch (variant) {
    case "primary":
      defaultStyle =
        "bg-primary text-white border h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:opacity-90";
      break;
    case "accent":
      defaultStyle =
        "bg-[#f5a623] text-primary border h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:opacity-90";
      break;
    case "light":
      defaultStyle =
        "bg-primary-light text-primary border h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:opacity-90";
      break;
    case "secondary":
      defaultStyle =
        "border bg-green-500/20 border-green-300/20 h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:bg-green-500/30 hover:border-green-300";
      break;
    case "outline":
      defaultStyle =
        "border bg-white border-gray-300 h-fitc sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:bg-gray-50";
      break;
    case "outline-danger":
      defaultStyle =
        "border bg-white text-red-500 border-red-500 h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:bg-red-50";
      break;
    case "ghost":
      defaultStyle =
        "border bg-transparent text-white border-white h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium";
      break;
  }
  return (
    <button
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
      disabled={disabled}
      className={`${width === "full" ? "w-full" : width === "half" ? "w-1/2" : width === "fit" ? "w-fit" : ""} ${defaultStyle} ${className ?? ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} flex flex-row items-center max-sm:text-xs justify-center gap-2 ${hoverEffect ? "hover:scale-105 transition-transform duration-200 ease-in-out" : ""}`}
    >
      {icon}
      {text}
    </button>
  );
};

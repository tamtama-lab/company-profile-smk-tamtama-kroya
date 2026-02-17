import React from "react";

export type TextButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  variant?:
    | "primary"
    | "accent"
    | "secondary"
    | "light"
    | "outline"
    | "outline-danger"
    | "outline-warning"
    | "outline-info"
    | "danger"
    | "icon"
    | "ghost";
  width?: "full" | "half" | "fit";
  icon?: React.ReactNode;
  isSubmit?: boolean;
  isLoading?: boolean;
  hoverEffect?: boolean;
  disabled?: boolean;
};

export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      text,
      variant = "primary",
      className,
      onClick,
      width,
      icon,
      isSubmit,
      disabled,
      hoverEffect = false,
      isLoading = false,
      ...rest
    },
    ref,
  ) => {
    let defaultStyle = "";
    let loadingStyle = "";
    switch (variant) {
      case "primary":
        defaultStyle = "bg-primary text-white border hover:opacity-90";
        loadingStyle = "border-white border-t-white/30";
        break;
      case "danger":
        defaultStyle = "bg-red-600 text-white border hover:opacity-90";
        loadingStyle = "border-white border-t-white/30";
        break;
      case "accent":
        defaultStyle = "bg-[#f5a623] text-primary border hover:opacity-90";
        loadingStyle = "border-white border-t-white/30";
        break;
      case "light":
        defaultStyle = "bg-primary-light text-primary border hover:opacity-90";
        loadingStyle = "border-primary border-t-primary/30";
        break;
      case "secondary":
        defaultStyle =
          "border bg-green-500/20 border-green-300/20 hover:bg-green-500/30 hover:border-green-300";
        loadingStyle = "border-white border-t-white/30";
        break;
      case "outline":
        defaultStyle = "border bg-transparent border-gray-300";
        loadingStyle = "border-gray-300 border-t-gray-300/30";
        break;
      case "outline-danger":
        defaultStyle =
          "border bg-white text-red-500 border-red-500 hover:bg-red-50";
        loadingStyle = "border-red-600 border-t-red-600/30";
        break;
      case "outline-info":
        defaultStyle =
          "border bg-white text-blue-500 border-blue-500 hover:bg-blue-50";
        loadingStyle = "border-blue-600 border-t-blue-600/30";
        break;
      case "outline-warning":
        defaultStyle =
          "border bg-white text-yellow-500 border-yellow-500 hover:bg-yellow-50";
        loadingStyle = "border-yellow-600 border-t-yellow-600/30";
        break;
      case "ghost":
        defaultStyle = "border bg-transparent border-white";
        loadingStyle = "border-primary border-t-primary/30";
        break;
      case "icon":
        defaultStyle = "w-fit h-fit";
        loadingStyle = "border-primary border-t-primary/30";
        break;
    }
    return (
      <button
        ref={ref}
        type={isSubmit ? "submit" : "button"}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`${width === "full" ? "w-full" : width === "half" ? "w-1/2" : width === "fit" ? "w-fit" : ""} ${defaultStyle} ${className ?? ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} flex flex-row items-center max-sm:text-xs justify-center gap-2 ${hoverEffect ? "hover:scale-105 transition-transform duration-200 ease-in-out" : ""} h-fit ${variant === "icon" ? "p-2" : "py-2 sm:py-2 px-3 sm:px-4"} text-sm sm:text-base rounded-sm font-medium`}
        {...rest}
      >
        {isLoading ? (
          <div
            className={`w-6 h-6 border-3 ${loadingStyle}  rounded-full animate-spin`}
          />
        ) : (
          icon
        )}

        {text}
      </button>
    );
  },
);

TextButton.displayName = "TextButton";

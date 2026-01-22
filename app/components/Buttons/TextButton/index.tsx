import React from "react";

export const TextButton: React.FC<{
  text: string;
  variant: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  width?: "full" | "half" | "fit";
}> = ({ text, variant, className, onClick, width }) => {
  let defaultStyle = "";
  switch (variant) {
    case "primary":
      defaultStyle =
        "bg-primary text-white border h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:opacity-90";
      break;
    case "secondary":
      defaultStyle =
        "border bg-white border-gray-300 h-fit py-2 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded-sm font-medium hover:bg-gray-50";
      break;
  }
  return (
    <button
      onClick={onClick}
      className={`${width === "full" ? "w-full" : width === "half" ? "w-1/2" : width === "fit" ? "w-fit" : ""} ${defaultStyle} ${className ?? ""} hover:scale-105 transition-transform duration-200 ease-in-out`}
    >
      {text}
    </button>
  );
};

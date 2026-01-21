import React from "react";

export const TextButton: React.FC<{
  text: string;
  type: string;
  className?: string;
  width?: "full" | "half";
}> = ({ text, type, className, width }) => {
  let defaultStyle = "";
  switch (type) {
    case "primary":
      defaultStyle = "bg-primary text-white border h-fit py-2 rounded-sm";
      break;
    case "secondary":
      defaultStyle = "border bg-white border-gray-300 h-fit py-2 rounded-sm";
      break;
  }
  return (
    <button
      className={`${width === "full" ? "w-full" : width === "half" ? "w-1/2" : ""} ${defaultStyle} ${className ?? ""}`}
    >
      {text}
    </button>
  );
};

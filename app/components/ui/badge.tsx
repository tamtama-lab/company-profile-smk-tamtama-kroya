import * as React from "react";

type BadgeVariant = "default" | "blue" | "yellow" | "purple" | "green" | "gray";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariantClassMap: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-700",
};

export function Badge({
  className = "",
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeVariantClassMap[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export type { BadgeVariant };

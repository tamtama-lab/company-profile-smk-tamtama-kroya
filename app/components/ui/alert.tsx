"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import {
  LuTriangle,
  LuInfo,
  LuX,
  LuCheckCheck,
  LuCircleX,
} from "react-icons/lu";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  title?: string;
  description?: string;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
  floating?: boolean;
  autoDismissMs?: number;
}

const baseContainer =
  "w-full max-w-xl rounded-lg border px-4 py-3 flex items-start gap-3 text-sm";

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: JSX.Element }
> = {
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <LuInfo className="mt-0.5 text-blue-600" size={18} />,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: <LuCheckCheck className="mt-0.5 text-emerald-600" size={18} />,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: <LuTriangle className="mt-0.5 text-amber-600" size={18} />,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: <LuCircleX className="mt-0.5 text-red-600" size={18} />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = "info",
  onClose,
  className = "",
  children,
  floating = false,
  autoDismissMs,
}) => {
  const { container, icon } = variantStyles[variant];
  const [entered, setEntered] = useState(false);
  const EXIT_DURATION = 180;

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    if (!onClose) return;
    setEntered(false);
    setTimeout(() => onClose(), EXIT_DURATION);
  }, [onClose]);

  useEffect(() => {
    if (!autoDismissMs || !onClose) return;
    const timer = setTimeout(() => handleClose(), autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, handleClose, onClose]);

  const body = (
    <div
      className={`${baseContainer} ${container} ${className} transition-all duration-200 ease-out ${entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      <div className="shrink-0" aria-hidden>
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        {title && <div className="font-semibold leading-tight">{title}</div>}
        {description && (
          <div className="leading-relaxed text-sm">{description}</div>
        )}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-md p-1 text-inherit hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
          aria-label="Close alert"
        >
          <LuX size={16} />
        </button>
      )}
    </div>
  );

  if (!floating) return body;

  return (
    <div className="fixed inset-x-0 top-0 z-99999 flex justify-center pointer-events-none">
      <div className="w-full max-w-xl p-4 pointer-events-auto">{body}</div>
    </div>
  );
};

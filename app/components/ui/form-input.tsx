"use client";

import { cn } from "@/utils";
import { forwardRef, useState, useRef, useEffect } from "react";
import { IoMdClose, IoMdEye, IoMdEyeOff } from "react-icons/io";
import {
  isValidIndoPhone,
  normalizePhoneNumber,
} from "@/utils/phoneNumberFormat";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const emailFormat = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "")
    .replace(/@+/g, "@")
    .replace(/\.{2,}/g, ".");

// Form Input Text Component untuk shadcn/ui form
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isMandatory?: boolean;
  isEmail?: boolean;
  limit?: number;
  isCapitalize?: boolean;
  isUppercase?: boolean;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      isMandatory,
      isEmail,
      limit,
      isCapitalize,
      isUppercase,
      error,
      className,
      value,
      onChange,
      type,
      ...props
    },
    ref,
  ) => {
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;
    const isPassword = type === "password";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (isCapitalize && newValue) {
        newValue = capitalize(newValue);
      } else if (isUppercase) {
        newValue = newValue.toUpperCase();
      }

      if (isEmail) {
        newValue = emailFormat(newValue);
      }

      e.target.value = newValue;
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      props.onBlur?.(e);
    };

    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
      const isValidChar = /[a-zA-Z0-9@._-]/.test(e.key);

      if (!isValidChar && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const isValidEmail =
      isEmail && stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
    const showEmailError = touched && isValidEmail;

    // Determine input type
    const inputType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isEmail
        ? "email"
        : "text";

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            {limit && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isAboveLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "w-full px-4 max-sm:text-sm py-1.5 max-sm:py-1 border rounded-sm",
              "placeholder-gray-400 max-sm:placeholder:text-xs",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors",
              (isAboveLimit || showEmailError || error) &&
                "border-red-500 focus:ring-red-500",
              !error && !isAboveLimit && !showEmailError && "border-gray-300",
              isPassword && "pr-12", // Add padding right for eye button
              props.readOnly && "bg-gray-100 text-gray-600 cursor-not-allowed",
              className,
            )}
            onKeyDown={isEmail ? handleEmailKeyDown : undefined}
            maxLength={limit}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoMdEyeOff className="w-5 h-5" />
              ) : (
                <IoMdEye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {showEmailError && !error && (
          <span className="text-red-500 text-xs mt-1 block">
            Format email tidak valid
          </span>
        )}
      </div>
    );
  },
);
FormInput.displayName = "FormInput";

// Form Input Number Component
export interface FormInputNumberProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  minLength?: number;
  error?: string;
}

export const FormInputNumber = forwardRef<
  HTMLInputElement,
  FormInputNumberProps
>(
  (
    {
      label,
      isMandatory,
      limit,
      minLength,
      error,
      className,
      value,
      onKeyDown,
      onWheel,
      ...props
    },
    ref,
  ) => {
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent arrow keys from changing number value
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        return;
      }
      if (onKeyDown) onKeyDown(e);
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      // Prevent mouse wheel from changing value while focused
      if (document.activeElement === e.currentTarget) {
        e.preventDefault();
      }
      if (onWheel) onWheel(e);
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            {limit && (
              <span
                className={cn(
                  "text-xs max-sm:text-[10px] font-medium",
                  isAboveLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type="number"
            value={value}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            className={cn(
              "w-full px-4 max-sm:text-xs py-2 border rounded-sm",
              "placeholder-gray-400 max-sm:placeholder:text-xs",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors",
              (isAboveLimit || error) &&
                "border-red-500 focus:ring-red-500 pr-10",
              !error && !isAboveLimit && "border-gray-300",
              props.readOnly && "bg-gray-100 text-gray-600 cursor-not-allowed",
              className,
            )}
            maxLength={limit}
            minLength={minLength}
            {...props}
          />
          {isAboveLimit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">
                <IoMdClose size={14} />
              </div>
            </div>
          )}
        </div>
        {isAboveLimit && !error && (
          <span className="text-red-500 text-xs mt-1 block">
            Jumlah karakter melebihi batas maksimal
          </span>
        )}
      </div>
    );
  },
);
FormInputNumber.displayName = "FormInputNumber";

// Form Input Phone Number Component
export interface FormInputPhoneProps {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  name?: string;
}

export const FormInputPhone = forwardRef<HTMLInputElement, FormInputPhoneProps>(
  (
    {
      label,
      isMandatory,
      limit = 15,
      error,
      value = "",
      onChange,
      onBlur,
      placeholder = "08xxxxxxxxxx",
      name,
    },
    ref,
  ) => {
    const [touched, setTouched] = useState(false);
    const isAboveLimit = value.length > limit;
    const isInvalid = value.length > 0 && !isValidIndoPhone(value);
    const showError = touched && isInvalid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      onChange(normalizePhoneNumber(raw));
    };

    const handleBlur = () => {
      setTouched(true);
      onBlur?.();
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            <span
              className={cn(
                "text-xs",
                isAboveLimit ? "text-red-500" : "text-gray-400",
              )}
            >
              {value.length}/{limit}
            </span>
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="tel"
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-2 border rounded-sm text-sm",
              "focus:outline-none focus:ring-2 transition-colors",
              (isAboveLimit || showError || error) &&
                "border-red-500 focus:ring-red-500 pr-10",
              !error &&
                !isAboveLimit &&
                !showError &&
                "border-gray-300 focus:ring-primary",
            )}
          />
          {(isAboveLimit || showError) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <IoMdClose size={14} />
              </div>
            </div>
          )}
        </div>
        {showError && !error && (
          <span className="text-xs text-red-500 mt-1 block">
            Nomor HP harus diawali 62 dan valid
          </span>
        )}
      </div>
    );
  },
);
FormInputPhone.displayName = "FormInputPhone";

// Form Textarea Component
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, isMandatory, limit, error, className, value, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;

    // Adjust height on mount and when value changes
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            {limit && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isAboveLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        {/* Auto-resizing textarea with vertical manual resize support */}
        <textarea
          ref={(el) => {
            // forwardRef support with proper typing
            if (typeof ref === "function")
              (ref as (instance: HTMLTextAreaElement | null) => void)(el);
            else if (ref && typeof ref === "object")
              (
                ref as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = el;
            // store on internal ref for autogrow
            internalRef.current = el;
          }}
          value={value}
          onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
            // Auto grow
            const el = e.currentTarget as HTMLTextAreaElement;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
            const handler = props.onInput as
              | React.FormEventHandler<HTMLTextAreaElement>
              | undefined;
            if (handler) handler(e);
          }}
          className={cn(
            "w-full px-4 py-2 border rounded-sm resize-y",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent",
            "max-sm:px-2 max-sm:text-xs transition-colors",
            (isAboveLimit || error) && "border-red-500 focus:ring-red-500",
            !error && !isAboveLimit && "border-gray-300",
            className,
          )}
          maxLength={limit || 256}
          rows={3}
          {...props}
        />
        {/* Initialize height based on value */}
        <script
          // This is a small sentinel script for clarity only; actual resizing is handled by React refs/effects
          // Kept empty intentionally
          type="text/javascript"
        />
      </div>
    );
  },
);
FormTextarea.displayName = "FormTextarea";

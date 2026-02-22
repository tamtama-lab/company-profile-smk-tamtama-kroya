import React, { SelectHTMLAttributes } from "react";
import { LuChevronDown } from "react-icons/lu";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  isMandatory?: boolean;
}

const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    { label, error, options, className, isMandatory, placeholder, ...props },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-2 mb-2 max-sm:mb-1">
        {label && (
          <label className="text-sm max-sm:text-xs font-medium text-gray-700">
            {label}
            {isMandatory && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`appearance-none max-sm:text-xs w-full px-3 py-2 pr-10 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 placeholder:text-xs max-sm:px-2 ${
              !props.value && placeholder
                ? "text-gray-400 text-sm"
                : "text-gray-900 text-sm"
            } ${
              error ? "border-red-500 focus:ring-red-500" : ""
            } ${className || ""}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-white text-gray-900 py-2 hover:bg-blue-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 transition-transform duration-200">
            <LuChevronDown />
          </div>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

SelectInput.displayName = "SelectInput";

export default SelectInput;

import React, { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string | number; label: string }>;
  isMandatory?: boolean;
}

const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, options, className, isMandatory, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 mb-4">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {isMandatory && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          placeholder={props.placeholder}
          className={`px-3 py-2 border placeholder-gray-300 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : ""
          } ${className || ""}`}
          {...props}
        >
          <option value="" className="placeholder-gray-300">
            {props.placeholder || "Pilih"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

SelectInput.displayName = "SelectInput";

export default SelectInput;

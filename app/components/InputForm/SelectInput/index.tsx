import React, { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string | number; label: string }>;
  isMandatory?: boolean;
}

const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    { label, error, options, className, isMandatory, placeholder, ...props },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-2 mb-4 max-sm:mb-1">
        {label && (
          <label className="text-sm max-sm:text-xs font-medium text-gray-700">
            {label}
            {isMandatory && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`appearance-none w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 max-sm:px-2 max-sm:text-xs ${
              !props.value && placeholder ? "text-gray-400" : "text-gray-900"
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
                className="bg-white text-gray-900 py-2 hover:bg-blue-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 transition-transform duration-200">
            <svg
              className="w-4 h-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

SelectInput.displayName = "SelectInput";

export default SelectInput;

"use client";

import { IoMdClose } from "react-icons/io";

export const InputText: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
  isEmail?: boolean;
  limit?: number;
}> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  isMandatory,
  isEmail,
  limit,
}) => {
  const isAboveLimit = limit ? value.length > limit : false;

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

  return (
    <div className="mb-4 max-sm:mb-1">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        {limit && (
          <span
            className={`text-xs font-medium ${
              isAboveLimit ? "text-red-500" : "text-gray-500"
            }`}
          >
            {value.length}/{limit}
          </span>
        )}
      </div>
      <input
        type={isEmail ? "email" : "text"}
        name={name}
        value={value}
        onChange={onChange}
        required={isMandatory}
        className={`w-full px-4 py-2 max-sm:py-1 border rounded-sm 
          placeholder-gray-400 max-sm:placeholder:text-xs
          focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors ${
            isAboveLimit
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        placeholder={placeholder}
        onKeyDown={isEmail ? handleEmailKeyDown : undefined}
        maxLength={limit}
      />
    </div>
  );
};

export const InputNumber: React.FC<{
  label: string;
  name: string;
  value: string;
  limit?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
}> = ({ label, name, value, onChange, placeholder, isMandatory, limit }) => {
  const isAboveLimit = limit ? value.length > limit : false;

  return (
    <div className="mb-4 max-sm:mb-1">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        {limit && (
          <span
            className={`text-xs max-sm:text-[10px] font-medium ${
              isAboveLimit ? "text-red-500" : "text-gray-500"
            }`}
          >
            {value.length}/{limit}
          </span>
        )}
      </div>
      <div className="relative w-full">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          required={isMandatory}
          className={`w-full px-4 max-sm:py-1 py-2 border rounded-sm
            placeholder-gray-400 max-sm:placeholder:text-xs
            focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors ${
              isAboveLimit
                ? "border-red-500 focus:ring-red-500 pr-10"
                : "border-gray-300"
            }`}
          placeholder={placeholder}
          maxLength={limit}
        />
        {isAboveLimit && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
            <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">
              <IoMdClose size={14} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const InputTextArea: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
  limit?: number;
}> = ({ label, name, value, onChange, placeholder, isMandatory, limit }) => {
  const isAboveLimit = limit ? value.length > limit : false;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        {limit && (
          <span
            className={`text-xs font-medium ${
              isAboveLimit ? "text-red-500" : "text-gray-500"
            }`}
          >
            {value.length}/{limit}
          </span>
        )}
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={isMandatory}
        className={`w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent 
          max-sm:px-2  max-sm:text-xs
          transition-colors resize-none ${
          isAboveLimit ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        maxLength={limit}
        rows={6}
      />
    </div>
  );
};

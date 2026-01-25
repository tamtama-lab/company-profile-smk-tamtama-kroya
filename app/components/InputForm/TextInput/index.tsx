"use client";

import {
  isValidIndoPhone,
  normalizePhoneNumber,
} from "@/utils/phoneNumberFormat";
import { IoMdClose } from "react-icons/io";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const emailFormat = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "")
    .replace(/@+/g, "@")
    .replace(/\.{2,}/g, ".");

export const InputText: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
  isEmail?: boolean;
  limit?: number;
  isCapitalize?: boolean;
  isUppercase?: boolean;
}> = ({
  label,
  name,
  value = "",
  onChange,
  placeholder,
  isMandatory,
  isEmail,
  limit,
  isCapitalize,
  isUppercase,
}) => {
  const isAboveLimit = limit ? value.length > limit : false;
  const isError = false; // You can implement your error logic here

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
    onChange(e);
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
    isEmail && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
        onChange={handleChange}
        required={isMandatory}
        className={`w-full px-4 max-sm:text-sm py-2 max-sm:py-1 border rounded-sm 
          placeholder-gray-400 max-sm:placeholder:text-xs
          focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors ${
            isAboveLimit || isValidEmail
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        placeholder={placeholder}
        onKeyDown={isEmail ? handleEmailKeyDown : undefined}
        maxLength={limit}
      />
      {isValidEmail && (
        <span className="text-red-500 text-xs mt-1">
          Format email tidak valid
        </span>
      )}
    </div>
  );
};

export const InputNumber: React.FC<{
  label: string;
  name: string;
  value: string;
  limit?: number;
  minLength?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
}> = ({
  label,
  name,
  value = "",
  onChange,
  placeholder,
  isMandatory,
  limit,
  minLength,
}) => {
  const isAboveLimit = limit ? value.length > limit : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

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
          onChange={handleChange}
          required={isMandatory}
          className={`w-full px-4 max-sm:text-xs py-2 border rounded-sm
            placeholder-gray-400 max-sm:placeholder:text-xs
            focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors ${
              isAboveLimit
                ? "border-red-500 focus:ring-red-500 pr-10"
                : "border-gray-300"
            }`}
          placeholder={placeholder}
          maxLength={limit}
          minLength={minLength}
        />
        {isAboveLimit && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
            <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">
              <IoMdClose size={14} />
            </div>
          </div>
        )}
      </div>
      {isAboveLimit && (
        <span className="text-red-500 text-xs mt-1">
          Jumlah karakter melebihi batas maksimal
        </span>
      )}
    </div>
  );
};

interface InputPhoneNumberProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isMandatory?: boolean;
  limit?: number;
}

export const InputPhoneNumber: React.FC<InputPhoneNumberProps> = ({
  label,
  name,
  value = "",
  onChange,
  placeholder = "08xxxxxxxxxx",
  isMandatory,
  limit = 15,
}) => {
  const isAboveLimit = value.length > limit;
  const isInvalid = value.length > 0 && !isValidIndoPhone(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(normalizePhoneNumber(raw));
  };

  return (
    <div className="mb-4 max-sm:mb-1">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm max-sm:text-xs font-semibold text-gray-700">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>

        <span
          className={`text-xs ${
            isAboveLimit ? "text-red-500" : "text-gray-400"
          }`}
        >
          {value.length}/{limit}
        </span>
      </div>

      <div className="relative">
        <input
          type="tel"
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-sm text-sm
            focus:outline-none focus:ring-2 transition-colors
            ${
              isAboveLimit || isInvalid
                ? "border-red-500 focus:ring-red-500 pr-10"
                : "border-gray-300 focus:ring-primary"
            }`}
        />

        {(isAboveLimit || isInvalid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
              <IoMdClose size={14} />
            </div>
          </div>
        )}
      </div>

      {isInvalid && (
        <span className="text-xs text-red-500 mt-1 block">
          Nomor HP harus diawali 62 dan valid
        </span>
      )}
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
}> = ({
  label,
  name,
  value = "",
  onChange,
  placeholder,
  isMandatory,
  limit,
}) => {
  const isAboveLimit = limit ? value.length > limit : false;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
  };

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
        onChange={handleChange}
        required={isMandatory}
        className={`w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent 
          max-sm:px-2  max-sm:text-xs
          transition-colors resize-none ${
            isAboveLimit
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        placeholder={placeholder}
        maxLength={limit || 256}
        rows={6}
      />
    </div>
  );
};

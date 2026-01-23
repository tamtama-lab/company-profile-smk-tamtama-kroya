"use client";

import React, { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  options: string[];
  placeholder?: string;
  isMandatory?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Pilih atau ketik...",
  isMandatory = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [useTextInput, setUseTextInput] = useState(
    () => value && !options.includes(value),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options berdasarkan search value
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // Check jika value ada di options
  const isValueInOptions = options.includes(value);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (selectedValue: string) => {
    setSearchValue("");
    setIsOpen(false);
    setUseTextInput(false);

    const syntheticEvent = {
      target: { name, value: selectedValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const syntheticEvent = {
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setIsOpen(true);
  };

  const handleAddCustom = (customSearchValue: string) => {
    setUseTextInput(true);
    setIsOpen(false);
    setSearchValue("");

    const syntheticEvent = {
      target: { name, value: customSearchValue },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleBackToSelect = () => {
    setUseTextInput(false);
    setSearchValue("");
    setIsOpen(false);

    const syntheticEvent = {
      target: { name, value: "" },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);

    // Focus ke input select
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="mb-4 max-sm:mb-1" ref={dropdownRef}>
      <label className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2">
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>

      {useTextInput && !isValueInOptions ? (
        // Text input untuk custom value
        <div className="relative">
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleCustomInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={placeholder}
            required={isMandatory}
          />
          {/* Tombol kembali ke select */}
          <button
            type="button"
            onClick={handleBackToSelect}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
            title="Kembali ke pilihan predefinisi"
          >
            ↻ Pilih
          </button>
        </div>
      ) : (
        // Searchable select dropdown
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchValue || (value && isValueInOptions ? value : "")}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            max-sm:px-2  max-sm:text-xs"
            placeholder={placeholder}
            required={isMandatory && !value}
            autoComplete="off"
          />

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                <>
                  {filteredOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectOption(option)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        value === option
                          ? "bg-primary text-white hover:bg-primary"
                          : ""
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                  <div
                    onClick={() => handleAddCustom(searchValue)}
                    className="px-4 py-2 bg-blue-50 text-primary font-semibold cursor-pointer hover:bg-blue-100 border-t border-gray-300 transition-colors"
                  >
                    Tidak Ada Pilihan
                  </div>
                </>
              ) : searchValue ? (
                // Tampilkan pesan "tidak ada" + tombol tambah custom
                <div className="py-2">
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    Tidak ada pilihan yang sesuai
                  </div>
                  <div
                    onClick={() => handleAddCustom(searchValue)}
                    className="px-4 py-2 bg-blue-50 text-primary font-semibold cursor-pointer hover:bg-blue-100 border-t border-gray-300 transition-colors"
                  >
                    + Tambah &quot;{searchValue}&quot; sebagai pilihan baru
                  </div>
                </div>
              ) : (
                // Tampilkan semua options saat belum search
                options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectOption(option)}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                      value === option
                        ? "bg-primary text-white hover:bg-primary"
                        : ""
                    }`}
                  >
                    {option}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

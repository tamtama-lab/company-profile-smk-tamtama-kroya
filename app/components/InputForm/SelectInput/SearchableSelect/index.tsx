"use client";

import React, { useEffect, useRef, useState } from "react";

interface SearchableSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  options?: string[];
  fetchOptions?: (query: string) => Promise<string[]>;
  minChars?: number;
  placeholder?: string;
  isMandatory?: boolean;
  error?: string;
  className?: string;
  isAddValueActive?: boolean; // Opsi untuk mengaktifkan fitur tambah nilai custom
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  fetchOptions,
  minChars = 3,
  placeholder = "Pilih atau ketik...",
  isMandatory = false,
  error,
  className = "",
  isAddValueActive = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [useTextInput, setUseTextInput] = useState(
    () => value && !options.includes(value),
  );
  const [remoteOptions, setRemoteOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const baseOptions = options || [];
  const combinedOptions = Array.from(
    new Set([...baseOptions, ...remoteOptions]),
  );
  const isValueInOptions = combinedOptions.includes(value);

  // Gunakan error dari Zod validation
  const hasError = !!error;

  // Update useTextInput ketika value berubah
  useEffect(() => {
    if (!value) {
      setUseTextInput(false);
      return;
    }
    if (!combinedOptions.includes(value)) {
      setUseTextInput(true);
    }
  }, [value, combinedOptions]);

  // Fetch options dari API dengan debounce
  useEffect(() => {
    if (!fetchOptions) return;

    const query = searchValue.trim();

    // Clear jika query kurang dari minChars
    if (query.length < minChars) {
      setRemoteOptions([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    let isCancelled = false;
    setIsLoading(true);
    setFetchError(null);

    // Debounce fetch dengan delay 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await fetchOptions(query);
        if (!isCancelled) {
          setRemoteOptions(Array.isArray(result) ? result : []);
          setFetchError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Gagal memuat data sekolah";
          setFetchError(errorMessage);
          setRemoteOptions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchOptions, minChars, searchValue]);

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
    setTouched(true);

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

  const handleBlur = () => {
    setTouched(true);
  };

  const handleAddCustom = (customSearchValue: string) => {
    setUseTextInput(true);
    setIsOpen(false);
    setSearchValue("");
    setTouched(true);

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

  // Render options berdasarkan apakah menggunakan fetch atau static
  const renderDropdownContent = () => {
    if (fetchOptions) {
      // Mode API fetch
      return (
        <>
          {/* Pesan minimal karakter */}
          {/* {searchValue.trim().length < minChars && (
            <div className="px-4 py-2 text-gray-500 text-sm">
              Ketik minimal {minChars} karakter untuk mencari
            </div>
          )} */}

          {/* Loading state */}
          {searchValue.trim().length >= minChars && isLoading && (
            <div className="px-4 py-2 text-gray-500 text-sm">
              Memuat data sekolah...
            </div>
          )}

          {/* Error state */}
          {searchValue.trim().length >= minChars && fetchError && (
            <div className="px-4 py-2 text-red-500 text-sm">{fetchError}</div>
          )}

          {/* Options list */}
          {searchValue.trim().length >= minChars &&
            !isLoading &&
            !fetchError &&
            remoteOptions.length > 0 && (
              <>
                {remoteOptions.map((option, index) => (
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
            )}

          {/* Empty state */}
          {searchValue.trim().length >= minChars &&
            !isLoading &&
            !fetchError &&
            remoteOptions.length === 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-gray-500 text-sm">
                  Tidak ada pilihan yang sesuai
                </div>
                {isAddValueActive && (
                  <div
                    onClick={() => handleAddCustom(searchValue)}
                    className="px-4 py-2 bg-blue-50 text-primary font-semibold cursor-pointer hover:bg-blue-100 border-t border-gray-300 transition-colors"
                  >
                    + Tambah &quot;{searchValue}&quot; sebagai pilihan baru
                  </div>
                )}
              </div>
            )}
        </>
      );
    }

    // Mode static options (fallback)
    const filteredOptions = combinedOptions.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase()),
    );

    if (filteredOptions.length > 0) {
      return (
        <>
          {filteredOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleSelectOption(option)}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                value === option ? "bg-primary text-white hover:bg-primary" : ""
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
      );
    }

    if (searchValue) {
      return (
        <div className="py-2">
          <div className="px-4 py-2 text-gray-500 text-sm">
            Tidak ada pilihan yang sesuai
          </div>
          {isAddValueActive && (
            <div
              onClick={() => handleAddCustom(searchValue)}
              className="px-4 py-2 bg-blue-50 text-primary font-semibold cursor-pointer hover:bg-blue-100 border-t border-gray-300 transition-colors"
            >
              + Tambah &quot;{searchValue}&quot; sebagai pilihan baru
            </div>
          )}
        </div>
      );
    }

    // Show all options saat belum search
    return (
      <>
        {combinedOptions.map((option) => (
          <div
            key={option}
            onClick={() => handleSelectOption(option)}
            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
              value === option ? "bg-primary text-white hover:bg-primary" : ""
            }`}
          >
            {option}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={`mb-2 max-sm:mb-1 ${className}`} ref={dropdownRef}>
      <label className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2">
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>

      {useTextInput && !isValueInOptions ? (
        // Text input untuk custom value
        <div className={`relative `}>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleCustomInputChange}
            onBlur={handleBlur}
            className={`w-full max-sm:text-xs px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              hasError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
            }`}
            placeholder={placeholder}
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
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors
            max-sm:px-2 max-sm:text-xs text-sm ${
              hasError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
            }`}
            placeholder={placeholder}
            autoComplete="off"
          />

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto">
              {renderDropdownContent()}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <span className="text-red-500 text-xs mt-1 block">{error}</span>
      )}
    </div>
  );
};

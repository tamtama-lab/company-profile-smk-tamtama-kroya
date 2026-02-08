"use client";

import { LuTrash2 } from "react-icons/lu";
import { useState } from "react";
import { InputText } from "@/components/InputForm/TextInput";
import Toggle from "@/components/ui/toggle";

interface RequirementCardProps {
  id: string;
  label: string;
  isActive: boolean;
  isRequired: boolean;
  onToggle?: (id: string, isActive: boolean) => void;
  onRequiredChange?: (id: string, isRequired: boolean) => void;
  onLabelChange?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

export const RequirementCard = ({
  id,
  label,
  isActive,
  isRequired,
  onToggle,
  onRequiredChange,
  onDelete,
  isEditable = false,
}: RequirementCardProps) => {
  const [localLabel, setLocalLabel] = useState(label);

  return (
    <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 transition-colors group">
      {/* Checkbox Required */}
      <input
        type="checkbox"
        checked={isRequired}
        onChange={(e) => onRequiredChange?.(id, e.target.checked)}
        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
      />

      {/* Toggle Active */}
      <Toggle
        enabled={isActive}
        onChange={(enabled) => onToggle?.(id, enabled)}
      />
      {/* <button
        onClick={() => onToggle?.(id, !isActive)}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isActive ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button> */}

      {/* Label Input */}

      <div className="w-full">
        <input
          placeholder="Masukkan syarat pendaftaran"
          className={`w-full h-10 px-3 py-2 border border-gray-300 rounded ${
            isEditable ? "cursor-pointer hover:border-primary" : ""
          } ${!isActive ? "text-gray-400" : "text-gray-700"}`}
          value={localLabel}
          onChange={(e) => setLocalLabel(e.target.value)}
        />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete?.(id)}
        className=" p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
        aria-label="Delete requirement"
      >
        <LuTrash2 size={18} />
      </button>
    </div>
  );
};

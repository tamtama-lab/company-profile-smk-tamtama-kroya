"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { LuTrash2 } from "react-icons/lu";
import { TextButton } from "@/components/Buttons/TextButton";
import Toggle from "@/components/ui/toggle";

type SocialMediaSingleFieldProps = {
  label: string;
  iconSrc: string;
  iconAlt: string;
  iconSize?: number;
  value: string;
  isActive: boolean;
  onChange: (value: string) => void;
  onToggle: (value: boolean) => void;
};

export function SocialMediaSingleField({
  label,
  iconSrc,
  iconAlt,
  iconSize,
  value,
  isActive,
  onChange,
  onToggle,
}: SocialMediaSingleFieldProps) {
  const size = iconSize ?? 30;
  return (
    <div>
      <label className="font-medium flex flex-row gap-2 h-fit justify-start items-center">
        <Image src={iconSrc} alt={iconAlt} width={size} height={size} /> {label}{" "}
        :
      </label>
      <div className="flex items-center gap-2 mt-2">
        <input
          className="flex-1 border border-gray-400 rounded p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isActive}
        />
        <Toggle enabled={isActive} onChange={onToggle} />
      </div>
    </div>
  );
}

type SocialMediaListFieldProps<T extends { isActive?: boolean }> = {
  label: string;
  iconSrc: string;
  iconAlt: string;
  iconSize?: number;
  items: T[];
  addLabel: string;
  maxItems?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onToggle: (index: number, value: boolean) => void;
  renderInputs: (item: T, index: number, disabled: boolean) => ReactNode;
  hideDeleteWhenSingle?: boolean;
  className?: string;
};

export function SocialMediaListField<T extends { isActive?: boolean }>({
  label,
  iconSrc,
  iconAlt,
  iconSize,
  items,
  addLabel,
  maxItems,
  onAdd,
  onRemove,
  onToggle,
  renderInputs,
  className,
  hideDeleteWhenSingle = false,
}: SocialMediaListFieldProps<T>) {
  const canAdd = typeof maxItems === "number" ? items.length < maxItems : true;
  const showDelete = !hideDeleteWhenSingle || items.length > 1;
  const size = iconSize ?? 30;

  return (
    <div>
      <label className="font-medium flex flex-row gap-2 h-fit justify-start items-center">
        <Image src={iconSrc} alt={iconAlt} width={size} height={size} /> {label}{" "}
        :
      </label>
      <div className="mt-2 space-y-2">
        {items.map((item, idx) => {
          const disabled = !!item.isActive;

          return (
            <div key={idx} className={`flex items-center gap-2 ${className}`}>
              {renderInputs(item, idx, disabled)}
              <Toggle
                enabled={!!item.isActive}
                onChange={(val) => onToggle(idx, val)}
              />
              {showDelete && (
                <TextButton
                  variant="icon"
                  disabled={disabled}
                  icon={<LuTrash2 className="text-xl" />}
                  onClick={() => onRemove(idx)}
                  className="text-red-600"
                />
              )}
            </div>
          );
        })}
        <div>
          <TextButton
            variant="primary"
            text={addLabel}
            onClick={onAdd}
            disabled={!canAdd}
          />
        </div>
      </div>
    </div>
  );
}

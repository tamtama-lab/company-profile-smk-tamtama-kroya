"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { BaseModal } from "@/components/Modal/BaseModal";
import { LuTriangleAlert } from "react-icons/lu";

interface ConfirmationAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
}) => {
  const iconColor = variant === "danger" ? "text-red-500" : "text-amber-500";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      showCloseButton={true}
      size="sm"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
        <LuTriangleAlert className={`${iconColor} text-5xl`} />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm">{message}</p>
        <div className="flex gap-3 w-full pt-4">
          <TextButton
            variant="outline"
            text={cancelText}
            className="flex-1"
            onClick={onCancel}
          />
          <TextButton
            variant={variant === "danger" ? "primary" : "primary"}
            text={confirmText}
            className="flex-1"
            onClick={onConfirm}
          />
        </div>
      </div>
    </BaseModal>
  );
};

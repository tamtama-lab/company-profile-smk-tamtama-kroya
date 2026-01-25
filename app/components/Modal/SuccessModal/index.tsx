"use client";

import { BaseModal } from "@/components/Modal/BaseModal";
import { TextButton } from "@/components/Buttons/TextButton";
import { FaCheckCircle } from "react-icons/fa";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId?: string;
  studentName?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  registrationId,
  studentName,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="md"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
        <FaCheckCircle className="text-green-500 text-6xl" />
        <h2 className="text-2xl font-bold text-primary">
          Pendaftaran Berhasil!
        </h2>
        {studentName && (
          <p className="text-lg text-gray-700">
            Selamat, <span className="font-bold">{studentName}</span>!
          </p>
        )}
        <div className="bg-gray-50 p-4 rounded-lg w-full">
          <p className="text-sm text-gray-600 mb-2">Nomor Pendaftaran Anda:</p>
          <p className="text-xl font-bold text-primary">{registrationId}</p>
        </div>
        <div className="text-left space-y-2 w-full">
          <p className="text-sm text-gray-700">
            📧 Bukti pendaftaran telah dikirim ke email Anda.
          </p>
          <p className="text-sm text-gray-700">
            📄 Simpan bukti pendaftaran untuk ditunjukkan saat daftar ulang.
          </p>
          <p className="text-sm text-gray-700">
            🏫 Silakan datang ke SMK Tamtama Kroya untuk melanjutkan proses
            pendaftaran.
          </p>
        </div>
        <TextButton
          variant="primary"
          text="Kembali ke Beranda"
          className="w-full px-8 py-3"
          onClick={onClose}
        />
      </div>
    </BaseModal>
  );
};

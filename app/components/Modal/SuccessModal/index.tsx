"use client";

import { BaseModal } from "@/components/Modal/BaseModal";
import { TextButton } from "@/components/Buttons/TextButton";
import { FaCheckCircle } from "react-icons/fa";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationNumber?: string;
  studentName?: string;
  majorChoiceCode?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  registrationNumber,
  studentName,
  majorChoiceCode,
}) => {
  // Mapping major codes to full names
  const majorNames: Record<string, string> = {
    TKR: "Teknik Kendaraan Ringan",
    TITL: "Teknik Instalasi Tenaga Listrik",
    DKV: "Desain Komunikasi Visual",
    TP: "Teknik Pemesinan",
  };

  const majorName = majorChoiceCode
    ? majorNames[majorChoiceCode] || majorChoiceCode
    : "";

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
        <div className="bg-gray-50 p-4 rounded-lg w-full space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nomor Pendaftaran:</p>
            <p className="text-xl font-bold text-primary">
              {registrationNumber}
            </p>
          </div>
          {majorChoiceCode && (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Jurusan yang Dipilih:
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {majorName}
                {majorChoiceCode && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({majorChoiceCode})
                  </span>
                )}
              </p>
            </div>
          )}
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

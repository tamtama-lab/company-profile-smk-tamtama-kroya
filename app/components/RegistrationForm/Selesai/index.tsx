"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import React from "react";
import { LuFileText } from "react-icons/lu";

interface SelesaiProps {
  onSubmit: () => void;
  onPrev: () => void;
  onCancel?: () => void;
}

export const Selesai: React.FC<SelesaiProps> = ({ onPrev, onCancel }) => {
  return (
    <div className="w-full">
      <div className="w-full max-sm:text-xs">
        <div className="bg-amber-100 border border-blue-200 rounded-lg p-4 text-left flex flex-col space-y-6 ">
          <div className="w-full">
            <p className=" text-gray-700">
              <span className="font-semibold text-primary">Selamat</span> Anda
              telah menyelesaikan seluruh tahapan pengisian formulir pendaftaran
            </p>
            <p className="text-primary font-bold">
              Calon Murid Baru SMK Tamtama Kroya.
            </p>
          </div>
          <div className="w-full">
            <p className=" text-gray-700">
              Silakan periksa kembali seluruh data yang telah diisi.
            </p>
            <p className=" text-gray-700">
              Jika sudah sesuai dan yakin, tekan tombol Kirim untuk
              menyelesaikan proses pendaftaran.
            </p>
          </div>
        </div>
        <div className="bg-white border-b border-blue-200 rounded-none p-4 text-left flex flex-col space-y-6 ">
          <div className="w-full">
            <span className="font-bold text-primary">Catatan Penting:</span>
            <p className=" text-gray-700">
              Setelah menekan tombol{" "}
              <span className="text-primary font-bold">Kirim</span> sistem akan
              mengirimkan{" "}
              <span className="text-primary font-bold">
                File Bukti Pendaftaran
              </span>{" "}
              ke alamat email yang telah dimasukkan saat proses pendaftaran
            </p>
          </div>
          <div className="w-full">
            Simpan file tersebut dan tunjukkan kepada panitia pendaftaran saat
            proses daftar ulang di{" "}
            <span className="text-primary font-bold">SMK Tamtama Kroya.</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-4 mt-10 max-sm:grid max-sm:grid-cols-1 max-sm:gap-y-3">
        <div className="flex gap-6 max-sm:justify-between">
          <TextButton
            variant="secondary"
            text="Kembali"
            className="px-8 py-2"
            onClick={onPrev}
          />
          <TextButton
            variant="outline"
            icon={<LuFileText />}
            text="Lihat Detail Data"
            className="px-8 py-2"
          />
        </div>
        <div className="flex gap-6">
          <TextButton
            variant="outline-danger"
            text="Kosongkan Formulir"
            className="px-8 py-2"
            onClick={onPrev}
          />
          <TextButton
            variant="primary"
            text="Konfirmasi Pendaftaran"
            className="px-8 py-2"
            isSubmit
          />
        </div>
      </div>
    </div>
  );
};

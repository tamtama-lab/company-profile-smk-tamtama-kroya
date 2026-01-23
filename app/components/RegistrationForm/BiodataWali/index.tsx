"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import {
  InputNumber,
  InputText,
  InputTextArea,
} from "@/components/InputForm/TextInput";
import React, { useState } from "react";
import { MandatoryLabel } from "../MandatoryLabel";

interface BiodataWaliForm {
  namaWali: string;
  nikWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;
  alamatWali: string;
  noTelponWali: string;
  hubunganDenganSiswa: string;
}

interface BiodataWaliProps {
  onNext: (data: BiodataWaliForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
}

export const BiodataWali: React.FC<BiodataWaliProps> = ({
  onNext,
  onPrev,
  onCancel,
}) => {
  const [formData, setFormData] = useState<BiodataWaliForm>({
    namaWali: "",
    nikWali: "",
    pekerjaanWali: "",
    penghasilanWali: "",
    alamatWali: "",
    noTelponWali: "",
    hubunganDenganSiswa: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <MandatoryLabel notes=" Data wali hanya perlu diisi apabila orang tua tidak dapat dihubungi atau tidak tersedia." />
      <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5 max-sm:gap-y-2">
        <InputText
          label="Nama Wali"
          name="namaWali"
          value={formData.namaWali}
          onChange={handleChange}
          placeholder="Masukkan Nama Wali Anda"
          isMandatory
        />
        <InputNumber
          label="Nomor Telpon Wali"
          name="noTelponWali"
          value={formData.noTelponWali}
          onChange={handleChange}
          limit={15}
          placeholder="Masukkan Nomor Telpon Wali"
          isMandatory
        />

        <InputTextArea
          label="Alamat"
          name="alamatWali"
          value={formData.alamatWali}
          placeholder="Masukkan Alamat Domisili Wali Anda "
          isMandatory
          onChange={handleChange}
        />
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
          {onCancel && (
            <TextButton
              variant="outline"
              text="Batal"
              className="px-8 py-2"
              onClick={onCancel}
            />
          )}
        </div>
        <TextButton variant="primary" text="Lanjutkan" className="px-8 py-2" />
      </div>
    </form>
  );
};

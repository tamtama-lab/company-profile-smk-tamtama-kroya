"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import { InputText, InputTextArea } from "@/components/InputForm/TextInput";
import React, { useState } from "react";

interface BiodataWaliForm {
  namaWali: string;
  nikWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;
  alamatWali: string;
  nomorTeleponWali: string;
  hubunganDenganSiswa: string;
}

interface BiodataWaliProps {
  onNext: (data: BiodataWaliForm) => void;
  onPrev: () => void;
}

export const BiodataWali: React.FC<BiodataWaliProps> = ({ onNext, onPrev }) => {
  const [formData, setFormData] = useState<BiodataWaliForm>({
    namaWali: "",
    nikWali: "",
    pekerjaanWali: "",
    penghasilanWali: "",
    alamatWali: "",
    nomorTeleponWali: "",
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
      <div className="w-full h-fit bg-green-400/10 text-black px-4 py-1 rounded-md mb-6">
        <span className="text-red-500 font-semibold">Note:</span> data yang
        memiliki tanda <span className="text-red-500 font-semibold">(*)</span>{" "}
        merupakan data yang wajib diisi
      </div>
      <div className="grid grid-cols-2 gap-x-5 *:last:col-span-2">
        <InputText
          label="Nama Wali"
          name="namaWali"
          value={formData.namaWali}
          onChange={handleChange}
          placeholder="Masukkan Nama Wali Anda"
          isMandatory
        />
        <SelectInput
          label="Hubungan Dengan Siswa"
          name="hubunganDenganSiswa"
          value={formData.hubunganDenganSiswa}
          onChange={handleChange}
          options={[
            { value: "ayah", label: "Ayah" },
            { value: "ibu", label: "Ibu" },
            { value: "wali", label: "Wali " },
          ]}
          placeholder="Pilih Hubungan Dengan Siswa"
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
      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-8 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
        >
          Kembali
        </button>
        <TextButton variant="primary" text="Lanjutkan" className="px-8 py-2" />
      </div>
    </form>
  );
};

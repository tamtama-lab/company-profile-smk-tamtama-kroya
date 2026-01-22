"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import { InputText, InputTextArea } from "@/components/InputForm/TextInput";
import React, { useState } from "react";

interface BiodataOrangTuaForm {
  alamat: string;
  namaAyah: string;
  kondisiAyah: string;
  namaIbu: string;
  kondisiIbu: string;
}

interface BiodataOrangTuaProps {
  onNext: (data: BiodataOrangTuaForm) => void;
  onPrev: () => void;
}

export const BiodataOrangTua: React.FC<BiodataOrangTuaProps> = ({
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<BiodataOrangTuaForm>({
    namaAyah: "",
    kondisiAyah: "",
    namaIbu: "",
    kondisiIbu: "",
    alamat: "",
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
          label="Nama Ayah"
          name="namaAyah"
          value={formData.namaAyah}
          onChange={handleChange}
          placeholder="Masukkan Nama Ayah Anda"
          isMandatory
        />
        <SelectInput
          label="Kondisi Ayah"
          name="kondisiAyah"
          value={formData.kondisiAyah}
          onChange={handleChange}
          options={[
            { value: "hidup", label: "Hidup" },
            { value: "meninggal", label: "Meninggal" },
          ]}
          placeholder="Pilih Kondisi Ayah Anda"
          isMandatory
        />
        <InputText
          label="Nama Ibu"
          name="namaIbu"
          value={formData.namaIbu}
          onChange={handleChange}
          placeholder="Masukkan Nama Ibu Anda"
          isMandatory
        />
        <SelectInput
          label="Kondisi Ibu"
          name="kondisiIbu"
          value={formData.kondisiIbu}
          onChange={handleChange}
          options={[
            { value: "hidup", label: "Hidup" },
            { value: "meninggal", label: "Meninggal" },
          ]}
          placeholder="Pilih Kondisi Ibu Anda"
          isMandatory
        />
        <InputTextArea
          label="Alamat"
          name="alamat"
          value={formData.alamat}
          placeholder="Masukkan Alamat Domisili Orang Tua Anda "
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

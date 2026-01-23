"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import { InputText, InputTextArea } from "@/components/InputForm/TextInput";
import React, { useState } from "react";
import { MandatoryLabel } from "../MandatoryLabel";

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
  onCancel?: () => void;
}

export const BiodataOrangTua: React.FC<BiodataOrangTuaProps> = ({
  onNext,
  onPrev,
  onCancel,
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
      <MandatoryLabel notes="Data yang memiliki tanda (*) merupakan data yang wajib diisi" />
      <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
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

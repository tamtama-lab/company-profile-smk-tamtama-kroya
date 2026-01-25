"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import {
  InputNumber,
  InputText,
  InputTextArea,
} from "@/components/InputForm/TextInput";
import React from "react";
import { useForm } from "react-hook-form";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataOrangTuaForm } from "@/utils/registrationTypes";

interface BiodataOrangTuaProps {
  onNext: (data: BiodataOrangTuaForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: BiodataOrangTuaForm;
  onValidationError?: (message: string) => void;
}

export const BiodataOrangTua: React.FC<BiodataOrangTuaProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
  onValidationError,
}) => {
  const { register, handleSubmit, watch, setValue } =
    useForm<BiodataOrangTuaForm>({
      defaultValues: initialData || {
        namaAyah: "",
        kondisiAyah: "",
        namaIbu: "",
        kondisiIbu: "",
        alamat: "",
        noTelponOrangTua: "",
      },
    });

  const formData = watch();

  const onSubmit = (data: BiodataOrangTuaForm) => {
    if (!data.namaAyah?.trim()) {
      onValidationError?.("Nama Ayah harus diisi");
      return;
    }
    if (!data.kondisiAyah?.trim()) {
      onValidationError?.("Kondisi Ayah harus dipilih");
      return;
    }
    if (!data.namaIbu?.trim()) {
      onValidationError?.("Nama Ibu harus diisi");
      return;
    }
    if (!data.kondisiIbu?.trim()) {
      onValidationError?.("Kondisi Ibu harus dipilih");
      return;
    }
    if (!data.alamat?.trim()) {
      onValidationError?.("Alamat harus diisi");
      return;
    }
    if (!data.noTelponOrangTua?.trim()) {
      onValidationError?.("Nomor Telpon Orang Tua harus diisi");
      return;
    }
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <MandatoryLabel notes="Data yang memiliki tanda (*) merupakan data yang wajib diisi" />
      <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
        <InputText
          label="Nama Ayah"
          placeholder="Masukkan Nama Ayah Anda"
          isMandatory
          name="namaAyah"
          value={formData.namaAyah}
          onChange={(e) => setValue("namaAyah", e.target.value)}
        />
        <SelectInput
          label="Kondisi Ayah"
          name="kondisiAyah"
          value={formData.kondisiAyah}
          onChange={(e) => setValue("kondisiAyah", e.target.value)}
          options={[
            { value: "hidup", label: "Hidup" },
            { value: "meninggal", label: "Meninggal" },
          ]}
          placeholder="Pilih Kondisi Ayah Anda"
          isMandatory
        />
        <InputText
          label="Nama Ibu"
          placeholder="Masukkan Nama Ibu Anda"
          isMandatory
          name="namaIbu"
          value={formData.namaIbu}
          onChange={(e) => setValue("namaIbu", e.target.value)}
        />
        <SelectInput
          label="Kondisi Ibu"
          name="kondisiIbu"
          value={formData.kondisiIbu}
          onChange={(e) => setValue("kondisiIbu", e.target.value)}
          options={[
            { value: "hidup", label: "Hidup" },
            { value: "meninggal", label: "Meninggal" },
          ]}
          placeholder="Pilih Kondisi Ibu Anda"
          isMandatory
        />
        <InputNumber
          label="Nomor Telpon Orang Tua"
          limit={15}
          placeholder="Masukkan Nomor Telpon Orang Tua"
          isMandatory
          name="noTelponOrangTua"
          value={formData.noTelponOrangTua}
          onChange={(e) => setValue("noTelponOrangTua", e.target.value)}
        />
        <InputTextArea
          label="Alamat"
          placeholder="Masukkan Alamat Domisili Orang Tua Anda"
          isMandatory
          name="alamat"
          value={formData.alamat}
          onChange={(e) => setValue("alamat", e.target.value)}
        />
      </div>

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
        <TextButton
          variant="primary"
          text="Lanjutkan"
          className="px-8 py-2"
          isSubmit
        />
      </div>
    </form>
  );
};

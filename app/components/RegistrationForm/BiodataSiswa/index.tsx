"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { DateInput } from "@/components/InputForm/DateInput";
import { RadioInput } from "@/components/InputForm/RadioInput";
import SelectInput from "@/components/InputForm/SelectInput";
import { SearchableSelect } from "@/components/InputForm/SelectInput/SearchableSelect";
import {
  InputNumber,
  InputText,
  InputTextArea,
} from "@/components/InputForm/TextInput";
import React from "react";
import { useForm } from "react-hook-form";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataSiswaForm } from "@/utils/registrationTypes";

interface BiodataSiswaProps {
  onNext: (data: BiodataSiswaForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: BiodataSiswaForm;
  onValidationError?: (message: string) => void;
}

const smpOptions = [
  "SMP Negeri 1 Kroya",
  "SMP Negeri 2 Kroya",
  "SMP Swasta Tamtama",
  "SMP Islam Al-Hikmah",
  "MTs Negeri Kroya",
];

export const BiodataSiswa: React.FC<BiodataSiswaProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
  onValidationError,
}) => {
  const { register, handleSubmit, watch, setValue } = useForm<BiodataSiswaForm>(
    {
      defaultValues: initialData || {
        namaLengkap: "",
        email: "",
        nik: "",
        nisn: "",
        tempatLahir: "",
        tanggalLahir: "",
        asalSekolah: "",
        alamat: "",
        jenisKelamin: "",
        agama: "",
        adaKip: false,
        nomorWhatsapp: "",
      },
    },
  );

  const formData = watch();

  const onSubmit = (data: BiodataSiswaForm) => {
    if (!data.namaLengkap?.trim()) {
      onValidationError?.("Nama Lengkap harus diisi");
      return;
    }
    if (!data.email?.trim()) {
      onValidationError?.("Email harus diisi");
      return;
    }
    if (!data.tempatLahir?.trim()) {
      onValidationError?.("Tempat Lahir harus diisi");
      return;
    }
    if (!data.tanggalLahir?.trim()) {
      onValidationError?.("Tanggal Lahir harus diisi");
      return;
    }
    if (!data.asalSekolah?.trim()) {
      onValidationError?.("Asal Sekolah harus diisi");
      return;
    }
    if (!data.alamat?.trim()) {
      onValidationError?.("Alamat harus diisi");
      return;
    }
    if (!data.jenisKelamin?.trim()) {
      onValidationError?.("Jenis Kelamin harus dipilih");
      return;
    }
    if (!data.agama?.trim()) {
      onValidationError?.("Agama harus dipilih");
      return;
    }
    if (!data.nomorWhatsapp?.trim()) {
      onValidationError?.("Nomor WhatsApp harus diisi");
      return;
    }
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <MandatoryLabel notes="Data yang memiliki tanda (*) merupakan data yang wajib diisi" />
      <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
        <InputText
          label="Nama Lengkap (Sesuai KK)"
          placeholder="Masukkan Nama Lengkap Anda"
          isMandatory
          isUppercase
          name="namaLengkap"
          value={formData.namaLengkap}
          onChange={(e) => setValue("namaLengkap", e.target.value)}
        />
        <InputText
          label="Email Aktif"
          placeholder="Masukkan Email aktif Anda"
          isMandatory
          isEmail
          name="email"
          value={formData.email}
          onChange={(e) => setValue("email", e.target.value)}
        />
        <InputNumber
          label="NIK (Nomor Induk Kependudukan)"
          limit={16}
          placeholder="Masukkan NIK Anda"
          name="nik"
          value={formData.nik}
          onChange={(e) => setValue("nik", e.target.value)}
        />
        <InputNumber
          label="NISN (Nomor Induk Siswa Nasional)"
          minLength={10}
          placeholder="Masukkan NISN Anda"
          name="nisn"
          value={formData.nisn}
          onChange={(e) => setValue("nisn", e.target.value)}
        />
        <InputText
          label="Tempat Lahir"
          placeholder="Masukkan Tempat Lahir Anda"
          isMandatory
          name="tempatLahir"
          value={formData.tempatLahir}
          onChange={(e) => setValue("tempatLahir", e.target.value)}
        />
        <DateInput
          label="Tanggal Lahir"
          name="tanggalLahir"
          placeholder="Masukkan Tanggal Lahir Anda"
          max={new Date().toISOString().split("T")[0]}
          isMandatory
          value={formData.tanggalLahir}
          onChange={(date) => {
            setValue(
              "tanggalLahir",
              date ? date.toISOString().split("T")[0] : "",
            );
          }}
        />
        <SearchableSelect
          label="Asal SMP/MTs"
          {...register("asalSekolah")}
          value={formData.asalSekolah}
          onChange={(e) => setValue("asalSekolah", e.target.value)}
          options={smpOptions}
          placeholder="Pilih atau ketik asal sekolah Anda"
        />
        <InputTextArea
          label="Alamat"
          placeholder="Masukkan Alamat Sesuai Dengan KTP Anda"
          isMandatory
          name="alamat"
          value={formData.alamat}
          onChange={(e) => setValue("alamat", e.target.value)}
        />
        <SelectInput
          label="Jenis Kelamin"
          name="jenisKelamin"
          value={formData.jenisKelamin}
          onChange={(e) => setValue("jenisKelamin", e.target.value)}
          options={[
            { value: "1", label: "Laki-laki" },
            { value: "0", label: "Perempuan" },
          ]}
          placeholder="Pilih Jenis Kelamin"
          isMandatory
        />
        <SelectInput
          label="Agama"
          name="agama"
          value={formData.agama}
          onChange={(e) => setValue("agama", e.target.value)}
          options={[
            { value: "Islam", label: "Islam" },
            { value: "Kristen", label: "Kristen" },
            { value: "Katolik", label: "Katolik" },
            { value: "Hindu", label: "Hindu" },
            { value: "Buddha", label: "Buddha" },
            { value: "Konghucu", label: "Konghucu" },
          ]}
          placeholder="Pilih Agama"
          isMandatory
        />
        <RadioInput
          label="Apakah Memiliki KIP?"
          name="adaKip"
          isMandatory
          value={formData.adaKip ? "Ya" : "Tidak"}
          onChange={(e) => {
            setValue("adaKip", e.target.value === "Ya");
          }}
          options={[
            { value: "Ya", label: "Ya" },
            { value: "Tidak", label: "Tidak" },
          ]}
        />
        <InputNumber
          label="Nomor Whatsapp"
          minLength={10}
          placeholder="Masukkan Nomor WhatsApp Anda"
          name="nomorWhatsapp"
          value={formData.nomorWhatsapp}
          onChange={(e) => setValue("nomorWhatsapp", e.target.value)}
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
          text="Selanjutnya"
          className="px-8 py-2"
          isSubmit
        />
      </div>
    </form>
  );
};

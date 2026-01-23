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
import React, { useState } from "react";
import { MandatoryLabel } from "../MandatoryLabel";

interface BiodataSiswaForm {
  adaKip: string;
  nomorWhatsapp: string;
  email: string;
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  nisn: string;
  asalSekolah: string;
}

interface BiodataSiswaProps {
  onNext: (data: BiodataSiswaForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
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
}) => {
  const [formData, setFormData] = useState<BiodataSiswaForm>({
    nama: "",
    nik: "",
    nisn: "",
    email: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    kodePos: "",
    asalSekolah: "",
    nomorWhatsapp: "",
    adaKip: "",
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
          label="Nama Lengkap (Sesuai KK)"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Masukkan Nama Lengkap Anda"
          isMandatory
        />
        <InputText
          label="Email Aktif"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Masukkan Email aktif Anda"
          isMandatory
          isEmail
        />
        <InputNumber
          label="NIK (Nomor Induk Kependudukan)"
          name="nik"
          limit={16}
          value={formData.nik}
          onChange={handleChange}
          placeholder="Masukkan NIK Anda"
          isMandatory
        />
        <InputNumber
          label="NISN (Nomor Induk Siswa Nasional)"
          name="nisn"
          value={formData.nisn}
          onChange={handleChange}
          placeholder="Masukkan NISN Anda"
          isMandatory
        />
        <InputText
          label="Tempat Lahir"
          name="tempatLahir"
          value={formData.tempatLahir}
          onChange={handleChange}
          placeholder="Masukkan Tempat Lahir Anda"
          isMandatory
        />
        <DateInput
          label="Tanggal Lahir"
          name="tanggalLahir"
          value={formData.tanggalLahir}
          onChange={handleChange}
          placeholder="Masukkan Tanggal Lahir Anda"
          isMandatory
        />
        <SearchableSelect
          label="Asal SMP/MTs"
          name="asalSekolah"
          value={formData.asalSekolah}
          onChange={handleChange}
          options={smpOptions}
          placeholder="Pilih atau ketik asal sekolah Anda"
          isMandatory
        />
        <InputTextArea
          label="Alamat"
          name="alamat"
          value={formData.alamat}
          placeholder="Masukkan Alamat Sesuai Dengan KTP Anda"
          isMandatory
          onChange={handleChange}
        />
        <SelectInput
          label="Jenis Kelamin"
          name="jenisKelamin"
          value={formData.jenisKelamin}
          onChange={handleChange}
          options={[
            { value: "Laki-laki", label: "Laki-laki" },
            { value: "Perempuan", label: "Perempuan" },
          ]}
          placeholder="Pilih Jenis Kelamin"
          isMandatory
        />
        <SelectInput
          label="Agama"
          name="agama"
          value={formData.agama}
          onChange={handleChange}
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
          value={formData.adaKip}
          onChange={handleChange}
          options={[
            { value: "Ya", label: "Ya" },
            { value: "Tidak", label: "Tidak" },
          ]}
        />
        <InputNumber
          label="Nomor Whatsapp Aktif"
          name="nomorWhatsapp"
          value={formData.nomorWhatsapp}
          onChange={handleChange}
          limit={15}
          placeholder="Masukkan Nomor Whatsapp Anda"
          isMandatory
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

"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import {
  InputNumber,
  InputText,
  InputTextArea,
} from "@/components/InputForm/TextInput";
import React from "react";
import { useForm } from "react-hook-form";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataWaliForm } from "@/utils/registrationTypes";

interface BiodataWaliProps {
  onNext: (data: BiodataWaliForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: BiodataWaliForm;
  onValidationError?: (message: string) => void;
}

export const BiodataWali: React.FC<BiodataWaliProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
  onValidationError,
}) => {
  const { register, handleSubmit, watch, setValue } = useForm<BiodataWaliForm>({
    defaultValues: initialData || {
      namaWali: "",
      nikWali: "",
      pekerjaanWali: "",
      penghasilanWali: "",
      alamatWali: "",
      noTelponWali: "",
      hubunganDenganSiswa: "",
    },
  });

  const formData = watch();

  const onSubmit = (data: BiodataWaliForm) => {
    if (!data.namaWali?.trim()) {
      onValidationError?.("Nama Wali harus diisi");
      return;
    }
    if (!data.noTelponWali?.trim()) {
      onValidationError?.("Nomor Telpon Wali harus diisi");
      return;
    }
    if (!data.alamatWali?.trim()) {
      onValidationError?.("Alamat Wali harus diisi");
      return;
    }
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <MandatoryLabel notes="Data wali hanya perlu diisi apabila orang tua tidak dapat dihubungi atau tidak tersedia." />
      <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5 max-sm:gap-y-2">
        <InputText
          label="Nama Wali"
          placeholder="Masukkan Nama Wali Anda"
          isMandatory
          name="namaWali"
          value={formData.namaWali}
          onChange={(e) => setValue("namaWali", e.target.value)}
        />
        <InputNumber
          label="Nomor Telpon Wali"
          limit={15}
          placeholder="Masukkan Nomor Telpon Wali"
          isMandatory
          name="noTelponWali"
          value={formData.noTelponWali}
          onChange={(e) => setValue("noTelponWali", e.target.value)}
        />
        <InputTextArea
          label="Alamat"
          placeholder="Masukkan Alamat Domisili Wali Anda"
          isMandatory
          name="alamatWali"
          value={formData.alamatWali}
          onChange={(e) => setValue("alamatWali", e.target.value)}
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

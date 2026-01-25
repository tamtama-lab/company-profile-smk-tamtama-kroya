"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataOrangTuaForm } from "@/utils/registrationTypes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { useAlert } from "@/components/ui/alert";

const biodataOrangTuaSchema = z.object({
  namaAyah: z.string().min(1, "Nama Ayah harus diisi"),
  kondisiAyah: z.string().min(1, "Kondisi Ayah harus dipilih"),
  namaIbu: z.string().min(1, "Nama Ibu harus diisi"),
  kondisiIbu: z.string().min(1, "Kondisi Ibu harus dipilih"),
  alamat: z.string().min(1, "Alamat harus diisi"),
});

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
}) => {
  const { showAlert } = useAlert();

  const form = useForm<BiodataOrangTuaForm>({
    resolver: zodResolver(biodataOrangTuaSchema),
    defaultValues: initialData || {
      namaAyah: "",
      kondisiAyah: "",
      namaIbu: "",
      kondisiIbu: "",
      alamat: "",
    },
  });

  const onSubmit = (data: BiodataOrangTuaForm) => {
    onNext(data);
  };

  const onError = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showAlert({
        title: "Data Tidak Lengkap",
        description: firstError.message,
        variant: "warning",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="w-full">
        <MandatoryLabel notes="Data yang memiliki tanda (*) merupakan data yang wajib diisi" />
        <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
          <FormField
            control={form.control}
            name="namaAyah"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Nama Ayah"
                    placeholder="Masukkan Nama Ayah Anda"
                    isMandatory
                    error={form.formState.errors.namaAyah?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kondisiAyah"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectInput
                    label="Kondisi Ayah"
                    {...field}
                    options={[
                      { value: "alive", label: "Hidup" },
                      { value: "deceased", label: "Meninggal" },
                    ]}
                    placeholder="Pilih Kondisi Ayah Anda"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="namaIbu"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Nama Ibu"
                    placeholder="Masukkan Nama Ibu Anda"
                    isMandatory
                    error={form.formState.errors.namaIbu?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kondisiIbu"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectInput
                    label="Kondisi Ibu"
                    {...field}
                    options={[
                      { value: "alive", label: "Hidup" },
                      { value: "deceased", label: "Meninggal" },
                    ]}
                    placeholder="Pilih Kondisi Ibu Anda"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormTextarea
                      {...field}
                      label="Alamat"
                      placeholder="Masukkan Alamat Domisili Orang Tua Anda"
                      isMandatory
                      error={form.formState.errors.alamat?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
    </Form>
  );
};

"use client";

import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { TextButton } from "@/components/Buttons/TextButton";
import { DateInput } from "@/components/InputForm/DateInput";
import { RadioInput } from "@/components/InputForm/RadioInput";
import SelectInput from "@/components/InputForm/SelectInput";
import { SearchableSelect } from "@/components/InputForm/SelectInput/SearchableSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataSiswaForm } from "@/utils/registrationTypes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  FormInput,
  FormInputNumber,
  FormTextarea,
} from "@/components/ui/form-input";
import { useAlert } from "@/components/ui/alert";

const biodataSiswaSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap harus diisi"),
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email harus diisi"),
  nik: z.string().default(""),
  nisn: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "NISN minimal 10 digit",
    }),
  tempatLahir: z.string().min(1, "Tempat lahir harus diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
  asalSekolah: z.string().min(1, "Asal sekolah harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus dipilih"),
  agama: z.string().min(1, "Agama harus dipilih"),
  adaKip: z.boolean(),
  nomorWhatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
});

type BiodataSiswaFormData = z.infer<typeof biodataSiswaSchema>;

interface BiodataSiswaProps {
  onNext: (data: BiodataSiswaForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: BiodataSiswaForm;
  onValidationError?: (message: string) => void;
}

export const BiodataSiswa: React.FC<BiodataSiswaProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
}) => {
  const { showAlert } = useAlert();

  const form = useForm({
    resolver: zodResolver(biodataSiswaSchema),
    defaultValues: initialData || {
      namaLengkap: "",
      email: "",
      nik: "",
      nisn: "",
      tempatLahir: "",
      tanggalLahir: "",
      asalSekolah: "",
      alamat: "",
      jenisKelamin: "", // Changed to empty string
      agama: "",
      adaKip: false,
      nomorWhatsapp: "",
    },
  });

  const onSubmit = (data: BiodataSiswaFormData) => {
    onNext(data as BiodataSiswaForm);
  };

  const fetchSchools = async (query: string): Promise<string[]> => {
    try {
      const res = await fetch(
        `/api/registrations/school-lookup?q=${encodeURIComponent(query)}`,
      );
      const result = await res.json();

      if (!res.ok) {
        // Handle error response
        if (result.errors && Array.isArray(result.errors)) {
          const errorMsg = result.errors[0]?.message || result.message;
          throw new Error(errorMsg);
        }
        throw new Error(result.message || "Gagal mengambil data sekolah");
      }

      const schools = result.data || [];
      return Array.isArray(schools) ? schools : [];
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data sekolah";
      throw new Error(message);
    }
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
            name="namaLengkap"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Nama Lengkap (Sesuai KK)"
                    placeholder="Masukkan Nama Lengkap Anda"
                    isMandatory
                    isUppercase
                    error={form.formState.errors.namaLengkap?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Email Aktif"
                    placeholder="Masukkan Email Aktif Anda"
                    isMandatory
                    isEmail
                    error={form.formState.errors.email?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInputNumber
                    {...field}
                    label="NIK (Nomor Induk Kependudukan)"
                    limit={16}
                    placeholder="Masukkan NIK Anda"
                    error={form.formState.errors.nik?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nisn"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInputNumber
                    {...field}
                    label="NISN (Nomor Induk Siswa Nasional)"
                    minLength={10}
                    placeholder="Masukkan NISN Anda"
                    error={form.formState.errors.nisn?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempatLahir"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Tempat Lahir"
                    placeholder="Masukkan Tempat Lahir Anda"
                    isMandatory
                    error={form.formState.errors.tempatLahir?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggalLahir"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DateInput
                    label="Tanggal Lahir"
                    name="tanggalLahir"
                    placeholder="Masukkan Tanggal Lahir Anda"
                    max={new Date().toISOString().split("T")[0]}
                    isMandatory
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : "",
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asalSekolah"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SearchableSelect
                    label="Asal SMP/MTs"
                    {...field}
                    fetchOptions={fetchSchools}
                    minChars={3}
                    placeholder="Pilih Asal Sekolah Anda"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormTextarea
                    {...field}
                    label="Alamat"
                    placeholder="Masukkan Alamat Sesuai Dengan KTP Anda"
                    isMandatory
                    error={form.formState.errors.alamat?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jenisKelamin"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectInput
                    label="Jenis Kelamin"
                    {...field}
                    options={[
                      { value: "1", label: "Laki-laki" },
                      { value: "2", label: "Perempuan" },
                    ]}
                    placeholder="Pilih Jenis Kelamin"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agama"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectInput
                    label="Agama"
                    {...field}
                    options={[
                      { value: "islam", label: "Islam" },
                      { value: "christian", label: "Kristen" },
                      { value: "catholic", label: "Katolik" },
                      { value: "hindu", label: "Hindu" },
                      { value: "buddhist", label: "Buddha" },
                      { value: "confucianism", label: "Konghucu" },
                    ]}
                    placeholder="Pilih Agama"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adaKip"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioInput
                    label="Apakah Memiliki KIP?"
                    name="adaKip"
                    isMandatory
                    value={field.value ? "Ya" : "Tidak"}
                    onChange={(e) => {
                      field.onChange(e.target.value === "Ya");
                    }}
                    options={[
                      { value: "Ya", label: "Ya" },
                      { value: "Tidak", label: "Tidak" },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nomorWhatsapp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInputNumber
                    {...field}
                    label="Nomor Whatsapp"
                    minLength={10}
                    placeholder="Masukkan Nomor WhatsApp Anda"
                    error={form.formState.errors.nomorWhatsapp?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
    </Form>
  );
};

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

const biodataSiswaSchema = z
  .object({
    namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z
      .string()
      .email("Format email tidak valid")
      .min(1, "Email wajib diisi"),
    nik: z.string().min(1, "NIK wajib diisi").length(16, "NIK harus 16 digit"),
    nisn: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: "NISN minimal 10 digit",
      }),
    tempatLahir: z.string().min(1, "Tempat Lahir wajib diisi"),
    tanggalLahir: z.string().min(1, "Tanggal Lahir wajib diisi"),
    asalSekolah: z.string().min(1, "Asal SMP/MTs wajib diisi"),
    alamat: z.string().min(1, "Alamat wajib diisi"),
    jenisKelamin: z.string().min(1, "Jenis Kelamin wajib diisi"),
    agama: z.string().min(1, "Agama wajib diisi"),
    adaKip: z.boolean(),
    nomorKip: z
      .string()
      .optional()
      .refine((val) => !val || val.length <= 10, {
        message: "Nomor KIP maksimal 10 digit",
      }),
    nomorWhatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  })
  .superRefine((data, ctx) => {
    if (data.adaKip) {
      if (!data.nomorKip || String(data.nomorKip).trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nomorKip"],
          message: "Nomor KIP wajib diisi",
        });
      }
    }
  });

type BiodataSiswaFormData = z.infer<typeof biodataSiswaSchema>;

interface BiodataSiswaProps {
  onNext: (data: BiodataSiswaForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: BiodataSiswaForm;
  onValidationError?: (message: string) => void;
  isTeacherMode?: boolean;
}

export const BiodataSiswa: React.FC<BiodataSiswaProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
  isTeacherMode = false,
}) => {
  const { showAlert } = useAlert();

  const [nikValid, setNikValid] = React.useState<boolean | null>(null);
  const [checkingNik, setCheckingNik] = React.useState(false);

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
      nomorKip: "",
      nomorWhatsapp: "",
    },
  });

  const onSubmit = async (data: BiodataSiswaFormData) => {
    const nikVal = data.nik;

    try {
      if (checkingNik) {
        showAlert({
          title: "Sedang Memeriksa NIK",
          description: "Harap tunggu sampai pemeriksaan NIK selesai.",
          variant: "warning",
        });
        return;
      }

      if (!nikVal || nikVal.length < 16) {
        form.setError("nik", { type: "manual", message: "NIK harus 16 digit" });
        showAlert({
          title: "NIK Tidak Lengkap",
          description: "NIK harus 16 digit",
          variant: "warning",
        });
        return;
      }

      // If we already know it's invalid, block
      if (nikValid === false) {
        form.setError("nik", {
          type: "manual",
          message: "NIK sudah digunakan",
        });
        showAlert({
          title: "NIK Sudah Digunakan",
          description: "NIK sudah digunakan. Tidak bisa melanjutkan.",
          variant: "warning",
        });
        return;
      }

      // Validation must have been done on the NIK field (onBlur). If it hasn't been done, block and ask user to validate first.
      if (nikValid === null) {
        form.setError("nik", {
          type: "manual",
          message: "Nomor NIK tersebut sudah terdaftar di sistem.",
        });
        showAlert({
          title: "NIK Tersebut Sudah Ada",
          description:
            "Cek ulang NIK yang dimasukkan dan tulis ulang NIK yang benar",
          variant: "warning",
        });
        return;
      }

      // At this point, NIK is valid
      onNext(data as BiodataSiswaForm);
    } catch (err) {
      setCheckingNik(false);
      showAlert({
        title: "Gagal Memproses Form",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses form",
        variant: "warning",
      });
    }
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

  const checkNik = async (nikValue: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/registrations/check-nik?nik=${encodeURIComponent(nikValue)}`,
      );
      const result = await res.json();

      if (!res.ok) {
        // Handle error response
        if (result.errors && Array.isArray(result.errors)) {
          const errorMsg = result.errors[0]?.message || result.message;
          throw new Error(errorMsg);
        }
        throw new Error(result.message || "Gagal memeriksa NIK");
      }

      // Expect response: { valid: true|false }
      if (typeof result.valid === "boolean") {
        return result.valid;
      }

      // Fallback: if result.data is present and truthy
      if (result.data !== undefined) {
        return Boolean(result.data);
      }

      return false;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memeriksa NIK";
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
                    placeholder={
                      "Masukkan Nama Lengkap " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    placeholder={
                      "Masukkan Email Aktif " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    isMandatory
                    placeholder={
                      "Masukkan NIK " + (isTeacherMode ? "Calon Murid" : "Anda")
                    }
                    error={form.formState.errors.nik?.message}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e);
                      setNikValid(null);
                      if (form.formState.errors.nik) {
                        form.clearErrors("nik");
                      }
                    }}
                    onBlur={async (e: React.FocusEvent<HTMLInputElement>) => {
                      field.onBlur?.();
                      const val = String(e.target.value || "");
                      // Only check when it looks like a full NIK (16 digits)
                      if (!val || val.length < 16) return;
                      try {
                        setCheckingNik(true);
                        const isValid = await checkNik(val);
                        setCheckingNik(false);
                        setNikValid(isValid);

                        if (!isValid) {
                          form.setError("nik", {
                            type: "manual",
                            message: "NIK sudah digunakan",
                          });
                          showAlert({
                            title: "NIK Sudah Digunakan",
                            description:
                              "NIK sudah digunakan. Silakan periksa kembali atau gunakan NIK lain.",
                            variant: "warning",
                          });
                        } else {
                          form.clearErrors("nik");
                        }
                      } catch (err) {
                        setCheckingNik(false);
                        showAlert({
                          title: "Gagal Memeriksa NIK",
                          description:
                            err instanceof Error
                              ? err.message
                              : "Terjadi kesalahan saat memeriksa NIK",
                          variant: "warning",
                        });
                      }
                    }}
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
                    placeholder={
                      "Masukkan NISN " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    placeholder={
                      "Masukkan Tempat Lahir " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    placeholder={
                      "Masukkan Tanggal Lahir " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    error={form.formState.errors.asalSekolah?.message}
                    placeholder={
                      "Masukkan Asal Sekolah " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
                    isMandatory
                  />
                </FormControl>
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
                    placeholder={
                      "Masukkan Alamat " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    placeholder={
                      "Pilih Jenis Kelamin " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
                    placeholder={
                      "Pilih Agama " + (isTeacherMode ? "Calon Murid" : "Anda")
                    }
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col max-sm:gap-4">
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

            {/* Conditional KIP Number field */}
            {form.watch("adaKip") && (
              <FormField
                control={form.control}
                name="nomorKip"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormInputNumber
                        {...field}
                        label="Nomor KIP"
                        placeholder="Masukkan Nomor KIP"
                        isMandatory
                        limit={10}
                        error={form.formState.errors.nomorKip?.message}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e);
                          if (form.formState.errors.nomorKip) {
                            form.clearErrors("nomorKip");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

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
                    limit={15}
                    placeholder={
                      "Masukkan Nomor WhatsApp " +
                      (isTeacherMode ? "Calon Murid" : "Anda")
                    }
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
            disabled={checkingNik}
          />
        </div>
      </form>
    </Form>
  );
};

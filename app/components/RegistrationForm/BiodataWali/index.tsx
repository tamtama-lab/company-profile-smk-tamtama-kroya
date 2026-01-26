"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MandatoryLabel } from "../MandatoryLabel";
import { BiodataWaliForm } from "@/utils/registrationTypes";
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
import { useForm } from "react-hook-form";

const biodataWaliSchema = z.object({
  namaWali: z.string().optional(),
  alamatWali: z.string().optional(),
  noTelponWali: z.string().optional(),
});

type BiodataWaliFormData = z.infer<typeof biodataWaliSchema>;

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
}) => {
  const { showAlert } = useAlert();

  const form = useForm({
    resolver: zodResolver(biodataWaliSchema),
    defaultValues: initialData || {
      namaWali: "",
      alamatWali: "",
      noTelponWali: "",
    },
  });

  const onSubmit = (data: BiodataWaliFormData) => {
    onNext(data as BiodataWaliForm);
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
        <MandatoryLabel notes="Data wali hanya perlu diisi apabila orang tua tidak dapat dihubungi atau tidak tersedia." />
        <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5 max-sm:gap-y-4">
          <FormField
            control={form.control}
            name="namaWali"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    {...field}
                    label="Nama Wali"
                    placeholder="Masukkan Nama Wali Anda"
                    error={form.formState.errors.namaWali?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="noTelponWali"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInputNumber
                    {...field}
                    label="Nomor Telpon Wali"
                    limit={15}
                    placeholder="Masukkan Nomor Telpon Wali"
                    error={form.formState.errors.noTelponWali?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2 max-sm:col-span-1">
            <FormField
              control={form.control}
              name="alamatWali"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormTextarea
                      {...field}
                      label="Alamat"
                      placeholder="Masukkan Alamat Domisili Wali Anda"
                      error={form.formState.errors.alamatWali?.message}
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

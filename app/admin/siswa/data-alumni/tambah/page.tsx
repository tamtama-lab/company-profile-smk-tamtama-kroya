"use client";

import z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextButton } from "@/components/Buttons/TextButton";
import { TitleSection } from "@/components/TitleSection";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { useAlert } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getAuthHeader } from "@/utils/auth";
import { transformAdonisValidationErrors } from "@/utils/adonisErrorTranslator";
import PhotoUpload from "@/components/Upload/PhotoUpload";
import { SectionCard } from "@/components/Card/SectionCard";
import SelectInput from "@/components/InputForm/SelectInput";
import { SearchableSelect } from "@/components/InputForm/SelectInput/SearchableSelect";
import { YEAR_MAX, YEAR_MIN, YEAR_OPTIONS_LIMIT } from "../type";

const AlumniSchema = z.object({
  name: z.string().min(1, "Nama alumni harus diisi"),
  major: z.string().min(1, "Jurusan harus diisi"),
  generationYear: z
    .string()
    .min(1, "Tahun angkatan harus diisi")
    .refine((value) => {
      const numericYear = Number(value);
      return (
        Number.isFinite(numericYear) &&
        numericYear >= YEAR_MIN &&
        numericYear <= YEAR_MAX
      );
    }, "Tahun angkatan tidak valid"),
  currentJob: z.string().min(1, "Pekerjaan saat ini harus diisi"),
});

export default function AdminAddAlumniPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [majorOptions, setMajorOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);

  const allYearOptions = useMemo(
    () =>
      Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, index) => {
        const year = YEAR_MAX - index;
        return {
          value: String(year),
          label: String(year),
        };
      }),
    [],
  );

  const form = useForm<z.infer<typeof AlumniSchema>>({
    resolver: zodResolver(AlumniSchema),
    defaultValues: {
      name: "",
      major: "",
      generationYear: String(YEAR_MAX),
      currentJob: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    const fetchMajors = async () => {
      setIsLoadingMajors(true);
      try {
        const response = await fetch("/api/filters/options", {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal memuat data jurusan");
        }

        const data = await response.json();
        const mappedMajors = (data.majors || []).map(
          (major: { name: string; abbreviation: string }) => ({
            value: major.abbreviation,
            label: `Jurusan ${major.name} (${major.abbreviation})`,
          }),
        );

        if (!cancelled) {
          setMajorOptions(mappedMajors);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
        if (!cancelled) {
          showAlert({
            title: "Gagal",
            description: "Gagal memuat daftar jurusan",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMajors(false);
        }
      }
    };

    fetchMajors();

    return () => {
      cancelled = true;
    };
  }, [showAlert]);

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/backoffice/alumni/photo", {
        method: "POST",
        body: formData,
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Gagal mengunggah foto");
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error("Error uploading alumni photo:", error);
      showAlert({
        title: "Gagal",
        description: "Gagal mengunggah foto",
        variant: "error",
      });
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof AlumniSchema>) => {
    if (!photoFile) {
      showAlert({
        title: "Validasi",
        description: "Foto alumni harus diunggah",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const photoUrl = await uploadPhoto(photoFile);
      if (!photoUrl) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/backoffice/alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: values.name,
          major: values.major,
          generationYear: Number(values.generationYear),
          photoUrl,
          currentJob: values.currentJob,
          isPublished,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          const translatedErrors = transformAdonisValidationErrors(
            errorData.errors,
          );
          showAlert({
            title: "Validasi Gagal",
            description:
              errorData.message || "Periksa kembali data yang dimasukkan",
            variant: "error",
            errors: translatedErrors,
            autoDismissMs: undefined,
          });
          setIsLoading(false);
          return;
        }

        throw new Error(errorData.message || "Gagal menambah alumni");
      }

      showAlert({
        title: "Berhasil",
        description: "Data alumni berhasil ditambahkan",
        variant: "success",
      });
      router.push("/admin/siswa/data-alumni");
    } catch (error) {
      console.error("Error creating alumni:", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal menambah alumni",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Tambah Alumni"
          subtitle="Tambahkan data alumni baru SMK Tamtama Kroya."
        />
        <SectionCard
          title="Tambah Data Alumni"
          saveButtonText="Simpan Data"
          className="w-full"
          cardFooter={false}
        >
          {" "}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-6">
              <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormInput
                          {...field}
                          label="Nama Lengkap Alumni"
                          placeholder="Masukkan nama alumni"
                          isMandatory
                          error={form.formState.errors.name?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentJob"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormInput
                          {...field}
                          label=" Lokasi Alumni Bekerja Saat Ini"
                          placeholder="Masukkan nama tempat alumni bekerja"
                          isMandatory
                          error={form.formState.errors.currentJob?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SelectInput
                          {...field}
                          label="Jurusan Alumni"
                          options={majorOptions}
                          placeholder="Pilih jurusan"
                          disabled={isLoadingMajors || isLoading}
                          isMandatory
                          error={form.formState.errors.major?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PhotoUpload
                  className="row-span-3"
                  previewUrl={photoPreview}
                  onFileSelect={handlePhotoChange}
                  onFileRemove={handlePhotoRemove}
                  onValidationError={(message) => {
                    showAlert({
                      title: "Validasi Foto",
                      description: message,
                      variant: "error",
                    });
                  }}
                  disabled={isLoading}
                  label="Foto Alumni"
                  maxSizeInMB={5}
                  isMandatory={true}
                />

                <FormField
                  control={form.control}
                  name="generationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SearchableSelect
                          {...field}
                          label="Tahun Angkatan Alumni"
                          options={allYearOptions}
                          maxDisplayOptions={YEAR_OPTIONS_LIMIT}
                          placeholder="Pilih tahun angkatan"
                          isAddValueActive={false}
                          allowClear={false}
                          minChars={0}
                          isMandatory
                          error={form.formState.errors.generationYear?.message}
                          className={
                            isLoading ? "pointer-events-none opacity-60" : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 mt-10 max-sm:flex-col">
                <Link href="/admin/siswa/data-alumni">
                  <TextButton
                    variant="outline"
                    text="Kembali"
                    className="px-8 py-2 w-fit"
                    disabled={isLoading}
                  />
                </Link>
                <TextButton
                  variant="primary"
                  text="Simpan"
                  className="px-8 py-2 w-fit"
                  isSubmit
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              </div>
            </form>
          </Form>
        </SectionCard>
        {/* <div className="w-full bg-white"></div> */}
      </div>
    </div>
  );
}

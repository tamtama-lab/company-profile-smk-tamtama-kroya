"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import z from "zod";
import { getAuthHeader } from "@/utils/auth";
import { transformAdonisValidationErrors } from "@/utils/adonisErrorTranslator";
import SearchableMultiSelect from "@/components/InputForm/SearchableMultiSelect";
import PhotoUpload from "@/components/Upload/PhotoUpload";
import LoadingState from "@/components/ui/LoadingState";

interface SchoolLesson {
  id: number;
  name: string;
  abbreviation: string;
}

interface TeacherData {
  id: number;
  fullName: string;
  username: string;
  photoUrl: string | null;
  schoolLessons: Array<{
    id: number;
    name: string;
    abbreviation: string;
  }>;
}

interface TeacherUpdatePayload {
  fullName: string;
  username: string;
  schoolLessonIds: number[];
  password?: string;
  photoUrl?: string;
}

export default function AdminEditTeacherAccountPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const teacherId = params.id as string;

  const [schoolLessons, setSchoolLessons] = useState<SchoolLesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true);

  const TeacherSchema = z.object({
    fullName: z.string().min(1, "Nama Lengkap harus diisi"),
    username: z.string().min(1, "Username harus diisi"),
    password: z.string().optional(),
  });

  const form = useForm<z.infer<typeof TeacherSchema>>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
    },
  });

  // Fetch teacher data
  const fetchTeacherData = useCallback(async () => {
    setIsLoadingTeacher(true);
    try {
      const response = await fetch(`/api/backoffice/teachers/${teacherId}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) throw new Error("Failed to fetch teacher data");

      const data: TeacherData = await response.json();

      // Set form values
      form.reset({
        fullName: data.fullName,
        username: data.username,
        password: "",
      });

      // Set selected lessons
      const lessonIds = data.schoolLessons.map((lesson) => lesson.id);
      setSelectedLessons(lessonIds);

      // Set photo preview if exists
      if (data.photoUrl) {
        setPhotoPreview(data.photoUrl);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data guru",
        variant: "error",
      });
    } finally {
      setIsLoadingTeacher(false);
    }
  }, [teacherId, form, showAlert]);

  // Fetch school lessons
  const fetchSchoolLessons = useCallback(async () => {
    setIsLoadingLessons(true);
    try {
      const response = await fetch("/api/school-lessons", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) throw new Error("Failed to fetch school lessons");

      const data = await response.json();
      setSchoolLessons(data);
    } catch (error) {
      console.error("Error fetching school lessons:", error);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat daftar mata pelajaran",
        variant: "error",
      });
    } finally {
      setIsLoadingLessons(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchSchoolLessons();
    fetchTeacherData();
  }, [fetchSchoolLessons, fetchTeacherData]);

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
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

      const response = await fetch("/api/backoffice/teachers/photo", {
        method: "POST",
        body: formData,
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      showAlert({
        title: "Gagal",
        description: "Gagal mengunggah foto",
        variant: "error",
      });
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof TeacherSchema>) => {
    setIsLoading(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo if new photo is selected
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
        if (!photoUrl) {
          setIsLoading(false);
          return;
        }
      }

      // Prepare update payload
      const updatePayload: TeacherUpdatePayload = {
        fullName: values.fullName,
        username: values.username,
        schoolLessonIds: selectedLessons,
      };

      // Only include password if provided
      if (values.password && values.password.length > 0) {
        updatePayload.password = values.password;
      }

      // Only include photoUrl if new photo was uploaded
      if (photoUrl) {
        updatePayload.photoUrl = photoUrl;
      }

      // Update teacher account
      const response = await fetch(`/api/backoffice/teachers/${teacherId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors from backend
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

        throw new Error(errorData.message || "Gagal mengupdate akun guru");
      }

      showAlert({
        title: "Berhasil",
        description: "Akun guru berhasil diupdate",
        variant: "success",
      });
      router.push("/admin/guru/akun-guru");
    } catch (error) {
      console.error("Error updating teacher:", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal mengupdate akun guru",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTeacher) {
    return <LoadingState message="Memuat data guru..." />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Edit Akun Guru"
          subtitle="Perbarui informasi akun guru. Kosongkan password jika tidak ingin mengubahnya."
        />
        <div className="w-full bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-6">
              <div className="grid grid-cols-2 gap-x-5 max-sm:grid-cols-1 gap-y-5">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormInput
                          {...field}
                          label="Username"
                          placeholder="Masukkan Username"
                          isMandatory
                          error={form.formState.errors.username?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormInput
                          {...field}
                          label="Password"
                          type="password"
                          placeholder="Kosongkan jika tidak ingin mengubah"
                          isMandatory={false}
                          error={form.formState.errors.password?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormInput
                          {...field}
                          label="Nama Guru"
                          placeholder="Masukkan Nama Guru"
                          isMandatory
                          error={form.formState.errors.fullName?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Lessons - Searchable Multi Select */}
                <SearchableMultiSelect
                  options={schoolLessons.map((lesson) => ({
                    value: lesson.id,
                    label: `${lesson.name} ${lesson.abbreviation ? `(${lesson.abbreviation})` : ""}`,
                  }))}
                  selectedValues={selectedLessons}
                  onSelectionChange={(values) =>
                    setSelectedLessons(values.map((v) => Number(v)))
                  }
                  placeholder="Pilih Mata Pelajaran"
                  searchPlaceholder="Cari mata pelajaran..."
                  label="Mata Pelajaran"
                  isMandatory={false} // Changed to make it non-mandatory
                  isLoading={isLoadingLessons}
                  disabled={isLoadingLessons || isLoading}
                />

                {/* Photo Upload */}
                <PhotoUpload
                  previewUrl={photoPreview}
                  onFileSelect={handlePhotoChange}
                  onFileRemove={handlePhotoRemove}
                  disabled={isLoading}
                  label="Foto Profil"
                  isMandatory={false}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-10 max-sm:flex-col">
                <Link href="/admin/guru/akun-guru">
                  <TextButton
                    variant="outline"
                    text="Kembali"
                    className="px-8 py-2 w-fit"
                    disabled={isLoading}
                  />
                </Link>
                <TextButton
                  variant="primary"
                  text="Simpan Perubahan"
                  className="px-8 py-2 w-fit"
                  isSubmit
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

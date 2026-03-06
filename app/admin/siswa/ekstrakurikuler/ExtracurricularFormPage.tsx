"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuGripVertical, LuPlus, LuTrash2 } from "react-icons/lu";
import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import { TitleSection } from "@/components/TitleSection";
import { useAlert } from "@/components/ui/alert";
import PhotoUpload from "@/components/Upload/PhotoUpload";
import MultipleImageUploader from "@/components/Upload/MultipleImageUploader";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { getAuthHeader } from "@/utils/auth";
import { createClientId, normalizeItem, toSlug } from "./helpers";
import {
  ExtracurricularAchievementInputItem,
  ExtracurricularFormMode,
  ExtracurricularFormValues,
  ExtracurricularGalleryInputItem,
  ExtracurricularItem,
} from "./type";

type FormErrorState = Partial<
  Record<
    | "name"
    | "categoryId"
    | "description"
    | "thumbnailUrl"
    | "mentorName"
    | "schedule"
    | "location",
    string
  >
>;

type InlineActionAlert = {
  variant: "success" | "error";
  message: string;
};

const DEFAULT_FORM_VALUES: ExtracurricularFormValues = {
  name: "",
  slug: "",
  categoryId: "",
  mentorName: "",
  schedule: "",
  location: "",
  description: "",
  thumbnailUrl: "",
  isPublished: true,
};

const CATEGORY_OPTIONS_ENDPOINT = "/api/extracurriculars/categories";

interface CategoryOptionPayloadItem {
  id: number;
  name: string;
}

const toCategoryOptionPayload = (
  payload: unknown,
): CategoryOptionPayloadItem[] => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Array.isArray((payload as Record<string, unknown>).data)
        ? ((payload as Record<string, unknown>).data as unknown[])
        : Array.isArray((payload as Record<string, unknown>).items)
          ? ((payload as Record<string, unknown>).items as unknown[])
          : []
      : [];

  return rawItems
    .map((item, index) => {
      if (typeof item === "string") {
        const name = item.trim();

        if (!name) {
          return null;
        }

        return {
          id: index + 1,
          name,
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const root = item as Record<string, unknown>;
      const name = typeof root.name === "string" ? root.name.trim() : "";
      const parsedId = Number(root.id);

      if (!name) {
        return null;
      }

      return {
        id:
          Number.isFinite(parsedId) && parsedId > 0
            ? Math.floor(parsedId)
            : index + 1,
        name,
      };
    })
    .filter((item): item is CategoryOptionPayloadItem => Boolean(item));
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file thumbnail"));
    reader.readAsDataURL(file);
  });

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

const toObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const extractCreatedPhotoUrl = (payload: unknown): string | null => {
  const root = toObject(payload);
  const data = toObject(root.data);
  const gallery = toObject(root.gallery);

  const photoUrlCandidate =
    root.photoUrl ?? data.photoUrl ?? gallery.photoUrl ?? null;

  if (typeof photoUrlCandidate !== "string") {
    return null;
  }

  const normalizedPhotoUrl = photoUrlCandidate.trim();
  return normalizedPhotoUrl ? normalizedPhotoUrl : null;
};

interface ExtracurricularFormPageProps {
  mode: ExtracurricularFormMode;
  slug?: string;
}

export default function ExtracurricularFormPage({
  mode,
  slug,
}: ExtracurricularFormPageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const isEditMode = mode === "edit";

  const [isLoadingDetail, setIsLoadingDetail] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] =
    useState<ExtracurricularFormValues>(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<FormErrorState>({});
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [galleryItems, setGalleryItems] = useState<
    ExtracurricularGalleryInputItem[]
  >([]);
  const [achievementItems, setAchievementItems] = useState<
    ExtracurricularAchievementInputItem[]
  >([]);
  const [draggingAchievementClientId, setDraggingAchievementClientId] =
    useState<string | null>(null);
  const [newAchievementName, setNewAchievementName] = useState("");
  const [galleryUploadAlert, setGalleryUploadAlert] =
    useState<InlineActionAlert | null>(null);
  const [achievementAddAlert, setAchievementAddAlert] =
    useState<InlineActionAlert | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isFormBusy = isSubmitting;

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch(CATEGORY_OPTIONS_ENDPOINT, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat kategori ekstrakurikuler");
        }

        const payload = (await response.json()) as unknown;
        const categories = toCategoryOptionPayload(payload);

        if (cancelled) {
          return;
        }

        const seenIds = new Set<number>();

        setCategoryOptions(
          categories
            .filter((category) => {
              if (seenIds.has(category.id)) {
                return false;
              }

              seenIds.add(category.id);
              return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => ({
              value: String(category.id),
              label: category.name,
            })),
        );
      } catch (error) {
        console.error("Failed fetch extracurricular categories", error);

        if (!cancelled) {
          setCategoryOptions([]);
        }
      }
    };

    fetchCategoryOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode || !slug) {
      setIsLoadingDetail(false);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setIsLoadingDetail(true);

        const detailRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(slug)}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!detailRes.ok) {
          throw new Error("Gagal memuat detail ekstrakurikuler");
        }

        const detailPayload = await detailRes.json();
        const detail = normalizeItem(
          (detailPayload?.data ||
            detailPayload) as Partial<ExtracurricularItem>,
        );

        if (cancelled) {
          return;
        }

        const normalizedCategoryId =
          detail.categoryId ?? detail.category?.id ?? null;
        const normalizedCategoryName = detail.category?.name?.trim() || "";

        if (normalizedCategoryId && normalizedCategoryName) {
          setCategoryOptions((prev) => {
            const categoryIdValue = String(normalizedCategoryId);

            if (prev.some((option) => option.value === categoryIdValue)) {
              return prev;
            }

            return [
              ...prev,
              {
                value: categoryIdValue,
                label: normalizedCategoryName,
              },
            ].sort((a, b) => a.label.localeCompare(b.label));
          });
        }

        setFormValues({
          name: detail.name,
          slug: detail.slug,
          categoryId: normalizedCategoryId ? String(normalizedCategoryId) : "",
          mentorName: detail.mentorName,
          schedule: detail.schedule,
          location: detail.location,
          description: detail.description,
          thumbnailUrl: detail.thumbnailUrl,
          isPublished: detail.isPublished,
        });
        setThumbnailPreview(detail.thumbnailUrl);

        const normalizedGalleries = sortByOrder(
          (detail.galleries || []).map((item) => ({
            clientId: createClientId("gallery-existing"),
            id: Number(item.id || 0),
            previewUrl: String(item.photoUrl || ""),
            order: Number(item.order || 0),
          })),
        );

        const normalizedAchievements = sortByOrder(
          (detail.achievements || []).map((item) => ({
            clientId: createClientId("achievement-existing"),
            id: Number(item.id || 0),
            name: String(item.name || "").trim(),
            order: Number(item.order || 0),
          })),
        );

        setGalleryItems(normalizedGalleries);
        setAchievementItems(normalizedAchievements);
      } catch (error) {
        console.error("Failed fetch extracurricular detail", error);
        showAlert({
          title: "Gagal",
          description: "Gagal memuat data ekstrakurikuler",
          variant: "error",
        });
        router.push("/admin/siswa/ekstrakurikuler");
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, slug, showAlert, router]);

  useEffect(() => {
    if (!galleryUploadAlert) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setGalleryUploadAlert(null);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [galleryUploadAlert]);

  useEffect(() => {
    if (!achievementAddAlert) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setAchievementAddAlert(null);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [achievementAddAlert]);

  const handleThumbnailChange = (file: File | null) => {
    if (!file) {
      setThumbnailFile(null);
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailPreview(String(event.target?.result || ""));
    };
    reader.readAsDataURL(file);

    setFormErrors((prev) => ({ ...prev, thumbnailUrl: undefined }));
  };

  const handleThumbnailRemove = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setFormValues((prev) => ({ ...prev, thumbnailUrl: "" }));
  };

  const normalizeGalleryInputOrder = (
    items: ExtracurricularGalleryInputItem[],
  ) => items.map((item, index) => ({ ...item, order: index }));

  const normalizeAchievementInputOrder = (
    items: ExtracurricularAchievementInputItem[],
  ) => items.map((item, index) => ({ ...item, order: index }));

  const handleGalleryItemsChange = (
    nextItemsInput: ExtracurricularGalleryInputItem[],
  ) => {
    const previousItems = normalizeGalleryInputOrder(sortByOrder(galleryItems));
    const nextItems = normalizeGalleryInputOrder(sortByOrder(nextItemsInput));
    const previousItemMap = new Map(
      previousItems.map((item) => [item.clientId, item]),
    );
    const addedItemsCount = nextItems.filter(
      (item) => !previousItemMap.has(item.clientId) && Boolean(item.file),
    ).length;

    setGalleryItems(nextItems);

    if (addedItemsCount > 0) {
      setGalleryUploadAlert({
        variant: "success",
        message: `${addedItemsCount} foto ditambahkan. Klik Simpan untuk menerapkan perubahan.`,
      });
      return;
    }

    setGalleryUploadAlert(null);
  };

  const addAchievement = () => {
    const name = newAchievementName.trim();

    if (!name || isSubmitting) {
      return;
    }

    setAchievementItems((prev) =>
      normalizeAchievementInputOrder([
        ...sortByOrder(prev),
        {
          clientId: createClientId("achievement-new"),
          name,
          order: prev.length,
        },
      ]),
    );

    setAchievementAddAlert({
      variant: "success",
      message: "Prestasi ditambahkan. Klik Simpan untuk menerapkan perubahan.",
    });
    setNewAchievementName("");
  };

  const removeAchievement = (clientId: string) => {
    setAchievementItems((prev) =>
      normalizeAchievementInputOrder(
        sortByOrder(prev).filter((item) => item.clientId !== clientId),
      ),
    );
  };

  const handleAchievementDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    clientId: string,
  ) => {
    if (isSubmitting) {
      return;
    }

    setDraggingAchievementClientId(clientId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clientId);
  };

  const handleAchievementDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (isSubmitting) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleAchievementDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetClientId: string,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const sourceClientId =
      event.dataTransfer.getData("text/plain") || draggingAchievementClientId;

    setDraggingAchievementClientId(null);

    if (!sourceClientId || sourceClientId === targetClientId) {
      return;
    }

    const previousItems = normalizeAchievementInputOrder(
      sortByOrder(achievementItems),
    );
    const fromIndex = previousItems.findIndex(
      (item) => item.clientId === sourceClientId,
    );
    const toIndex = previousItems.findIndex(
      (item) => item.clientId === targetClientId,
    );

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const reorderedItems = [...previousItems];
    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    reorderedItems.splice(toIndex, 0, movedItem);

    const nextItems = normalizeAchievementInputOrder(reorderedItems);

    setAchievementItems(nextItems);
  };

  const handleAchievementDragEnd = () => {
    setDraggingAchievementClientId(null);
  };

  const validateForm = () => {
    const nextErrors: FormErrorState = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Nama ekskul wajib diisi";
    }
    if (!formValues.mentorName.trim()) {
      nextErrors.mentorName = "Nama pembina wajib diisi";
    }
    if (!formValues.categoryId.trim()) {
      nextErrors.categoryId = "Kategori wajib dipilih";
    }
    if (!formValues.schedule.trim()) {
      nextErrors.schedule = "Jadwal wajib diisi";
    }
    if (!formValues.location.trim()) {
      nextErrors.location = "Lokasi wajib diisi";
    }
    if (!formValues.description.trim()) {
      nextErrors.description = "Deskripsi wajib diisi";
    }
    if (!thumbnailFile && !formValues.thumbnailUrl.trim()) {
      nextErrors.thumbnailUrl = "Thumbnail wajib diisi";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadThumbnailIfNeeded = async () => {
    if (!thumbnailFile) {
      return formValues.thumbnailUrl;
    }

    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    const response = await fetch("/api/backoffice/extracurriculars/thumbnail", {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Gagal upload thumbnail");
    }

    const data = await response.json();
    return (
      data.thumbnailUrl || data.photoUrl || (await fileToDataUrl(thumbnailFile))
    );
  };

  const uploadGalleryPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(
      "/api/backoffice/extracurriculars/galleries/upload",
      {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.message || "Gagal upload foto galeri");
    }

    const photoUrl = extractCreatedPhotoUrl(responseData);

    if (!photoUrl) {
      throw new Error("URL foto galeri tidak ditemukan dari response API");
    }

    return photoUrl;
  };

  const getCreatePayloadGalleries = async () => {
    const sortedGalleries = sortByOrder(galleryItems);
    const galleries: string[] = [];

    for (const gallery of sortedGalleries) {
      if (gallery.file) {
        galleries.push(await uploadGalleryPhoto(gallery.file));
        continue;
      }

      const previewUrl = String(gallery.previewUrl || "").trim();

      if (previewUrl && !previewUrl.startsWith("data:")) {
        galleries.push(previewUrl);
      }
    }

    return galleries;
  };

  const getCreatePayloadAchievements = () =>
    sortByOrder(achievementItems)
      .map((item) => item.name.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!validateForm()) {
      showAlert({
        title: "Validasi",
        description: "Periksa kembali data wajib",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalThumbnailUrl = await uploadThumbnailIfNeeded();
      const parsedCategoryId = Number(formValues.categoryId);

      if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
        throw new Error("Kategori ekstrakurikuler tidak valid");
      }

      const galleriesPayload = await getCreatePayloadGalleries();
      const achievementsPayload = getCreatePayloadAchievements();

      const basePayload = {
        name: formValues.name.trim(),
        thumbnailUrl: finalThumbnailUrl,
        categoryId: Math.floor(parsedCategoryId),
        mentorName: formValues.mentorName.trim(),
        description: formValues.description.trim(),
        schedule: formValues.schedule.trim(),
        location: formValues.location.trim(),
        isPublished: formValues.isPublished,
        galleries: galleriesPayload,
        achievements: achievementsPayload,
      };

      const payload = basePayload;

      const endpoint = isEditMode
        ? `/api/backoffice/extracurriculars/${encodeURIComponent(slug || formValues.slug)}`
        : "/api/backoffice/extracurriculars";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message ||
            `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} ekstrakurikuler`,
        );
      }

      showAlert({
        title: "Berhasil",
        description: `Data ekstrakurikuler berhasil ${
          isEditMode ? "diperbarui" : "ditambahkan"
        }`,
        variant: "success",
      });

      router.push("/admin/siswa/ekstrakurikuler");
    } catch (error) {
      console.error("Failed to submit extracurricular form", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan data ekstrakurikuler",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCancelModal = () => {
    if (isFormBusy) {
      return;
    }

    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    router.push("/admin/siswa/ekstrakurikuler");
  };

  if (isLoadingDetail) {
    return (
      <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
        <TitleSection
          title={isEditMode ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
          subtitle={
            isEditMode
              ? "Perbarui informasi ekstrakurikuler SMK Tamtama Kroya."
              : "Tambahkan data ekstrakurikuler SMK Tamtama Kroya."
          }
        />

        <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4">
          <div className="w-full h-[60vh] flex flex-col gap-4 justify-center items-center">
            <div className="w-12 h-12 border-4 border-dashed border-gray-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">
              Memuat data ekstrakurikuler...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <TitleSection
        title={isEditMode ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
        subtitle={
          isEditMode
            ? "Perbarui informasi ekstrakurikuler SMK Tamtama Kroya."
            : "Tambahkan data ekstrakurikuler SMK Tamtama Kroya."
        }
      />

      <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4 space-y-5">
        <h3 className="text-lg font-semibold text-gray-800">Informasi Umum</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormInput
              label="Nama Ekskul"
              value={formValues.name}
              onChange={(event) => {
                const nextName = event.target.value;
                setFormValues((prev) => ({
                  ...prev,
                  name: nextName,
                  slug: toSlug(nextName),
                }));
                setFormErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Masukkan nama ekskul"
              isMandatory
              error={formErrors.name}
            />

            <FormInput
              label="Slug (Diisi otomatis oleh sistem)"
              value={formValues.slug}
              readOnly
              className="bg-gray-100"
              placeholder="Slug otomatis"
            />

            <SelectInput
              label="Kategori"
              value={formValues.categoryId}
              options={categoryOptions}
              placeholder="Pilih kategori"
              onChange={(event) => {
                const nextCategoryId = String(event.target.value || "").trim();

                setFormValues((prev) => ({
                  ...prev,
                  categoryId: nextCategoryId,
                }));
                setFormErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              isMandatory
              disabled={isSubmitting}
              error={formErrors.categoryId}
            />

            <FormInput
              label="Nama Pembina"
              value={formValues.mentorName}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  mentorName: event.target.value,
                }));
                setFormErrors((prev) => ({ ...prev, mentorName: undefined }));
              }}
              placeholder="Masukkan nama pembina"
              isMandatory
              error={formErrors.mentorName}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Jadwal"
                value={formValues.schedule}
                onChange={(event) => {
                  setFormValues((prev) => ({
                    ...prev,
                    schedule: event.target.value,
                  }));
                  setFormErrors((prev) => ({ ...prev, schedule: undefined }));
                }}
                placeholder="Contoh: Sabtu, 14.00 - 16.00"
                isMandatory
                error={formErrors.schedule}
              />
              <FormInput
                label="Lokasi"
                value={formValues.location}
                onChange={(event) => {
                  setFormValues((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }));
                  setFormErrors((prev) => ({ ...prev, location: undefined }));
                }}
                placeholder="Contoh: Lapangan Sekolah"
                isMandatory
                error={formErrors.location}
              />
            </div>
          </div>

          <div className="w-full lg:max-h-60">
            <PhotoUpload
              previewUrl={thumbnailPreview || formValues.thumbnailUrl}
              onFileSelect={handleThumbnailChange}
              onFileRemove={handleThumbnailRemove}
              onValidationError={(message) => {
                showAlert({
                  title: "Validasi Thumbnail",
                  description: message,
                  variant: "error",
                });
              }}
              disabled={isSubmitting}
              label="Thumbnail (Gambar Utama)"
              maxSizeInMB={5}
              textButton="Ganti Gambar"
              isMandatory
              error={formErrors.thumbnailUrl}
            />
          </div>

          <div className="lg:col-span-2">
            <FormTextarea
              label="Deskripsi"
              limit={500}
              value={formValues.description}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }));
                setFormErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Masukkan deskripsi kegiatan"
              isMandatory
              error={formErrors.description}
            />
          </div>

          <div className="lg:col-span-2">
            <MultipleImageUploader
              label="Foto Kegiatan"
              items={galleryItems}
              onChange={handleGalleryItemsChange}
              disabled={isSubmitting}
              maxItems={20}
              maxSizeInMB={5}
              onValidationError={(message) => {
                showAlert({
                  title: "Validasi Galeri",
                  description: message,
                  variant: "error",
                });
              }}
            />

            {galleryUploadAlert && (
              <div className="mt-2 space-y-2">
                <div
                  className={`rounded-sm border px-3 py-2 text-sm ${
                    galleryUploadAlert.variant === "success"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                  role="alert"
                >
                  {galleryUploadAlert.message}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              Prestasi & Kegiatan
            </label>

            <div className="flex flex-col gap-2">
              {sortByOrder(achievementItems).map((item) => (
                <div
                  key={item.clientId}
                  draggable={!isSubmitting}
                  onDragStart={(event) =>
                    handleAchievementDragStart(event, item.clientId)
                  }
                  onDragOver={handleAchievementDragOver}
                  onDrop={(event) =>
                    handleAchievementDrop(event, item.clientId)
                  }
                  onDragEnd={handleAchievementDragEnd}
                  className={`flex items-center gap-2 border border-gray-300 rounded-sm px-2 py-2 ${
                    isSubmitting ? "" : "cursor-move"
                  } ${
                    draggingAchievementClientId === item.clientId
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1 text-gray-500">
                    <LuGripVertical className="text-sm" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1">
                    {item.name}
                  </span>
                  <TextButton
                    variant="outline-danger"
                    icon={<LuTrash2 className="text-md" />}
                    className="p-1! text-md"
                    disabled={isSubmitting}
                    onClick={() => removeAchievement(item.clientId)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={newAchievementName}
                onChange={(event) => setNewAchievementName(event.target.value)}
                placeholder="Tambah prestasi..."
                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                disabled={isSubmitting}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAchievement();
                  }
                }}
              />
            </div>

            {achievementAddAlert && (
              <div className="space-y-2">
                {achievementAddAlert && (
                  <div
                    className={`rounded-sm border px-3 py-2 text-sm ${
                      achievementAddAlert.variant === "success"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-red-300 bg-red-50 text-red-700"
                    }`}
                    role="alert"
                  >
                    {achievementAddAlert.message}
                  </div>
                )}
              </div>
            )}

            <TextButton
              variant="outline"
              icon={<LuPlus className="text-sm" />}
              text="Tambah Prestasi"
              className="py-1.5!"
              disabled={isSubmitting || !newAchievementName.trim()}
              onClick={addAchievement}
            />
          </div>

          <div className="flex justify-end gap-3 lg:col-span-2">
            <TextButton
              variant="outline"
              text="Batal"
              disabled={isFormBusy}
              onClick={handleOpenCancelModal}
            />
            <TextButton
              variant="primary"
              text={isEditMode ? "Simpan" : "Simpan"}
              isLoading={isSubmitting}
              disabled={isFormBusy}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          if (!isFormBusy) {
            setIsCancelModalOpen(false);
          }
        }}
        title="Konfirmasi Batal"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <TextButton
              variant="outline"
              text="Lanjutkan"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isFormBusy}
            />
            <TextButton
              variant="danger"
              text="Ya, Batalkan"
              onClick={handleConfirmCancel}
              disabled={isFormBusy}
            />
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Perubahan yang belum disimpan akan hilang. Yakin ingin batal?
        </p>
      </BaseModal>
    </div>
  );
}

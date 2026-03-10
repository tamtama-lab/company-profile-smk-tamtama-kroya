"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { TextButton } from "@/components/Buttons/TextButton";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import { TitleSection } from "@/components/TitleSection";
import { useAlert } from "@/components/ui/alert";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import MultipleImageUploader from "@/components/Upload/MultipleImageUploader";
import PhotoUpload from "@/components/Upload/PhotoUpload";
import { getAuthHeader } from "@/utils/auth";
import { resolveSlug } from "@/utils/resolveSlug";
import { createClientId, normalizeItem, toSlug } from "./helpers";
import {
  SchoolFacilityFormMode,
  SchoolFacilityFormValues,
  SchoolFacilityGalleryInputItem,
  SchoolFacilityItem,
} from "./type";

type FormErrorState = Partial<
  Record<
    | "title"
    | "slug"
    | "summary"
    | "description"
    | "categoryId"
    | "coverPhotoUrl",
    string
  >
>;

type InlineActionAlert = {
  variant: "success" | "error";
  message: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "publish", label: "Publish" },
] as const;

const CATEGORY_OPTIONS_ENDPOINT = "/api/school-facilities/category-options";

const DEFAULT_FORM_VALUES: SchoolFacilityFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  categoryId: "",
  coverPhotoUrl: "",
  galleryDescription: "",
  isPublished: false,
};

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file cover"));
    reader.readAsDataURL(file);
  });

const toObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getMessageFromPayload = (
  payload: unknown,
  fallbackMessage: string,
): string => {
  const root = toObject(payload);
  const message = root.message;

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  const error = root.error;

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return fallbackMessage;
};

const extractUploadedCoverUrl = (payload: unknown): string | null => {
  const root = toObject(payload);
  const data = toObject(root.data);

  const coverPhotoUrlCandidate =
    root.coverPhotoUrl ?? root.photoUrl ?? data.coverPhotoUrl ?? data.photoUrl;

  if (typeof coverPhotoUrlCandidate !== "string") {
    return null;
  }

  const normalizedCoverPhotoUrl = coverPhotoUrlCandidate.trim();
  return normalizedCoverPhotoUrl ? normalizedCoverPhotoUrl : null;
};

const extractUploadedGalleryPhotoUrl = (payload: unknown): string | null => {
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

interface SchoolFacilityFormPageProps {
  mode: SchoolFacilityFormMode;
  slug?: string;
}

export default function SchoolFacilityFormPage({
  mode,
  slug,
}: SchoolFacilityFormPageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const isEditMode = mode === "edit";

  const [isLoadingDetail, setIsLoadingDetail] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] =
    useState<SchoolFacilityFormValues>(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<FormErrorState>({});

  const [isSlugEditedManually, setIsSlugEditedManually] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [galleryItems, setGalleryItems] = useState<
    SchoolFacilityGalleryInputItem[]
  >([]);
  const [galleryUploadAlert, setGalleryUploadAlert] =
    useState<InlineActionAlert | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isFormBusy = isSubmitting;

  const publicationStatusValue = formValues.isPublished ? "publish" : "draft";

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch(CATEGORY_OPTIONS_ENDPOINT, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat kategori fasilitas");
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
        console.error("Failed fetch school facility categories", error);

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

        const detailResponse = await fetch(
          `/api/backoffice/school-facilities/${encodeURIComponent(resolveSlug(slug))}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
            cache: "no-store",
          },
        );

        if (!detailResponse.ok) {
          throw new Error("Gagal memuat detail fasilitas");
        }

        const detailPayload = (await detailResponse.json()) as unknown;
        const rawDetail =
          detailPayload &&
          typeof detailPayload === "object" &&
          "data" in detailPayload
            ? (detailPayload as { data?: unknown }).data
            : detailPayload;

        const detail = normalizeItem(
          (rawDetail || {}) as Partial<SchoolFacilityItem>,
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
          title: detail.title,
          slug: detail.slug,
          summary: detail.summary,
          description: detail.description,
          categoryId: normalizedCategoryId ? String(normalizedCategoryId) : "",
          coverPhotoUrl: detail.coverPhotoUrl,
          galleryDescription: detail.galleryDescription,
          isPublished: detail.isPublished,
        });
        setIsSlugEditedManually(true);
        setCoverPreview(detail.coverPhotoUrl);

        setGalleryItems(
          sortByOrder(
            (detail.galleries || []).map((item) => ({
              clientId: createClientId("gallery-existing"),
              id: Number(item.id || 0),
              previewUrl: String(item.photoUrl || ""),
              order: Number(item.order || 0),
            })),
          ),
        );
      } catch (error) {
        console.error("Failed fetch school facility detail", error);
        showAlert({
          title: "Gagal",
          description: "Gagal memuat data fasilitas sekolah",
          variant: "error",
        });
        router.push("/admin/siswa/fasilitas");
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
  }, [isEditMode, slug, router, showAlert]);

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

  const handleCoverChange = (file: File | null) => {
    if (!file) {
      setCoverFile(null);
      return;
    }

    setCoverFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(String(event.target?.result || ""));
    };
    reader.readAsDataURL(file);

    setFormErrors((prev) => ({ ...prev, coverPhotoUrl: undefined }));
  };

  const handleCoverRemove = () => {
    setCoverFile(null);
    setCoverPreview("");
    setFormValues((prev) => ({ ...prev, coverPhotoUrl: "" }));
  };

  const normalizeGalleryInputOrder = (
    items: SchoolFacilityGalleryInputItem[],
  ) => items.map((item, index) => ({ ...item, order: index }));

  const handleGalleryItemsChange = (
    nextItemsInput: SchoolFacilityGalleryInputItem[],
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

  const validateForm = () => {
    const nextErrors: FormErrorState = {};

    if (!formValues.title.trim()) {
      nextErrors.title = "Nama fasilitas wajib diisi";
    }

    if (!formValues.slug.trim()) {
      nextErrors.slug = "Slug wajib diisi";
    }

    if (!formValues.categoryId.trim()) {
      nextErrors.categoryId = "Kategori wajib dipilih";
    }

    if (!formValues.summary.trim()) {
      nextErrors.summary = "Deskripsi singkat wajib diisi";
    }

    if (!formValues.description.trim()) {
      nextErrors.description = "Deskripsi lengkap wajib diisi";
    }

    if (!coverFile && !formValues.coverPhotoUrl.trim()) {
      nextErrors.coverPhotoUrl = "Foto utama wajib diisi";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadCoverIfNeeded = async () => {
    if (!coverFile) {
      return formValues.coverPhotoUrl;
    }

    const formData = new FormData();
    formData.append("cover", coverFile);

    const response = await fetch("/api/backoffice/school-facilities/cover", {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    const responsePayload = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        getMessageFromPayload(responsePayload, "Gagal upload foto utama"),
      );
    }

    const uploadedCoverUrl = extractUploadedCoverUrl(responsePayload);

    if (uploadedCoverUrl) {
      return uploadedCoverUrl;
    }

    return fileToDataUrl(coverFile);
  };

  const uploadGalleryPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(
      "/api/backoffice/school-facilities/galleries/upload",
      {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      },
    );

    const responsePayload = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        getMessageFromPayload(responsePayload, "Gagal upload foto galeri"),
      );
    }

    const uploadedPhotoUrl = extractUploadedGalleryPhotoUrl(responsePayload);

    if (!uploadedPhotoUrl) {
      throw new Error("URL foto galeri tidak ditemukan dari response API");
    }

    return uploadedPhotoUrl;
  };

  const getPayloadGalleries = async () => {
    const sortedGalleries = sortByOrder(galleryItems);
    const galleries: string[] = [];

    for (const galleryItem of sortedGalleries) {
      if (galleryItem.file) {
        galleries.push(await uploadGalleryPhoto(galleryItem.file));
        continue;
      }

      const previewUrl = String(galleryItem.previewUrl || "").trim();

      if (previewUrl && !previewUrl.startsWith("data:")) {
        galleries.push(previewUrl);
      }
    }

    return galleries;
  };

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
      const finalCoverPhotoUrl = await uploadCoverIfNeeded();
      const parsedCategoryId = Number(formValues.categoryId);

      if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
        throw new Error("Kategori fasilitas tidak valid");
      }

      const galleriesPayload = await getPayloadGalleries();

      const payload = {
        title: formValues.title.trim(),
        slug: formValues.slug.trim() || toSlug(formValues.title),
        summary: formValues.summary.trim(),
        description: formValues.description.trim(),
        categoryId: Math.floor(parsedCategoryId),
        coverPhotoUrl: finalCoverPhotoUrl,
        galleryDescription: formValues.galleryDescription.trim(),
        isPublished: formValues.isPublished,
        galleries: galleriesPayload,
      };

      const endpoint = isEditMode
        ? `/api/backoffice/school-facilities/${encodeURIComponent(resolveSlug(slug || formValues.slug))}`
        : "/api/backoffice/school-facilities";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(
          getMessageFromPayload(
            responsePayload,
            `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} data fasilitas`,
          ),
        );
      }

      showAlert({
        title: "Berhasil",
        description: `Data fasilitas berhasil ${
          isEditMode ? "diperbarui" : "ditambahkan"
        }`,
        variant: "success",
      });

      router.push("/admin/siswa/fasilitas");
    } catch (error) {
      console.error("Failed to submit school facility form", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan data fasilitas",
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
    router.push("/admin/siswa/fasilitas");
  };

  if (isLoadingDetail) {
    return (
      <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
        <TitleSection
          title={
            isEditMode ? "Edit Fasilitas Sekolah" : "Tambah Fasilitas Sekolah"
          }
          subtitle={
            isEditMode
              ? "Perbarui informasi fasilitas SMK Tamtama Kroya."
              : "Tambahkan data fasilitas SMK Tamtama Kroya."
          }
        />

        <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4">
          <div className="w-full h-[60vh] flex flex-col gap-4 justify-center items-center">
            <div className="w-12 h-12 border-4 border-dashed border-gray-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Memuat data fasilitas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <TitleSection
        title={
          isEditMode ? "Edit Fasilitas Sekolah" : "Tambah Fasilitas Sekolah"
        }
        subtitle={
          isEditMode
            ? "Perbarui informasi fasilitas SMK Tamtama Kroya."
            : "Tambahkan data fasilitas SMK Tamtama Kroya."
        }
      />

      <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4 space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Informasi Utama
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormInput
              label="Nama Fasilitas"
              value={formValues.title}
              onChange={(event) => {
                const nextTitle = event.target.value;

                setFormValues((prev) => ({
                  ...prev,
                  title: nextTitle,
                  slug: isSlugEditedManually ? prev.slug : toSlug(nextTitle),
                }));
                setFormErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Masukkan nama fasilitas"
              isMandatory
              error={formErrors.title}
            />

            <div className="space-y-2">
              <FormInput
                label="Slug (Diisi otomatis oleh sistem)"
                value={formValues.slug}
                onChange={(event) => {
                  setIsSlugEditedManually(true);
                  setFormValues((prev) => ({
                    ...prev,
                    slug: toSlug(event.target.value),
                  }));
                  setFormErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                placeholder="Slug fasilitas"
                isMandatory
                disabled
                error={formErrors.slug}
              />
            </div>

            <SelectInput
              label="Kategori"
              value={formValues.categoryId}
              options={categoryOptions}
              placeholder="Pilih kategori fasilitas"
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

            <SelectInput
              label="Status Data"
              options={STATUS_OPTIONS.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
              value={publicationStatusValue}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  isPublished: event.target.value === "publish",
                }));
              }}
              disabled={isSubmitting}
            />

            <div className="lg:col-span-2">
              <FormTextarea
                label="Deskripsi Singkat"
                limit={300}
                value={formValues.summary}
                onChange={(event) => {
                  setFormValues((prev) => ({
                    ...prev,
                    summary: event.target.value,
                  }));
                  setFormErrors((prev) => ({ ...prev, summary: undefined }));
                }}
                placeholder="Masukkan deskripsi singkat fasilitas"
                isMandatory
                error={formErrors.summary}
              />
            </div>

            <div className="lg:col-span-2">
              <FormTextarea
                label="Deskripsi Lengkap"
                limit={2500}
                value={formValues.description}
                onChange={(event) => {
                  setFormValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }}
                placeholder="Masukkan deskripsi lengkap fasilitas"
                isMandatory
                error={formErrors.description}
              />
            </div>
          </div>
        </section>

        <div className="w-full flex flex-col gap-6 lg:flex-row lg:items-start">
          <section className="space-y-4 w-full lg:w-[36%]">
            <h3 className="text-lg font-semibold text-gray-800">Foto Utama</h3>

            <PhotoUpload
              previewUrl={coverPreview || formValues.coverPhotoUrl}
              onFileSelect={handleCoverChange}
              onFileRemove={handleCoverRemove}
              onValidationError={(message) => {
                showAlert({
                  title: "Validasi Foto Utama",
                  description: message,
                  variant: "error",
                });
              }}
              disabled={isSubmitting}
              label="Cover Fasilitas"
              maxSizeInMB={5}
              textButton="Ganti Cover"
              isMandatory
              error={formErrors.coverPhotoUrl}
            />
          </section>

          <section className="space-y-4 w-full lg:w-3/5">
            <h3 className="text-lg font-semibold text-gray-800">
              Galeri Fasilitas
            </h3>

            <MultipleImageUploader
              label="Foto Galeri"
              items={galleryItems}
              onChange={handleGalleryItemsChange}
              disabled={isSubmitting}
              maxItems={20}
              maxSizeInMB={5}
              allowedMimeTypes={[
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/webp",
              ]}
              onValidationError={(message) => {
                showAlert({
                  title: "Validasi Galeri",
                  description: message,
                  variant: "error",
                });
              }}
            />

            <FormTextarea
              label="Deskripsi Galeri"
              limit={800}
              value={formValues.galleryDescription}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  galleryDescription: event.target.value,
                }));
              }}
              placeholder="Tambahkan deskripsi singkat untuk galeri fasilitas"
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
          </section>
        </div>

        <div className="flex justify-end gap-3">
          <TextButton
            variant="outline"
            text="Batalkan"
            disabled={isFormBusy}
            onClick={handleOpenCancelModal}
          />
          <TextButton
            variant="primary"
            text="Simpan"
            isLoading={isSubmitting}
            disabled={isFormBusy}
            onClick={handleSubmit}
          />
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

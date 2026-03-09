"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LuGripVertical, LuRefreshCcw, LuPlus, LuTrash2 } from "react-icons/lu";
import { TextButton } from "@/components/Buttons/TextButton";
import { DateInput } from "@/components/InputForm/DateInput";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import { TitleSection } from "@/components/TitleSection";
import { useAlert } from "@/components/ui/alert";
import PhotoUpload from "@/components/Upload/PhotoUpload";
import MultipleImageUploader from "@/components/Upload/MultipleImageUploader";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { getAuthHeader } from "@/utils/auth";
import { resolveSlug } from "@/utils/resolveSlug";
import {
  COMPETITION_LEVEL_OPTIONS,
  DEFAULT_SCHOOL_NAME,
  PROVINCE_OPTIONS,
  createClientId,
  normalizeItem,
  toSlug,
} from "./helpers";
import {
  SchoolAchievementAwardInputItem,
  SchoolAchievementFormMode,
  SchoolAchievementFormValues,
  SchoolAchievementGalleryInputItem,
  SchoolAchievementItem,
} from "./type";

type FormErrorState = Partial<
  Record<
    | "title"
    | "slug"
    | "competitionLevel"
    | "placeName"
    | "organizerName"
    | "competitionDate"
    | "category"
    | "participantName"
    | "description"
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

const CATEGORY_OPTIONS_ENDPOINT = "/api/school-achievements/category-options";

const DEFAULT_FORM_VALUES: SchoolAchievementFormValues = {
  title: "",
  slug: "",
  schoolName: DEFAULT_SCHOOL_NAME,
  competitionLevel: "",
  placeName: "",
  organizerName: "",
  competitionDate: "",
  category: "",
  participantName: "",
  description: "",
  coverPhotoUrl: "",
  isPublished: false,
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file cover"));
    reader.readAsDataURL(file);
  });

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

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

const toCategoryOptionList = (payload: unknown): string[] => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Array.isArray((payload as Record<string, unknown>).data)
        ? ((payload as Record<string, unknown>).data as unknown[])
        : Array.isArray((payload as Record<string, unknown>).items)
          ? ((payload as Record<string, unknown>).items as unknown[])
          : []
      : [];

  const seenNames = new Set<string>();

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      const root = item as Record<string, unknown>;
      return typeof root.name === "string" ? root.name.trim() : "";
    })
    .filter(Boolean)
    .filter((name) => {
      const lowered = name.toLowerCase();

      if (seenNames.has(lowered)) {
        return false;
      }

      seenNames.add(lowered);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
};

interface SchoolAchievementFormPageProps {
  mode: SchoolAchievementFormMode;
  slug?: string;
}

export default function SchoolAchievementFormPage({
  mode,
  slug,
}: SchoolAchievementFormPageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const isEditMode = mode === "edit";

  const [isLoadingDetail, setIsLoadingDetail] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] =
    useState<SchoolAchievementFormValues>(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<FormErrorState>({});

  const [isSlugEditedManually, setIsSlugEditedManually] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [galleryItems, setGalleryItems] = useState<
    SchoolAchievementGalleryInputItem[]
  >([]);
  const [awardItems, setAwardItems] = useState<
    SchoolAchievementAwardInputItem[]
  >([]);

  const [draggingAwardClientId, setDraggingAwardClientId] = useState<
    string | null
  >(null);

  const [newAwardName, setNewAwardName] = useState("");
  const [galleryUploadAlert, setGalleryUploadAlert] =
    useState<InlineActionAlert | null>(null);
  const [awardAddAlert, setAwardAddAlert] = useState<InlineActionAlert | null>(
    null,
  );

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isFormBusy = isSubmitting;

  const publicationStatusValue = formValues.isPublished ? "publish" : "draft";

  const competitionLevelOptions = useMemo(
    () =>
      COMPETITION_LEVEL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  const provinceOptions = useMemo(
    () =>
      PROVINCE_OPTIONS.map((provinceName) => ({
        value: provinceName,
        label: provinceName,
      })),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch(CATEGORY_OPTIONS_ENDPOINT, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat kategori prestasi");
        }

        const payload = (await response.json()) as unknown;
        const categories = toCategoryOptionList(payload);

        if (cancelled) {
          return;
        }

        setCategoryOptions(
          categories.map((categoryName) => ({
            value: categoryName,
            label: categoryName,
          })),
        );
      } catch (error) {
        console.error("Failed fetch school achievement categories", error);

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
          `/api/backoffice/school-achievements/${encodeURIComponent(resolveSlug(slug))}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!detailResponse.ok) {
          throw new Error("Gagal memuat detail prestasi");
        }

        const detailPayload = (await detailResponse.json()) as unknown;
        const rawDetail =
          detailPayload &&
          typeof detailPayload === "object" &&
          "data" in detailPayload
            ? (detailPayload as { data?: unknown }).data
            : detailPayload;

        const detail = normalizeItem(
          (rawDetail || {}) as Partial<SchoolAchievementItem>,
        );

        if (cancelled) {
          return;
        }

        if (detail.category) {
          setCategoryOptions((prev) => {
            if (prev.some((option) => option.value === detail.category)) {
              return prev;
            }

            return [
              ...prev,
              {
                value: detail.category,
                label: detail.category,
              },
            ].sort((a, b) => a.label.localeCompare(b.label));
          });
        }

        setFormValues({
          title: detail.title,
          slug: detail.slug,
          schoolName: DEFAULT_SCHOOL_NAME,
          competitionLevel: detail.competitionLevel,
          placeName: detail.placeName,
          organizerName: detail.organizerName,
          competitionDate: detail.competitionDate,
          category: detail.category,
          participantName: detail.participantName,
          description: detail.description,
          coverPhotoUrl: detail.coverPhotoUrl,
          isPublished: detail.isPublished,
        });

        setIsSlugEditedManually(true);
        setCoverPreview(detail.coverPhotoUrl);

        setGalleryItems(
          sortByOrder(
            (detail.galleries || []).map((galleryItem) => ({
              clientId: createClientId("gallery-existing"),
              id: Number(galleryItem.id || 0),
              previewUrl: String(galleryItem.photoUrl || ""),
              order: Number(galleryItem.order || 0),
            })),
          ),
        );

        setAwardItems(
          sortByOrder(
            (detail.awards || []).map((awardItem) => ({
              clientId: createClientId("award-existing"),
              id: Number(awardItem.id || 0),
              name: String(awardItem.name || "").trim(),
              order: Number(awardItem.order || 0),
            })),
          ),
        );
      } catch (error) {
        console.error("Failed fetch school achievement detail", error);
        showAlert({
          title: "Gagal",
          description: "Gagal memuat data prestasi siswa",
          variant: "error",
        });
        router.push("/admin/siswa/prestasi-siswa");
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

  useEffect(() => {
    if (!awardAddAlert) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setAwardAddAlert(null);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [awardAddAlert]);

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
    items: SchoolAchievementGalleryInputItem[],
  ) => items.map((item, index) => ({ ...item, order: index }));

  const normalizeAwardInputOrder = (items: SchoolAchievementAwardInputItem[]) =>
    items.map((item, index) => ({ ...item, order: index }));

  const handleGalleryItemsChange = (
    nextItemsInput: SchoolAchievementGalleryInputItem[],
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

  const addAward = () => {
    const awardName = newAwardName.trim();

    if (!awardName || isSubmitting) {
      return;
    }

    setAwardItems((prev) =>
      normalizeAwardInputOrder([
        ...sortByOrder(prev),
        {
          clientId: createClientId("award-new"),
          name: awardName,
          order: prev.length,
        },
      ]),
    );

    setAwardAddAlert({
      variant: "success",
      message: "Prestasi ditambahkan. Klik Simpan untuk menerapkan perubahan.",
    });
    setNewAwardName("");
  };

  const removeAward = (clientId: string) => {
    setAwardItems((prev) =>
      normalizeAwardInputOrder(
        sortByOrder(prev).filter((item) => item.clientId !== clientId),
      ),
    );
  };

  const handleAwardDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    clientId: string,
  ) => {
    if (isSubmitting) {
      return;
    }

    setDraggingAwardClientId(clientId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clientId);
  };

  const handleAwardDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (isSubmitting) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleAwardDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetClientId: string,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const sourceClientId =
      event.dataTransfer.getData("text/plain") || draggingAwardClientId;

    setDraggingAwardClientId(null);

    if (!sourceClientId || sourceClientId === targetClientId) {
      return;
    }

    const previousItems = normalizeAwardInputOrder(sortByOrder(awardItems));
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

    setAwardItems(normalizeAwardInputOrder(reorderedItems));
  };

  const handleAwardDragEnd = () => {
    setDraggingAwardClientId(null);
  };

  const validateForm = () => {
    const nextErrors: FormErrorState = {};

    if (!formValues.title.trim()) {
      nextErrors.title = "Judul prestasi wajib diisi";
    }

    if (!formValues.slug.trim()) {
      nextErrors.slug = "Slug wajib diisi";
    }

    if (!formValues.competitionLevel.trim()) {
      nextErrors.competitionLevel = "Tingkat kompetisi wajib dipilih";
    }

    if (!formValues.placeName.trim()) {
      nextErrors.placeName = "Provinsi wajib dipilih";
    }

    if (!formValues.organizerName.trim()) {
      nextErrors.organizerName = "Nama penyelenggara wajib diisi";
    }

    if (!formValues.competitionDate.trim()) {
      nextErrors.competitionDate = "Tanggal kompetisi wajib diisi";
    }

    if (!formValues.category.trim()) {
      nextErrors.category = "Kategori lomba wajib dipilih";
    }

    if (!formValues.participantName.trim()) {
      nextErrors.participantName = "Tim peserta wajib diisi";
    }

    if (!formValues.description.trim()) {
      nextErrors.description = "Deskripsi prestasi wajib diisi";
    }

    if (!coverFile && !formValues.coverPhotoUrl.trim()) {
      nextErrors.coverPhotoUrl = "Gambar utama wajib diisi";
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

    const response = await fetch("/api/backoffice/school-achievements/cover", {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    const responsePayload = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        getMessageFromPayload(responsePayload, "Gagal upload cover prestasi"),
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
      "/api/backoffice/school-achievements/galleries/upload",
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
        getMessageFromPayload(
          responsePayload,
          "Gagal upload foto galeri prestasi",
        ),
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

  const getPayloadAwards = () =>
    sortByOrder(awardItems)
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
      const finalCoverPhotoUrl = await uploadCoverIfNeeded();
      const galleriesPayload = await getPayloadGalleries();
      const awardsPayload = getPayloadAwards();

      const payload = {
        title: formValues.title.trim(),
        slug: formValues.slug.trim() || toSlug(formValues.title),
        description: formValues.description.trim(),
        competitionLevel: formValues.competitionLevel.trim().toLowerCase(),
        placeName: formValues.placeName.trim(),
        organizerName: formValues.organizerName.trim(),
        competitionDate: formValues.competitionDate.trim(),
        category: formValues.category.trim(),
        participantName: formValues.participantName.trim(),
        coverPhotoUrl: finalCoverPhotoUrl,
        isPublished: formValues.isPublished,
        galleries: galleriesPayload,
        awards: awardsPayload,
      };

      const endpoint = isEditMode
        ? `/api/backoffice/school-achievements/${encodeURIComponent(resolveSlug(slug || formValues.slug))}`
        : "/api/backoffice/school-achievements";

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
            `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} data prestasi`,
          ),
        );
      }

      showAlert({
        title: "Berhasil",
        description: `Data prestasi berhasil ${
          isEditMode ? "diperbarui" : "ditambahkan"
        }`,
        variant: "success",
      });

      router.push("/admin/siswa/prestasi-siswa");
    } catch (error) {
      console.error("Failed to submit school achievement form", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan data prestasi",
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
    router.push("/admin/siswa/prestasi-siswa");
  };

  if (isLoadingDetail) {
    return (
      <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
        <TitleSection
          title={isEditMode ? "Edit Prestasi Siswa" : "Tambah Prestasi Siswa"}
          subtitle={
            isEditMode
              ? "Perbarui informasi prestasi siswa SMK Tamtama Kroya."
              : "Tambahkan data prestasi siswa SMK Tamtama Kroya."
          }
        />

        <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4">
          <div className="w-full h-[60vh] flex flex-col gap-4 justify-center items-center">
            <div className="w-12 h-12 border-4 border-dashed border-gray-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Memuat data prestasi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <TitleSection
        title={isEditMode ? "Edit Prestasi Siswa" : "Tambah Prestasi Siswa"}
        subtitle={
          isEditMode
            ? "Perbarui informasi prestasi siswa SMK Tamtama Kroya."
            : "Tambahkan data prestasi siswa SMK Tamtama Kroya."
        }
      />

      <div className="w-full border border-gray-300 bg-white shadow-lg rounded-md p-4 space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Informasi Utama Prestasi
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormInput
              label="Judul Prestasi"
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
              placeholder="Masukkan judul prestasi"
              isMandatory
              error={formErrors.title}
            />

            <div className="space-y-2">
              <FormInput
                label="Slug"
                value={formValues.slug}
                onChange={(event) => {
                  setIsSlugEditedManually(true);
                  setFormValues((prev) => ({
                    ...prev,
                    slug: toSlug(event.target.value),
                  }));
                  setFormErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                placeholder="Slug prestasi"
                isMandatory
                error={formErrors.slug}
              />

              {/* <TextButton
                variant="outline"
                icon={<LuRefreshCcw className="text-sm" />}
                text="Generate dari Judul"
                className="w-fit py-1.5!"
                disabled={isSubmitting || !formValues.title.trim()}
                onClick={() => {
                  setFormValues((prev) => ({
                    ...prev,
                    slug: toSlug(prev.title),
                  }));
                  setIsSlugEditedManually(false);
                  setFormErrors((prev) => ({ ...prev, slug: undefined }));
                }}
              /> */}
            </div>

            <FormInput
              label="Nama Sekolah"
              value={formValues.schoolName}
              readOnly
              className="bg-gray-100"
              placeholder={DEFAULT_SCHOOL_NAME}
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
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Informasi Lomba
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SelectInput
              label="Tingkat Kompetisi"
              value={formValues.competitionLevel}
              options={competitionLevelOptions}
              placeholder="Pilih tingkat kompetisi"
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  competitionLevel: String(event.target.value || "").trim(),
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  competitionLevel: undefined,
                }));
              }}
              isMandatory
              disabled={isSubmitting}
              error={formErrors.competitionLevel}
            />

            <SelectInput
              label="Provinsi"
              value={formValues.placeName}
              options={provinceOptions}
              placeholder="Pilih provinsi"
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  placeName: String(event.target.value || "").trim(),
                }));
                setFormErrors((prev) => ({ ...prev, placeName: undefined }));
              }}
              isMandatory
              disabled={isSubmitting}
              error={formErrors.placeName}
            />

            <div className="space-y-1">
              <DateInput
                label="Tanggal Kompetisi"
                name="competitionDate"
                value={formValues.competitionDate}
                onChange={(date) => {
                  setFormValues((prev) => ({
                    ...prev,
                    competitionDate: date
                      ? date.toISOString().split("T")[0]
                      : "",
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    competitionDate: undefined,
                  }));
                }}
                startYear={2000}
                endYear={2100}
                isMandatory
                max={new Date().toISOString().split("T")[0]}
                placeholder="Pilih tanggal kompetisi"
              />
              {formErrors.competitionDate && (
                <span className="text-sm text-red-500">
                  {formErrors.competitionDate}
                </span>
              )}
            </div>

            <SelectInput
              label="Kategori Lomba"
              value={formValues.category}
              options={categoryOptions}
              placeholder="Pilih kategori lomba"
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  category: String(event.target.value || "").trim(),
                }));
                setFormErrors((prev) => ({ ...prev, category: undefined }));
              }}
              isMandatory
              disabled={isSubmitting}
              error={formErrors.category}
            />

            <FormInput
              label="Tim Peserta"
              value={formValues.participantName}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  participantName: event.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  participantName: undefined,
                }));
              }}
              placeholder="Masukkan nama tim / peserta"
              isMandatory
              error={formErrors.participantName}
            />

            <FormInput
              label="Penyelenggara"
              value={formValues.organizerName}
              onChange={(event) => {
                setFormValues((prev) => ({
                  ...prev,
                  organizerName: event.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  organizerName: undefined,
                }));
              }}
              placeholder="Masukkan nama penyelenggara"
              isMandatory
              error={formErrors.organizerName}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Deskripsi Prestasi
          </h3>

          <FormTextarea
            label="Deskripsi Prestasi"
            limit={1500}
            value={formValues.description}
            onChange={(event) => {
              setFormValues((prev) => ({
                ...prev,
                description: event.target.value,
              }));
              setFormErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Jelaskan detail prestasi yang diraih"
            isMandatory
            error={formErrors.description}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload Gambar Utama
          </h3>

          <PhotoUpload
            previewUrl={coverPreview || formValues.coverPhotoUrl}
            onFileSelect={handleCoverChange}
            onFileRemove={handleCoverRemove}
            onValidationError={(message) => {
              showAlert({
                title: "Validasi Cover",
                description: message,
                variant: "error",
              });
            }}
            disabled={isSubmitting}
            label="Cover Prestasi"
            maxSizeInMB={5}
            textButton="Ganti Cover"
            isMandatory
            error={formErrors.coverPhotoUrl}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Galeri Foto Prestasi
          </h3>

          <MultipleImageUploader
            label="Foto Galeri"
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
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Prestasi yang Diraih
          </h3>

          <div className="flex flex-col gap-2">
            {sortByOrder(awardItems).map((item) => (
              <div
                key={item.clientId}
                draggable={!isSubmitting}
                onDragStart={(event) =>
                  handleAwardDragStart(event, item.clientId)
                }
                onDragOver={handleAwardDragOver}
                onDrop={(event) => handleAwardDrop(event, item.clientId)}
                onDragEnd={handleAwardDragEnd}
                className={`flex items-center gap-2 border border-gray-300 rounded-sm px-2 py-2 ${
                  isSubmitting ? "" : "cursor-move"
                } ${draggingAwardClientId === item.clientId ? "opacity-60" : ""}`}
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
                  onClick={() => removeAward(item.clientId)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={newAwardName}
              onChange={(event) => setNewAwardName(event.target.value)}
              placeholder="Tambah prestasi yang diraih..."
              className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
              disabled={isSubmitting}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addAward();
                }
              }}
            />
          </div>

          {awardAddAlert && (
            <div className="space-y-2">
              <div
                className={`rounded-sm border px-3 py-2 text-sm ${
                  awardAddAlert.variant === "success"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
                role="alert"
              >
                {awardAddAlert.message}
              </div>
            </div>
          )}

          <TextButton
            variant="outline"
            icon={<LuPlus className="text-sm" />}
            text="Tambah Prestasi"
            className="py-1.5!"
            disabled={isSubmitting || !newAwardName.trim()}
            onClick={addAward}
          />
        </section>

        <div className="flex justify-end gap-3">
          <TextButton
            variant="outline"
            text="Cancel"
            disabled={isFormBusy}
            onClick={handleOpenCancelModal}
          />
          <TextButton
            variant="primary"
            text="Save"
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

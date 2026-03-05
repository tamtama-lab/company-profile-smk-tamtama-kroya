"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LuGripVertical, LuPlus, LuTrash2 } from "react-icons/lu";
import { TextButton } from "@/components/Buttons/TextButton";
import CategoryMultiInput from "@/components/InputForm/CategoryMultiInput";
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
    | "categories"
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
  categories: [],
  mentorName: "",
  schedule: "",
  location: "",
  description: "",
  thumbnailUrl: "",
  isPublished: true,
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

const toArrayPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const root = toObject(value);
  const data = root.data;

  if (Array.isArray(data)) {
    return data as T[];
  }

  return [];
};

const extractCreatedId = (payload: unknown): number | null => {
  const root = toObject(payload);
  const data = toObject(root.data);
  const gallery = toObject(root.gallery);
  const achievement = toObject(root.achievement);

  const idCandidate = root.id ?? data.id ?? gallery.id ?? achievement.id;
  const parsed = Number(idCandidate);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

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

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [galleryItems, setGalleryItems] = useState<
    ExtracurricularGalleryInputItem[]
  >([]);
  const [achievementItems, setAchievementItems] = useState<
    ExtracurricularAchievementInputItem[]
  >([]);
  const [isSyncingGalleries, setIsSyncingGalleries] = useState(false);
  const [isSyncingAchievements, setIsSyncingAchievements] = useState(false);
  const [draggingAchievementClientId, setDraggingAchievementClientId] =
    useState<string | null>(null);
  const [newAchievementName, setNewAchievementName] = useState("");
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadAlert, setGalleryUploadAlert] =
    useState<InlineActionAlert | null>(null);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [achievementAddAlert, setAchievementAddAlert] =
    useState<InlineActionAlert | null>(null);

  const canSyncNestedItems = isEditMode && Boolean(slug);

  const categorySuggestions = useMemo(
    () =>
      Array.from(new Set(formValues.categories)).sort((a, b) =>
        a.localeCompare(b),
      ),
    [formValues.categories],
  );

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

        const galleriesRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(slug)}/galleries`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );
        const achievementsRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(slug)}/achievements`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        const galleriesData = galleriesRes.ok ? await galleriesRes.json() : [];
        const achievementsData = achievementsRes.ok
          ? await achievementsRes.json()
          : [];

        const galleryArray = toArrayPayload<{
          id?: number;
          photoUrl?: string;
          order?: number;
        }>(galleriesData);
        const achievementArray = toArrayPayload<{
          id?: number;
          name?: string;
          order?: number;
        }>(achievementsData);

        if (cancelled) {
          return;
        }

        setFormValues({
          name: detail.name,
          slug: detail.slug,
          categories: detail.categories,
          mentorName: detail.mentorName,
          schedule: detail.schedule,
          location: detail.location,
          description: detail.description,
          thumbnailUrl: detail.thumbnailUrl,
          isPublished: detail.isPublished,
        });
        setThumbnailPreview(detail.thumbnailUrl);

        const normalizedGalleries = sortByOrder(
          galleryArray.map((item) => ({
            clientId: createClientId("gallery-existing"),
            id: Number(item.id || 0),
            previewUrl: String(item.photoUrl || ""),
            order: Number(item.order || 0),
          })),
        );

        const normalizedAchievements = sortByOrder(
          achievementArray.map((item) => ({
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

  const reorderGalleriesOnServer = async (
    targetSlug: string,
    items: ExtracurricularGalleryInputItem[],
  ) => {
    const galleryIds = sortByOrder(items)
      .map((item) => Number(item.id || 0))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (galleryIds.length <= 1) {
      return;
    }

    const reorderRes = await fetch(
      `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/galleries/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ galleryIds }),
      },
    );

    if (!reorderRes.ok) {
      const errorData = await reorderRes.json();
      throw new Error(errorData?.message || "Gagal mengurutkan foto galeri");
    }
  };

  const reorderAchievementsOnServer = async (
    targetSlug: string,
    items: ExtracurricularAchievementInputItem[],
  ) => {
    const achievementIds = sortByOrder(items)
      .map((item) => Number(item.id || 0))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (achievementIds.length <= 1) {
      return;
    }

    const reorderRes = await fetch(
      `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/achievements/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ achievementIds }),
      },
    );

    if (!reorderRes.ok) {
      const errorData = await reorderRes.json();
      throw new Error(errorData?.message || "Gagal mengurutkan prestasi");
    }
  };

  const handleGalleryItemsChange = async (
    nextItemsInput: ExtracurricularGalleryInputItem[],
  ) => {
    const previousItems = normalizeGalleryInputOrder(sortByOrder(galleryItems));
    const nextItems = normalizeGalleryInputOrder(sortByOrder(nextItemsInput));

    if (!canSyncNestedItems || isSyncingGalleries) {
      setGalleryItems(nextItems);
      return;
    }

    const targetSlug = String(slug || "").trim();

    setGalleryItems(nextItems);
    setIsSyncingGalleries(true);

    let hasAddedItems = false;
    let addedItemCount = 0;

    try {
      const fetchLatestGalleryItems = async () => {
        const galleriesRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/galleries`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!galleriesRes.ok) {
          const errorData = await galleriesRes.json();
          throw new Error(errorData?.message || "Gagal memuat ulang galeri");
        }

        const galleriesData = await galleriesRes.json();
        const galleryArray = toArrayPayload<{
          id?: number;
          photoUrl?: string;
          order?: number;
        }>(galleriesData);

        return sortByOrder(
          galleryArray.map((item) => ({
            clientId: createClientId("gallery-existing"),
            id: Number(item.id || 0),
            previewUrl: String(item.photoUrl || ""),
            order: Number(item.order || 0),
          })),
        );
      };

      const previousItemMap = new Map(
        previousItems.map((item) => [item.clientId, item]),
      );
      const nextItemMap = new Map(
        nextItems.map((item) => [item.clientId, item]),
      );

      const removedItems = previousItems.filter(
        (item) => !nextItemMap.has(item.clientId),
      );

      for (const removedItem of removedItems) {
        const existingId = Number(removedItem.id || 0);

        if (!Number.isFinite(existingId) || existingId <= 0) {
          continue;
        }

        const deleteRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/galleries/${existingId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!deleteRes.ok) {
          const errorData = await deleteRes.json();
          throw new Error(errorData?.message || "Gagal menghapus foto galeri");
        }
      }

      const addedItems = nextItems.filter(
        (item) => !previousItemMap.has(item.clientId),
      );

      hasAddedItems = addedItems.length > 0;
      addedItemCount = addedItems.length;

      if (hasAddedItems) {
        setGalleryUploadAlert(null);
        setIsUploadingGallery(true);
      }

      for (const addedItem of addedItems) {
        if (!addedItem.file) {
          continue;
        }

        const formData = new FormData();
        formData.append("photo", addedItem.file);

        const uploadRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/galleries`,
          {
            method: "POST",
            headers: {
              ...getAuthHeader(),
            },
            body: formData,
          },
        );

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData?.message || "Gagal upload foto galeri");
        }
      }

      const hasAddOrDelete = removedItems.length > 0 || addedItems.length > 0;

      if (hasAddOrDelete) {
        const latestItems = await fetchLatestGalleryItems();
        setGalleryItems(normalizeGalleryInputOrder(latestItems));

        if (hasAddedItems) {
          setGalleryUploadAlert({
            variant: "success",
            message: `${addedItemCount} foto berhasil ditambahkan ke galeri.`,
          });
        }

        return;
      }

      await reorderGalleriesOnServer(targetSlug, nextItems);
      setGalleryItems(nextItems);

      if (hasAddedItems) {
        setGalleryUploadAlert({
          variant: "success",
          message: `${addedItemCount} foto berhasil ditambahkan ke galeri.`,
        });
      }
    } catch (error) {
      console.error("Failed to sync galleries immediately", error);
      setGalleryItems(previousItems);

      if (hasAddedItems) {
        setGalleryUploadAlert({
          variant: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gagal mengunggah foto galeri",
        });
      }

      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan perubahan galeri",
        variant: "error",
      });
    } finally {
      setIsUploadingGallery(false);
      setIsSyncingGalleries(false);
    }
  };

  const addAchievement = async () => {
    const name = newAchievementName.trim();

    if (!name) {
      return;
    }

    if (!canSyncNestedItems || isSyncingAchievements) {
      setAchievementItems((prev) =>
        normalizeAchievementInputOrder([
          ...prev,
          {
            clientId: createClientId("achievement-new"),
            name,
            order: prev.length,
          },
        ]),
      );

      setAchievementAddAlert({
        variant: "success",
        message: "Prestasi berhasil ditambahkan.",
      });
      setNewAchievementName("");
      return;
    }

    const targetSlug = String(slug || "").trim();

    setIsSyncingAchievements(true);
    setIsAddingAchievement(true);
    setAchievementAddAlert(null);

    try {
      const response = await fetch(
        `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/achievements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ name }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || "Gagal menambahkan prestasi");
      }

      const createdAchievementId = extractCreatedId(responseData);

      if (!createdAchievementId) {
        throw new Error("ID prestasi tidak ditemukan dari response API");
      }

      const nextItems = normalizeAchievementInputOrder([
        ...sortByOrder(achievementItems),
        {
          clientId: createClientId("achievement-existing"),
          id: createdAchievementId,
          name,
          order: achievementItems.length,
        },
      ]);

      setAchievementItems(nextItems);
      setNewAchievementName("");
      setAchievementAddAlert({
        variant: "success",
        message: "Prestasi berhasil ditambahkan.",
      });
    } catch (error) {
      console.error("Failed to add achievement immediately", error);

      setAchievementAddAlert({
        variant: "error",
        message:
          error instanceof Error ? error.message : "Gagal menambahkan prestasi",
      });

      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal menambahkan prestasi",
        variant: "error",
      });
    } finally {
      setIsAddingAchievement(false);
      setIsSyncingAchievements(false);
    }
  };

  const removeAchievement = async (clientId: string) => {
    const previousItems = normalizeAchievementInputOrder(
      sortByOrder(achievementItems),
    );
    const removedItem = previousItems.find(
      (item) => item.clientId === clientId,
    );

    if (!removedItem) {
      return;
    }

    const nextItems = normalizeAchievementInputOrder(
      previousItems.filter((item) => item.clientId !== clientId),
    );

    if (!canSyncNestedItems || isSyncingAchievements) {
      setAchievementItems(nextItems);
      return;
    }

    const targetSlug = String(slug || "").trim();

    setAchievementItems(nextItems);
    setIsSyncingAchievements(true);

    try {
      const removedId = Number(removedItem.id || 0);

      if (Number.isFinite(removedId) && removedId > 0) {
        const deleteRes = await fetch(
          `/api/backoffice/extracurriculars/${encodeURIComponent(targetSlug)}/achievements/${removedId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!deleteRes.ok) {
          const errorData = await deleteRes.json();
          throw new Error(errorData?.message || "Gagal menghapus prestasi");
        }
      }
    } catch (error) {
      console.error("Failed to delete achievement immediately", error);
      setAchievementItems(previousItems);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal menghapus prestasi",
        variant: "error",
      });
    } finally {
      setIsSyncingAchievements(false);
    }
  };

  const handleAchievementDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    clientId: string,
  ) => {
    if (isSubmitting || isSyncingAchievements) {
      return;
    }

    setDraggingAchievementClientId(clientId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clientId);
  };

  const handleAchievementDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (isSubmitting || isSyncingAchievements) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleAchievementDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    targetClientId: string,
  ) => {
    event.preventDefault();

    if (isSubmitting || isSyncingAchievements) {
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

    if (!canSyncNestedItems) {
      return;
    }

    const targetSlug = String(slug || "").trim();

    setIsSyncingAchievements(true);

    try {
      await reorderAchievementsOnServer(targetSlug, nextItems);
    } catch (error) {
      console.error("Failed to reorder achievement immediately", error);
      setAchievementItems(previousItems);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal mengurutkan prestasi",
        variant: "error",
      });
    } finally {
      setIsSyncingAchievements(false);
    }
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
    if (formValues.categories.length === 0) {
      nextErrors.categories = "Kategori minimal 1";
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

      const basePayload = {
        name: formValues.name.trim(),
        thumbnailUrl: finalThumbnailUrl,
        categories: formValues.categories,
        mentorName: formValues.mentorName.trim(),
        description: formValues.description.trim(),
        schedule: formValues.schedule.trim(),
        location: formValues.location.trim(),
        isPublished: formValues.isPublished,
      };

      const payload = isEditMode
        ? basePayload
        : {
            ...basePayload,
            galleries: await getCreatePayloadGalleries(),
            achievements: getCreatePayloadAchievements(),
          };

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
              label="Slug"
              value={formValues.slug}
              readOnly
              className="bg-gray-100"
              placeholder="Slug otomatis"
            />

            <CategoryMultiInput
              label="Kategori"
              value={formValues.categories}
              onChange={(nextCategories) => {
                setFormValues((prev) => ({
                  ...prev,
                  categories: nextCategories,
                }));
                setFormErrors((prev) => ({ ...prev, categories: undefined }));
              }}
              suggestions={categorySuggestions}
              isMandatory
              error={formErrors.categories}
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
              disabled={isSubmitting || isSyncingGalleries}
              isLoadingAddButton={isUploadingGallery}
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
                  draggable={!isSubmitting && !isSyncingAchievements}
                  onDragStart={(event) =>
                    handleAchievementDragStart(event, item.clientId)
                  }
                  onDragOver={handleAchievementDragOver}
                  onDrop={(event) =>
                    handleAchievementDrop(event, item.clientId)
                  }
                  onDragEnd={handleAchievementDragEnd}
                  className={`flex items-center gap-2 border border-gray-300 rounded-sm px-2 py-2 ${
                    isSubmitting || isSyncingAchievements ? "" : "cursor-move"
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
                    disabled={isSubmitting || isSyncingAchievements}
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
                disabled={isSubmitting || isSyncingAchievements}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAchievement();
                  }
                }}
              />
            </div>

            {(isAddingAchievement || achievementAddAlert) && (
              <div className="space-y-2">
                {isAddingAchievement && (
                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full w-2/5 rounded-full bg-primary animate-pulse" />
                  </div>
                )}

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
              disabled={
                isSubmitting ||
                isSyncingAchievements ||
                !newAchievementName.trim()
              }
              onClick={addAchievement}
            />
          </div>

          <div className="flex justify-end gap-3 lg:col-span-2">
            <Link href="/admin/siswa/ekstrakurikuler">
              <TextButton
                variant="outline"
                text="Batal"
                disabled={
                  isSubmitting || isSyncingGalleries || isSyncingAchievements
                }
              />
            </Link>
            <TextButton
              variant="primary"
              text={isEditMode ? "Simpan" : "Simpan"}
              isLoading={isSubmitting}
              disabled={
                isSubmitting || isSyncingGalleries || isSyncingAchievements
              }
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

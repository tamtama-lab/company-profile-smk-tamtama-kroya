import { SchoolFacilityCategory, SchoolFacilityItem } from "./type";

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    return lowered === "true" || lowered === "1";
  }

  return false;
};

const parsePositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const toCategoryObject = (value: unknown): SchoolFacilityCategory | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const name = typeof root.name === "string" ? root.name.trim() : "";

  if (!name) {
    return null;
  }

  const id = parsePositiveInt(root.id) ?? 0;
  const createdAt =
    typeof root.createdAt === "string" ? root.createdAt.trim() : undefined;
  const updatedAt =
    typeof root.updatedAt === "string" ? root.updatedAt.trim() : undefined;

  return {
    id,
    name,
    createdAt,
    updatedAt,
  };
};

const normalizeGallery = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const root = item as Record<string, unknown>;
      const photoUrl =
        typeof root.photoUrl === "string" ? root.photoUrl.trim() : "";

      if (!photoUrl) {
        return null;
      }

      return {
        id: Number(root.id || index + 1),
        photoUrl,
        order: Number(root.order ?? index),
        createdAt: typeof root.createdAt === "string" ? root.createdAt : "",
        updatedAt: typeof root.updatedAt === "string" ? root.updatedAt : "",
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: number;
        photoUrl: string;
        order: number;
        createdAt: string;
        updatedAt: string;
      } => Boolean(item),
    );
};

export const normalizeItem = (
  item: Partial<SchoolFacilityItem>,
): SchoolFacilityItem => {
  const normalizedTitle = item.title?.trim() || "Tanpa Judul";
  const category = toCategoryObject(item.category);
  const categoryId = parsePositiveInt(item.categoryId) ?? category?.id ?? null;

  return {
    id: Number(item.id || 0),
    title: normalizedTitle,
    summary: item.summary?.trim() || "",
    slug: item.slug?.trim() || toSlug(normalizedTitle),
    description: item.description?.trim() || "",
    coverPhotoUrl: item.coverPhotoUrl?.trim() || "https://placehold.co/1200x800/png",
    galleryDescription: item.galleryDescription?.trim() || "",
    isPublished: normalizeBoolean(item.isPublished),
    categoryId,
    category:
      category && categoryId
        ? {
            ...category,
            id: categoryId,
          }
        : category,
    galleries: normalizeGallery(item.galleries),
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    deletedAt: item.deletedAt ?? null,
  };
};

export const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

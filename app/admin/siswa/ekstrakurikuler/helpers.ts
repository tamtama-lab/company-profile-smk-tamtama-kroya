import { ExtracurricularCategory, ExtracurricularItem } from "./type";

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
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

const toCategoryObject = (value: unknown): ExtracurricularCategory | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const name = typeof root.name === "string" ? root.name.trim() : "";

  if (!name) {
    return null;
  }

  const categoryId = parsePositiveInt(root.id) ?? 0;
  const createdAt =
    typeof root.createdAt === "string" ? root.createdAt : undefined;
  const updatedAt =
    typeof root.updatedAt === "string" ? root.updatedAt : undefined;

  return {
    id: categoryId,
    name,
    createdAt,
    updatedAt,
  };
};

export const toCategoryArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          const normalizedValue = item.trim();
          return normalizedValue ? [normalizedValue] : [];
        }

        if (!item || typeof item !== "object") {
          return [];
        }

        const root = item as Record<string, unknown>;
        const categoryName =
          typeof root.name === "string" ? root.name.trim() : "";

        return categoryName ? [categoryName] : [];
      })
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const root = value as Record<string, unknown>;
    const categoryName =
      typeof root.name === "string" ? root.name.trim() : "";

    return categoryName ? [categoryName] : [];
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

type RawExtracurricularItem = Partial<ExtracurricularItem> & {
  category?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
  categoryLabel?: unknown;
};

const resolveCategoryNames = (item: RawExtracurricularItem) => {
  const candidates = [
    item.categories,
    item.category,
    item.categoryName,
    item.categoryLabel,
  ];

  for (const candidate of candidates) {
    const categories = toCategoryArray(candidate);

    if (categories.length > 0) {
      return categories;
    }
  }

  return [];
};

const resolveCategory = (item: RawExtracurricularItem) => {
  const fromCategoryObject = toCategoryObject(item.category);

  if (fromCategoryObject) {
    return fromCategoryObject;
  }

  const categoryNames = resolveCategoryNames(item);

  if (categoryNames.length === 0) {
    return null;
  }

  return {
    id: parsePositiveInt(item.categoryId) ?? 0,
    name: categoryNames[0],
  };
};

export const normalizeItem = (
  item: Partial<ExtracurricularItem>,
): ExtracurricularItem => {
  const rawItem = item as RawExtracurricularItem;

  const normalizedName = item.name?.trim() || "Tanpa Nama";
  const resolvedCategory = resolveCategory(rawItem);
  const resolvedCategoryId =
    parsePositiveInt(rawItem.categoryId) ??
    (resolvedCategory?.id && resolvedCategory.id > 0
      ? resolvedCategory.id
      : null);
  const resolvedCategoryNames = resolvedCategory?.name
    ? [resolvedCategory.name]
    : resolveCategoryNames(rawItem);

  return {
    id: Number(item.id || 0),
    name: normalizedName,
    slug: item.slug?.trim() || toSlug(normalizedName),
    thumbnailUrl:
      item.thumbnailUrl?.trim() || "https://placehold.co/1200x800/png",
    categoryId: resolvedCategoryId,
    category:
      resolvedCategory && resolvedCategoryId
        ? { ...resolvedCategory, id: resolvedCategoryId }
        : resolvedCategory,
    categories: resolvedCategoryNames,
    mentorName: item.mentorName?.trim() || "",
    description: item.description?.trim() || "",
    schedule: item.schedule?.trim() || "",
    location: item.location?.trim() || "",
    isPublished: normalizeBoolean(item.isPublished),
    galleries: Array.isArray(item.galleries) ? item.galleries : [],
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    deletedAt: item.deletedAt ?? null,
  };
};

export const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

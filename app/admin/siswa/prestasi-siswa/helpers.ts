import { SchoolAchievementItem } from "./type";

export const DEFAULT_SCHOOL_NAME = "SMK Tamtama Kroya";

export const COMPETITION_LEVEL_OPTIONS = [
  { value: "kecamatan", label: "Kecamatan" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "daerah", label: "Daerah" },
  { value: "provinsi", label: "Provinsi" },
] as const;

export const PROVINCE_OPTIONS = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
] as const;

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

const normalizeDate = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  return trimmed;
};

const toCategoryName = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const root = value as Record<string, unknown>;

    if (typeof root.name === "string") {
      return root.name.trim();
    }
  }

  return "";
};

const normalizeCompetitionLevel = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  const lowered = value.trim().toLowerCase();

  if (!lowered) {
    return "";
  }

  const validLevels = new Set(
    COMPETITION_LEVEL_OPTIONS.map((item) => item.value),
  );

  if (validLevels.has(lowered as (typeof COMPETITION_LEVEL_OPTIONS)[number]["value"])) {
    return lowered;
  }

  return lowered;
};

export const normalizeItem = (
  item: Partial<SchoolAchievementItem>,
): SchoolAchievementItem => {
  const normalizedTitle = item.title?.trim() || "Tanpa Judul";

  return {
    id: Number(item.id || 0),
    title: normalizedTitle,
    slug: item.slug?.trim() || toSlug(normalizedTitle),
    description: item.description?.trim() || "",
    galleryDescription: item.galleryDescription?.trim() || "",
    competitionLevel: normalizeCompetitionLevel(item.competitionLevel),
    placeName: item.placeName?.trim() || "",
    organizerName: item.organizerName?.trim() || "",
    competitionDate: normalizeDate(item.competitionDate),
    category: toCategoryName(item.category),
    participantName: item.participantName?.trim() || "",
    coverPhotoUrl:
      item.coverPhotoUrl?.trim() || "https://placehold.co/1200x800/png",
    isPublished: normalizeBoolean(item.isPublished),
    galleries: Array.isArray(item.galleries) ? item.galleries : [],
    awards: Array.isArray(item.awards) ? item.awards : [],
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    deletedAt: item.deletedAt ?? null,
  };
};

export const competitionLevelLabel = (value: string) => {
  const matched = COMPETITION_LEVEL_OPTIONS.find(
    (option) => option.value === value.trim().toLowerCase(),
  );

  if (matched) {
    return matched.label;
  }

  if (!value.trim()) {
    return "-";
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

export const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

import { NextRequest, NextResponse } from "next/server";
import {
  MockAchievementItem,
  MockGalleryItem,
  MOCK_EXTRACURRICULARS,
} from "../mockData";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";
const DEFAULT_THUMBNAIL_URL = "https://placehold.co/1200x800/png";

const MOCK_CATEGORY_OPTIONS = [
  { id: 1, name: "Kejuruan & Teknologi" },
  { id: 2, name: "Kepemimpinan & Organisasi" },
  { id: 3, name: "Olahraga" },
  { id: 4, name: "Seni & Budaya" },
];

interface ExtracurricularCategory {
  id: number;
  name: string;
}

interface PublicExtracurricularDetail {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  mentorName: string;
  description: string;
  schedule: string;
  location: string;
  isPublished: boolean;
  category: ExtracurricularCategory | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  galleries: MockGalleryItem[];
  achievements: MockAchievementItem[];
}

interface BackendGalleryItem {
  id?: number;
  extracurricularId?: number;
  photoUrl?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendAchievementItem {
  id?: number;
  extracurricularId?: number;
  name?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendExtracurricularDetail {
  id?: number;
  name?: string;
  slug?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  categoryId?: number | string;
  category?:
    | {
        id?: number | string;
        name?: string;
      }
    | string[]
    | string;
  categories?: string[] | string;
  mentorName?: string;
  location?: string;
  schedule?: string;
  description?: string;
  isPublished?: boolean | number | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  galleries?: BackendGalleryItem[];
  achievements?: BackendAchievementItem[];
}

interface BackendDetailPayload {
  data?: BackendExtracurricularDetail;
}

const isBackendDetailPayload = (
  value: BackendExtracurricularDetail | BackendDetailPayload,
): value is BackendDetailPayload =>
  Object.prototype.hasOwnProperty.call(value, "data");

const toCategoryArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toCategoryId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return false;
};

const findCategoryByName = (name: string): ExtracurricularCategory | null => {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  const matched = MOCK_CATEGORY_OPTIONS.find(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  );

  return matched ? { ...matched } : null;
};

const resolveCategory = (
  item: BackendExtracurricularDetail,
): ExtracurricularCategory | null => {
  const rawCategoryId = toCategoryId(item.categoryId);

  if (item.category && typeof item.category === "object" && !Array.isArray(item.category)) {
    const root = item.category as Record<string, unknown>;
    const categoryName =
      typeof root.name === "string" ? root.name.trim() : "";

    if (categoryName) {
      const categoryIdFromObject = toCategoryId(root.id);
      const matchedCategory = findCategoryByName(categoryName);
      const resolvedCategoryId =
        rawCategoryId ?? categoryIdFromObject ?? matchedCategory?.id ?? 0;

      return {
        id: resolvedCategoryId,
        name: categoryName,
      };
    }
  }

  const categoryNames = toCategoryArray(item.categories || item.category);

  if (categoryNames.length > 0) {
    const primaryCategoryName = categoryNames[0];
    const matchedCategory = findCategoryByName(primaryCategoryName);

    return {
      id: rawCategoryId ?? matchedCategory?.id ?? 0,
      name: primaryCategoryName,
    };
  }

  if (rawCategoryId) {
    const matchedById = MOCK_CATEGORY_OPTIONS.find(
      (itemValue) => itemValue.id === rawCategoryId,
    );

    if (matchedById) {
      return { ...matchedById };
    }
  }

  return null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const normalizeGallery = (
  items: BackendGalleryItem[] | undefined,
  extracurricularId: number,
): MockGalleryItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: Number(item.id || index + 1),
    extracurricularId: Number(item.extracurricularId || extracurricularId),
    photoUrl: item.photoUrl || "https://placehold.co/1600x900/png",
    order: Number(item.order || index),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
};

const normalizeAchievement = (
  items: BackendAchievementItem[] | undefined,
  extracurricularId: number,
): MockAchievementItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: Number(item.id || index + 1),
    extracurricularId: Number(item.extracurricularId || extracurricularId),
    name: item.name || "Prestasi",
    order: Number(item.order || index),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
};

const normalizeDetail = (
  item: BackendExtracurricularDetail,
): PublicExtracurricularDetail => {
  const id = Number(item.id || 0);
  const name = item.name || "Tanpa Nama";
  const slug = item.slug || slugify(name);

  return {
    id,
    name,
    slug,
    thumbnailUrl:
      item.thumbnailUrl || item.thumbnail || DEFAULT_THUMBNAIL_URL,
    mentorName: item.mentorName || "-",
    location: item.location || "Location belum tersedia.",
    schedule: item.schedule || "Jadwal belum tersedia.",
    description: item.description || "Deskripsi belum tersedia.",
    isPublished: normalizeBoolean(item.isPublished ?? true),
    category: resolveCategory(item),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    deletedAt: item.deletedAt ?? null,
    galleries: normalizeGallery(item.galleries, id),
    achievements: normalizeAchievement(item.achievements, id),
  };
};

const getSlugFromPath = (pathname: string) => {
  const value = pathname.split("/").pop();

  if (!value) {
    return "";
  }

  return decodeURIComponent(value);
};

const findMockBySlug = (slug: string) => {
  const normalizedSlug = slug.toLowerCase();

  return MOCK_EXTRACURRICULARS.find(
    (item) => item.slug.toLowerCase() === normalizedSlug,
  );
};

export async function GET(request: NextRequest) {
  const slug = getSlugFromPath(request.nextUrl.pathname);

  if (!slug) {
    return NextResponse.json(
      { error: "Slug extracurricular tidak valid" },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/extracurriculars/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (backendResponse.ok) {
      const backendData: BackendExtracurricularDetail | BackendDetailPayload =
        await backendResponse.json();

      if (isBackendDetailPayload(backendData)) {
        if (backendData.data) {
          return NextResponse.json(normalizeDetail(backendData.data), {
            status: 200,
          });
        }
      } else {
        return NextResponse.json(normalizeDetail(backendData), {
          status: 200,
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch extracurricular detail from backend:", error);
  }

  const fallbackData = findMockBySlug(slug);

  if (!fallbackData) {
    return NextResponse.json(
      { error: "Data extracurricular tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json(normalizeDetail(fallbackData), { status: 200 });
}

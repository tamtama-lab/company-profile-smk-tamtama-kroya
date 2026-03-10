import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";
const DEFAULT_COVER_URL = "https://placehold.co/1200x800/png";
const DEFAULT_GALLERY_URL = "https://placehold.co/1600x900/png";

interface SchoolFacilityCategory {
  id: number;
  name: string;
}

interface SchoolFacilityGalleryItem {
  id: number;
  photoUrl: string;
  order: number;
}

interface SchoolFacilityDetail {
  id: number;
  title: string;
  summary: string;
  slug: string;
  description: string;
  coverPhotoUrl: string;
  galleryDescription: string;
  isPublished: boolean;
  category: SchoolFacilityCategory | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  galleries: SchoolFacilityGalleryItem[];
}

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }

  return false;
};

const parseCategoryId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const normalizeCategory = (
  value: unknown,
  fallbackCategoryId: unknown,
): SchoolFacilityCategory | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const name = toStringValue(root.name);

  if (!name) {
    return null;
  }

  return {
    id: parseCategoryId(root.id) ?? parseCategoryId(fallbackCategoryId) ?? 0,
    name,
  };
};

const normalizeGallery = (value: unknown): SchoolFacilityGalleryItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const root = item as Record<string, unknown>;
      const photoUrl = toStringValue(root.photoUrl);

      return {
        id: Number(root.id || index + 1),
        photoUrl: photoUrl || DEFAULT_GALLERY_URL,
        order: Number(root.order ?? index),
      };
    })
    .filter((item): item is SchoolFacilityGalleryItem => Boolean(item));
};

const normalizeDetail = (value: unknown): SchoolFacilityDetail | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const normalizedTitle = toStringValue(root.title) || "Tanpa Judul";

  return {
    id: Number(root.id || 0),
    title: normalizedTitle,
    summary: toStringValue(root.summary),
    slug: toStringValue(root.slug) || toSlug(normalizedTitle),
    description: toStringValue(root.description),
    coverPhotoUrl: toStringValue(root.coverPhotoUrl) || DEFAULT_COVER_URL,
    galleryDescription: toStringValue(root.galleryDescription),
    isPublished: normalizeBoolean(root.isPublished),
    category: normalizeCategory(root.category, root.categoryId),
    createdAt: toStringValue(root.createdAt),
    updatedAt: toStringValue(root.updatedAt),
    deletedAt: toStringValue(root.deletedAt) || null,
    galleries: normalizeGallery(root.galleries),
  };
};

const getSafePayload = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || "").trim();

  if (!slug) {
    return NextResponse.json(
      { message: "Slug fasilitas tidak valid." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/school-facilities/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const payload = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: "Data fasilitas tidak ditemukan." },
        { status: backendResponse.status },
      );
    }

    const detail =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    const normalizedDetail = normalizeDetail(detail);

    if (!normalizedDetail || !normalizedDetail.isPublished) {
      return NextResponse.json(
        { message: "Data fasilitas tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(normalizedDetail, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch school facility detail from backend:", error);
    return NextResponse.json(
      { message: "Gagal memuat detail fasilitas." },
      { status: 500 },
    );
  }
}

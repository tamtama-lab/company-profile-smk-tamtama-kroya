import { NextRequest, NextResponse } from "next/server";
import {
  MockAchievementItem,
  MockExtracurricularDetail,
  MockGalleryItem,
  MOCK_EXTRACURRICULARS,
} from "../mockData";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

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
  categories?: string[] | string;
  category?: string[] | string;
  mentorName?: string;
  location?: string;
  schedule?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  galleries?: BackendGalleryItem[];
  achievements?: BackendAchievementItem[];
}

interface BackendDetailPayload {
  data?: BackendExtracurricularDetail;
}

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
): MockExtracurricularDetail => {
  const id = Number(item.id || 0);
  const name = item.name || "Tanpa Nama";
  const slug = item.slug || slugify(name);

  return {
    id,
    name,
    slug,
    thumbnailUrl:
      item.thumbnailUrl || item.thumbnail || "https://placehold.co/1200x800/png",
    categories: toCategoryArray(item.categories || item.category),
    mentorName: item.mentorName || "-",
    location: item.location || "Location belum tersedia.",
    schedule: item.schedule || "Jadwal belum tersedia.",
    description: item.description || "Deskripsi belum tersedia.",
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

      const rawData = "data" in backendData ? backendData.data : backendData;

    //   if (rawData) {
    //     return NextResponse.json(normalizeDetail(rawData), { status: 200 });
    //   }
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

  return NextResponse.json(fallbackData, { status: 200 });
}

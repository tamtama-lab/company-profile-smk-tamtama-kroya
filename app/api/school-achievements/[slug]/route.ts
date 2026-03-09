import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

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

const toCategoryName = (value: unknown) => {
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

const normalizeGallery = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const root = item as Record<string, unknown>;
      const photoUrl = toStringValue(root.photoUrl);

      if (!photoUrl) {
        return null;
      }

      return {
        id: Number(root.id || index + 1),
        photoUrl,
        order: Number(root.order ?? index),
        createdAt: toStringValue(root.createdAt),
        updatedAt: toStringValue(root.updatedAt),
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

const normalizeAwards = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const root = item as Record<string, unknown>;
      const name = toStringValue(root.name);

      if (!name) {
        return null;
      }

      return {
        id: Number(root.id || index + 1),
        name,
        order: Number(root.order ?? index),
        createdAt: toStringValue(root.createdAt),
        updatedAt: toStringValue(root.updatedAt),
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: number;
        name: string;
        order: number;
        createdAt: string;
        updatedAt: string;
      } => Boolean(item),
    );
};

const normalizeItem = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const normalizedTitle = toStringValue(root.title) || "Tanpa Judul";

  return {
    id: Number(root.id || 0),
    title: normalizedTitle,
    slug: toStringValue(root.slug) || toSlug(normalizedTitle),
    description: toStringValue(root.description),
    competitionLevel: toStringValue(root.competitionLevel).toLowerCase(),
    placeName: toStringValue(root.placeName),
    organizerName: toStringValue(root.organizerName),
    competitionDate: toStringValue(root.competitionDate),
    category: toCategoryName(root.category),
    participantName: toStringValue(root.participantName),
    coverPhotoUrl:
      toStringValue(root.coverPhotoUrl) || "https://placehold.co/1200x800/png",
    isPublished: normalizeBoolean(root.isPublished ?? true),
    galleries: normalizeGallery(root.galleries),
    awards: normalizeAwards(root.awards),
    createdAt: toStringValue(root.createdAt),
    updatedAt: toStringValue(root.updatedAt),
    deletedAt:
      typeof root.deletedAt === "string" && root.deletedAt
        ? root.deletedAt
        : null,
  };
};

const getSafePayload = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const getSlugFromPath = (pathname: string) => {
  const value = pathname.split("/").pop();

  if (!value) {
    return "";
  }

  return decodeURIComponent(value).trim();
};

export async function GET(request: NextRequest) {
  const slug = getSlugFromPath(request.nextUrl.pathname);

  if (!slug) {
    return NextResponse.json(
      { error: "Slug school achievement tidak valid" },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/school-achievements/${encodeURIComponent(slug)}`,
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
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const detail =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    const normalizedDetail = normalizeItem(detail);

    if (!normalizedDetail) {
      return NextResponse.json(
        { error: "Data school achievement tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!normalizedDetail.isPublished) {
      return NextResponse.json(
        { error: "Data school achievement tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(normalizedDetail, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch school achievement detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

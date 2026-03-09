import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

const unauthorizedResponse = () =>
  NextResponse.json(
    {
      error: "E_UNAUTHORIZED_ACCESS",
      message: "Not authenticated",
    },
    { status: 401 },
  );

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
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

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
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

const normalizeAward = (value: unknown) => {
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
  const normalizedCategory = toCategoryName(root.category);

  return {
    id: Number(root.id || 0),
    title: normalizedTitle,
    slug: toStringValue(root.slug) || toSlug(normalizedTitle),
    description: toStringValue(root.description),
    competitionLevel: toStringValue(root.competitionLevel).toLowerCase(),
    placeName: toStringValue(root.placeName),
    organizerName: toStringValue(root.organizerName),
    competitionDate: toStringValue(root.competitionDate),
    category: normalizedCategory,
    participantName: toStringValue(root.participantName),
    coverPhotoUrl:
      toStringValue(root.coverPhotoUrl) || "https://placehold.co/1200x800/png",
    isPublished: normalizeBoolean(root.isPublished),
    galleries: normalizeGallery(root.galleries),
    awards: normalizeAward(root.awards),
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

const buildBasePayload = (body: Record<string, unknown>) => ({
  title: toStringValue(body.title),
  slug: toStringValue(body.slug),
  description: toStringValue(body.description),
  competitionLevel: toStringValue(body.competitionLevel).toLowerCase(),
  placeName: toStringValue(body.placeName),
  organizerName: toStringValue(body.organizerName),
  competitionDate: toStringValue(body.competitionDate),
  category: toStringValue(body.category),
  participantName: toStringValue(body.participantName),
  coverPhotoUrl: toStringValue(body.coverPhotoUrl),
  isPublished:
    typeof body.isPublished === "boolean"
      ? body.isPublished
      : normalizeBoolean(body.isPublished),
  galleries: toStringArray(body.galleries),
  awards: toStringArray(body.awards),
});

const hasMissingRequiredFields = (
  payload: ReturnType<typeof buildBasePayload>,
  options?: { requireCoverPhoto?: boolean },
) => {
  const requiredTextFields: Array<keyof ReturnType<typeof buildBasePayload>> = [
    "title",
    "description",
    "competitionLevel",
    "placeName",
    "organizerName",
    "competitionDate",
    "category",
    "participantName",
  ];

  if (options?.requireCoverPhoto) {
    requiredTextFields.push("coverPhotoUrl");
  }

  return requiredTextFields.some((field) => !payload[field]);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const perPage = parsePositiveInt(
      searchParams.get("perPage") || searchParams.get("limit"),
      6,
    );
    const search = toStringValue(searchParams.get("search"));
    const category = toStringValue(searchParams.get("category"));
    const competitionLevel = toStringValue(searchParams.get("competitionLevel"));

    const queryParams = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      limit: String(perPage),
    });

    if (search) {
      queryParams.set("search", search);
    }

    if (category) {
      queryParams.set("category", category);
    }

    if (competitionLevel) {
      queryParams.set("competitionLevel", competitionLevel);
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-achievements?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    const payload = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const root =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};

    const rawItems = Array.isArray(root.items)
      ? root.items
      : Array.isArray(root.data)
        ? root.data
        : [];

    const normalizedItems = rawItems
      .map((item) => normalizeItem(item))
      .filter(Boolean);

    const rawMeta =
      root.meta && typeof root.meta === "object"
        ? (root.meta as Record<string, unknown>)
        : null;

    const normalizedMeta = rawMeta
      ? {
          ...rawMeta,
          total: Number(rawMeta.total ?? normalizedItems.length),
          perPage: Number(rawMeta.perPage ?? rawMeta.limit ?? perPage),
          currentPage: Number(rawMeta.currentPage ?? page),
          lastPage: Number(rawMeta.lastPage ?? 1),
          firstPage: Number(rawMeta.firstPage ?? 1),
          firstPageUrl:
            typeof rawMeta.firstPageUrl === "string"
              ? rawMeta.firstPageUrl
              : `${request.nextUrl.pathname}?page=1`,
          lastPageUrl:
            typeof rawMeta.lastPageUrl === "string"
              ? rawMeta.lastPageUrl
              : `${request.nextUrl.pathname}?page=1`,
          nextPageUrl:
            typeof rawMeta.nextPageUrl === "string" ? rawMeta.nextPageUrl : null,
          previousPageUrl:
            typeof rawMeta.previousPageUrl === "string"
              ? rawMeta.previousPageUrl
              : null,
        }
      : {
          total: normalizedItems.length,
          perPage,
          currentPage: page,
          lastPage: 1,
          firstPage: 1,
          firstPageUrl: `${request.nextUrl.pathname}?page=1`,
          lastPageUrl: `${request.nextUrl.pathname}?page=1`,
          nextPageUrl: null,
          previousPageUrl: null,
        };

    return NextResponse.json(
      {
        meta: normalizedMeta,
        items: normalizedItems,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Backoffice school-achievements fetch error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const body = (await request.json()) as Record<string, unknown>;
    const payload = buildBasePayload(body);

    if (hasMissingRequiredFields(payload, { requireCoverPhoto: true })) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, competitionLevel, placeName, organizerName, competitionDate, category, participantName, coverPhotoUrl",
        },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-achievements`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create school achievement:", error);
    return NextResponse.json(
      { error: "Failed to create school achievement" },
      { status: 500 },
    );
  }
}

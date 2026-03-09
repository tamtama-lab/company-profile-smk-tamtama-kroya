import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

interface SchoolAchievementItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  competitionLevel: string;
  placeName: string;
  organizerName: string;
  competitionDate: string;
  category: string;
  participantName: string;
  coverPhotoUrl: string;
  isPublished: boolean;
  awards: Array<{ id: number; name: string; order: number }>;
}

interface SchoolAchievementListResponse {
  meta: PaginationMeta;
  data: SchoolAchievementItem[];
}

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
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: number;
        name: string;
        order: number;
      } => Boolean(item),
    );
};

const normalizeItem = (value: unknown): SchoolAchievementItem | null => {
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
    awards: normalizeAwards(root.awards),
  };
};

const buildMeta = (
  total: number,
  perPage: number,
  currentPage: number,
  baseUrl: string,
): PaginationMeta => {
  const safePerPage = Math.max(1, perPage);
  const lastPage = Math.max(1, Math.ceil(total / safePerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), lastPage);

  return {
    total,
    perPage: safePerPage,
    currentPage: safeCurrentPage,
    lastPage,
    firstPage: 1,
    firstPageUrl: `${baseUrl}?page=1`,
    lastPageUrl: `${baseUrl}?page=${lastPage}`,
    nextPageUrl:
      safeCurrentPage < lastPage
        ? `${baseUrl}?page=${safeCurrentPage + 1}`
        : null,
    previousPageUrl:
      safeCurrentPage > 1
        ? `${baseUrl}?page=${safeCurrentPage - 1}`
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const perPage = parsePositiveInt(
    searchParams.get("perPage") || searchParams.get("limit"),
    6,
  );
  const search = toStringValue(searchParams.get("search"));
  const category = toStringValue(searchParams.get("category"));
  const competitionLevel = toStringValue(searchParams.get("competitionLevel"));

  const backendParams = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    limit: String(perPage),
    isPublished: "true",
  });

  if (search) {
    backendParams.set("search", search);
  }

  if (category) {
    backendParams.set("category", category);
  }

  if (competitionLevel) {
    backendParams.set("competitionLevel", competitionLevel);
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/school-achievements?${backendParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const payload = await getSafePayload(backendResponse);

    if (backendResponse.ok) {
      const root =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : {};

      const rawItems = Array.isArray(root.items)
        ? root.items
        : Array.isArray(root.data)
          ? root.data
          : Array.isArray(payload)
            ? payload
            : [];

      const normalizedItems = rawItems
        .map((item) => normalizeItem(item))
        .filter((item): item is SchoolAchievementItem => Boolean(item))
        .filter((item) => item.isPublished);

      const backendMeta =
        root.meta && typeof root.meta === "object"
          ? (root.meta as Record<string, unknown>)
          : null;

      const meta = backendMeta
        ? {
            ...buildMeta(
              Number(backendMeta.total ?? normalizedItems.length),
              Number(backendMeta.perPage ?? backendMeta.limit ?? perPage),
              Number(backendMeta.currentPage ?? page),
              request.nextUrl.pathname,
            ),
            firstPageUrl:
              typeof backendMeta.firstPageUrl === "string"
                ? backendMeta.firstPageUrl
                : `${request.nextUrl.pathname}?page=1`,
            lastPageUrl:
              typeof backendMeta.lastPageUrl === "string"
                ? backendMeta.lastPageUrl
                : `${request.nextUrl.pathname}?page=1`,
            nextPageUrl:
              typeof backendMeta.nextPageUrl === "string"
                ? backendMeta.nextPageUrl
                : null,
            previousPageUrl:
              typeof backendMeta.previousPageUrl === "string"
                ? backendMeta.previousPageUrl
                : null,
          }
        : buildMeta(normalizedItems.length, perPage, page, request.nextUrl.pathname);

      return NextResponse.json<SchoolAchievementListResponse>(
        {
          meta,
          data: normalizedItems,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Failed to fetch school achievements from backend:", error);
  }

  const emptyMeta = buildMeta(0, perPage, page, request.nextUrl.pathname);

  return NextResponse.json<SchoolAchievementListResponse>(
    {
      meta: emptyMeta,
      data: [],
    },
    { status: 200 },
  );
}

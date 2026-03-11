import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";
const DEFAULT_COVER_URL = "https://placehold.co/1200x800/png";

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

interface SchoolFacilityCategory {
  id: number;
  name: string;
}

interface SchoolFacilityListItem {
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
}

interface SchoolFacilityListResponse {
  meta: PaginationMeta;
  data: SchoolFacilityListItem[];
}

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseCategoryId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const hasOwnProperty = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

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

const normalizeItem = (
  value: unknown,
  index: number,
): SchoolFacilityListItem | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const normalizedTitle = toStringValue(root.title) || "Tanpa Judul";
  const description = toStringValue(root.description);
  const parsedId = Number(root.id);
  const hasExplicitPublishedState = hasOwnProperty(root, "isPublished");

  return {
    id: Number.isFinite(parsedId) && parsedId > 0 ? parsedId : index + 1,
    title: normalizedTitle,
    summary: toStringValue(root.summary) || description,
    slug: toStringValue(root.slug) || toSlug(normalizedTitle),
    description,
    coverPhotoUrl: toStringValue(root.coverPhotoUrl) || DEFAULT_COVER_URL,
    galleryDescription: toStringValue(root.galleryDescription),
    isPublished: hasExplicitPublishedState
      ? normalizeBoolean(root.isPublished)
      : true,
    category: normalizeCategory(root.category, root.categoryId),
    createdAt: toStringValue(root.createdAt),
    updatedAt: toStringValue(root.updatedAt),
    deletedAt: toStringValue(root.deletedAt) || null,
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
  const categoryId = toStringValue(searchParams.get("categoryId"));
  const rawIsPublished = searchParams.get("isPublished");
  const isPublished = rawIsPublished === null ? true : normalizeBoolean(rawIsPublished);

  const backendParams = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    limit: String(perPage),
    isPublished: String(isPublished),
  });

  if (search) {
    backendParams.set("search", search);
  }

  if (categoryId) {
    backendParams.set("categoryId", categoryId);
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/school-facilities?${backendParams.toString()}`,
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
        .map((item, index) => normalizeItem(item, index))
        .filter((item): item is SchoolFacilityListItem => Boolean(item))
        .filter((item) => item.isPublished === isPublished);

      const backendMeta =
        root.meta && typeof root.meta === "object"
          ? (root.meta as Record<string, unknown>)
          : null;

      const defaultMeta = buildMeta(
        Number(backendMeta?.total ?? normalizedItems.length),
        Number(backendMeta?.perPage ?? backendMeta?.limit ?? perPage),
        Number(backendMeta?.currentPage ?? page),
        request.nextUrl.pathname,
      );

      const meta = backendMeta
        ? {
            ...defaultMeta,
            firstPageUrl:
              typeof backendMeta.firstPageUrl === "string"
                ? backendMeta.firstPageUrl
                : defaultMeta.firstPageUrl,
            lastPageUrl:
              typeof backendMeta.lastPageUrl === "string"
                ? backendMeta.lastPageUrl
                : defaultMeta.lastPageUrl,
            nextPageUrl:
              typeof backendMeta.nextPageUrl === "string"
                ? backendMeta.nextPageUrl
                : defaultMeta.nextPageUrl,
            previousPageUrl:
              typeof backendMeta.previousPageUrl === "string"
                ? backendMeta.previousPageUrl
                : defaultMeta.previousPageUrl,
          }
        : defaultMeta;

      return NextResponse.json<SchoolFacilityListResponse>(
        {
          meta,
          data: normalizedItems,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Failed to fetch school facilities from backend:", error);
  }

  const emptyMeta = buildMeta(0, perPage, page, request.nextUrl.pathname);

  return NextResponse.json<SchoolFacilityListResponse>(
    {
      meta: emptyMeta,
      data: [],
    },
    { status: 200 },
  );
}

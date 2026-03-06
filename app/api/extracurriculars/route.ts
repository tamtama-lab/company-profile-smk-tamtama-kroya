import { NextRequest, NextResponse } from "next/server";
import { MOCK_EXTRACURRICULARS } from "./mockData";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";
const DEFAULT_THUMBNAIL_URL = "https://placehold.co/1200x800/png";

const MOCK_CATEGORY_OPTIONS = [
  { id: 1, name: "Kejuruan & Teknologi" },
  { id: 2, name: "Kepemimpinan & Organisasi" },
  { id: 3, name: "Olahraga" },
  { id: 4, name: "Seni & Budaya" },
];

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

interface ExtracurricularCategory {
  id: number;
  name: string;
}

interface ExtracurricularListItem {
  name: string;
  slug: string;
  thumbnailUrl: string;
  categoryId: number | null;
  category: ExtracurricularCategory | null;
}

interface ExtracurricularListResponse {
  meta: PaginationMeta;
  data: ExtracurricularListItem[];
}

interface BackendMetaShape {
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
}

interface BackendExtracurricularCategory {
  id?: number | string;
  name?: string;
}

interface BackendExtracurricularListItem {
  name?: string;
  slug?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  categoryId?: number | string;
  category?: BackendExtracurricularCategory | string[] | string;
  categories?: string[] | string;
}

interface BackendExtracurricularListPayload {
  meta?: BackendMetaShape;
  items?: BackendExtracurricularListItem[];
  data?: BackendExtracurricularListItem[];
}

const toPositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const parseCategoryId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

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

const resolveCategory = (item: BackendExtracurricularListItem) => {
  const rawCategoryId = parseCategoryId(item.categoryId);

  if (item.category && typeof item.category === "object" && !Array.isArray(item.category)) {
    const root = item.category as Record<string, unknown>;
    const categoryName =
      typeof root.name === "string" ? root.name.trim() : "";

    if (categoryName) {
      const idFromCategoryObject = parseCategoryId(root.id);
      const matchedCategory = findCategoryByName(categoryName);
      const resolvedCategoryId =
        rawCategoryId ?? idFromCategoryObject ?? matchedCategory?.id ?? null;

      return {
        categoryId: resolvedCategoryId,
        category: {
          id: resolvedCategoryId ?? 0,
          name: categoryName,
        },
      };
    }
  }

  const categoryNames = toCategoryArray(item.categories || item.category);

  if (categoryNames.length > 0) {
    const primaryCategoryName = categoryNames[0];
    const matchedCategory = findCategoryByName(primaryCategoryName);
    const resolvedCategoryId = rawCategoryId ?? matchedCategory?.id ?? null;

    return {
      categoryId: resolvedCategoryId,
      category: {
        id: resolvedCategoryId ?? 0,
        name: primaryCategoryName,
      },
    };
  }

  if (rawCategoryId) {
    const matchedById = MOCK_CATEGORY_OPTIONS.find(
      (itemValue) => itemValue.id === rawCategoryId,
    );

    if (matchedById) {
      return {
        categoryId: rawCategoryId,
        category: { ...matchedById },
      };
    }
  }

  return {
    categoryId: rawCategoryId,
    category: null,
  };
};

const normalizeListItem = (
  item: BackendExtracurricularListItem,
): ExtracurricularListItem => ({
  name: item.name?.trim() || "Tanpa Nama",
  slug: item.slug?.trim() || slugify(item.name?.trim() || "Tanpa Nama"),
  thumbnailUrl:
    item.thumbnailUrl?.trim() || item.thumbnail?.trim() || DEFAULT_THUMBNAIL_URL,
  ...resolveCategory(item),
});

const filterListItems = (
  items: ExtracurricularListItem[],
  search: string,
  categoryIds: number[],
  categories: string[],
) => {
  const normalizedSearch = search.toLowerCase();
  const normalizedCategories = categories.map((item) => item.toLowerCase());
  const categoryIdSet = new Set(categoryIds);

  return items.filter((item) => {
    const categoryName = item.category?.name.toLowerCase() || "";

    const matchSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      categoryName.includes(normalizedSearch);

    const matchCategoryId =
      categoryIdSet.size === 0 ||
      (item.categoryId !== null && categoryIdSet.has(item.categoryId));

    const matchCategory =
      normalizedCategories.length === 0 ||
      normalizedCategories.includes(categoryName);

    return matchSearch && matchCategoryId && matchCategory;
  });
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

const paginateItems = (
  items: ExtracurricularListItem[],
  page: number,
  perPage: number,
) => {
  const meta = buildMeta(items.length, perPage, page, "/api/extracurriculars");
  const startIndex = (meta.currentPage - 1) * meta.perPage;
  const endIndex = startIndex + meta.perPage;

  return {
    meta,
    data: items.slice(startIndex, endIndex),
  };
};

const buildMockResponse = (
  page: number,
  perPage: number,
  search: string,
  categoryIds: number[],
  categories: string[],
  baseUrl: string,
): ExtracurricularListResponse => {
  const mappedItems: ExtracurricularListItem[] = MOCK_EXTRACURRICULARS.map(
    (item) => ({
      name: item.name,
      slug: item.slug,
      thumbnailUrl: item.thumbnailUrl,
      categoryId: findCategoryByName(item.categories[0] || "")?.id || null,
      category: item.categories[0]
        ? {
            id: findCategoryByName(item.categories[0])?.id || 0,
            name: item.categories[0],
          }
        : null,
    }),
  );

  const filteredItems = filterListItems(
    mappedItems,
    search,
    categoryIds,
    categories,
  );
  const paginated = paginateItems(filteredItems, page, perPage);

  return {
    meta: {
      ...paginated.meta,
      firstPageUrl: `${baseUrl}?page=1`,
      lastPageUrl: `${baseUrl}?page=${paginated.meta.lastPage}`,
      nextPageUrl:
        paginated.meta.currentPage < paginated.meta.lastPage
          ? `${baseUrl}?page=${paginated.meta.currentPage + 1}`
          : null,
      previousPageUrl:
        paginated.meta.currentPage > 1
          ? `${baseUrl}?page=${paginated.meta.currentPage - 1}`
          : null,
    },
    data: paginated.data,
  };
};

const parseCategoryIds = (searchParams: URLSearchParams) => {
  const categoryValues = searchParams.getAll("categoryId");

  if (categoryValues.length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      categoryValues
        .flatMap((value) => value.split(","))
        .map((value) => parseCategoryId(value.trim()))
        .filter((value): value is number => value !== null),
    ),
  );
};

const parseCategories = (searchParams: URLSearchParams) => {
  const categoryValues = searchParams.getAll("category");

  if (categoryValues.length > 0) {
    return categoryValues
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const singleCategory = searchParams.get("category");

  if (!singleCategory) {
    return [];
  }

  return singleCategory
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const perPage = toPositiveInt(
    searchParams.get("perPage") || searchParams.get("limit"),
    6,
  );
  const search = (searchParams.get("search") || "").trim();
  const categoryIds = parseCategoryIds(searchParams);
  const categories = parseCategories(searchParams);
  const baseUrl = request.nextUrl.pathname;

  try {
    const backendParams = new URLSearchParams();
    backendParams.set("page", String(page));
    backendParams.set("perPage", String(perPage));
    backendParams.set("limit", String(perPage));

    if (search) {
      backendParams.set("search", search);
    }

    if (categoryIds.length > 0) {
      backendParams.set("categoryId", categoryIds.join(","));
    }

    if (categories.length > 0) {
      backendParams.set("category", categories.join(","));
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/extracurriculars?${backendParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (backendResponse.ok) {
      const backendData: BackendExtracurricularListPayload | BackendExtracurricularListItem[] =
        await backendResponse.json();

      const rawItems = Array.isArray(backendData)
        ? backendData
        : Array.isArray(backendData.items)
          ? backendData.items
          : Array.isArray(backendData.data)
            ? backendData.data
            : null;

      if (rawItems) {
        const normalizedItems = rawItems.map(normalizeListItem);

        if (
          !Array.isArray(backendData) &&
          backendData.meta &&
          Number.isFinite(Number(backendData.meta.total))
        ) {
          const backendMeta = backendData.meta;
          const meta = buildMeta(
            Number(backendMeta.total || normalizedItems.length),
            Number(backendMeta.perPage || perPage),
            Number(backendMeta.currentPage || page),
            baseUrl,
          );

          return NextResponse.json<ExtracurricularListResponse>(
            {
              meta,
              data: normalizedItems,
            },
            { status: 200 },
          );
        }

        const filteredItems = filterListItems(
          normalizedItems,
          search,
          categoryIds,
          categories,
        );
        const paginated = paginateItems(filteredItems, page, perPage);

        return NextResponse.json<ExtracurricularListResponse>(
          {
            meta: {
              ...paginated.meta,
              firstPageUrl: `${baseUrl}?page=1`,
              lastPageUrl: `${baseUrl}?page=${paginated.meta.lastPage}`,
              nextPageUrl:
                paginated.meta.currentPage < paginated.meta.lastPage
                  ? `${baseUrl}?page=${paginated.meta.currentPage + 1}`
                  : null,
              previousPageUrl:
                paginated.meta.currentPage > 1
                  ? `${baseUrl}?page=${paginated.meta.currentPage - 1}`
                  : null,
            },
            data: paginated.data,
          },
          { status: 200 },
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch extracurriculars from backend:", error);
  }

  const fallbackResponse = buildMockResponse(
    page,
    perPage,
    search,
    categoryIds,
    categories,
    baseUrl,
  );

  return NextResponse.json<ExtracurricularListResponse>(fallbackResponse, {
    status: 200,
  });
}

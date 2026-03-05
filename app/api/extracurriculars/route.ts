import { NextRequest, NextResponse } from "next/server";
import { MOCK_EXTRACURRICULARS } from "./mockData";

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

interface ExtracurricularListItem {
  name: string;
  thumbnail: string;
  category: string[];
}

interface ExtracurricularListResponse {
  meta: PaginationMeta;
  items: ExtracurricularListItem[];
}

interface BackendMetaShape {
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
}

interface BackendExtracurricularListItem {
  name?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  category?: string[] | string;
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

const normalizeListItem = (
  item: BackendExtracurricularListItem,
): ExtracurricularListItem => ({
  name: item.name || "Tanpa Nama",
  thumbnail:
    item.thumbnail || item.thumbnailUrl || "https://placehold.co/1200x800/png",
  category: toCategoryArray(item.category || item.categories),
});

const filterListItems = (
  items: ExtracurricularListItem[],
  search: string,
  categories: string[],
) => {
  const normalizedSearch = search.toLowerCase();
  const normalizedCategories = categories.map((item) => item.toLowerCase());

  return items.filter((item) => {
    const matchSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.category.some((category) =>
        category.toLowerCase().includes(normalizedSearch),
      );

    const matchCategory =
      normalizedCategories.length === 0 ||
      item.category.some((category) =>
        normalizedCategories.includes(category.toLowerCase()),
      );

    return matchSearch && matchCategory;
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
    items: items.slice(startIndex, endIndex),
  };
};

const buildMockResponse = (
  page: number,
  perPage: number,
  search: string,
  categories: string[],
  baseUrl: string,
): ExtracurricularListResponse => {
  const mappedItems: ExtracurricularListItem[] = MOCK_EXTRACURRICULARS.map(
    (item) => ({
      name: item.name,
      thumbnail: item.thumbnailUrl,
      category: item.categories,
    }),
  );

  const filteredItems = filterListItems(mappedItems, search, categories);
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
    items: paginated.items,
  };
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
              items: normalizedItems,
            },
            { status: 200 },
          );
        }

        const filteredItems = filterListItems(normalizedItems, search, categories);
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
            items: paginated.items,
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
    categories,
    baseUrl,
  );

  return NextResponse.json<ExtracurricularListResponse>(fallbackResponse, {
    status: 200,
  });
}

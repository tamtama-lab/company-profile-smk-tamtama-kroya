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

interface MajorListItem {
  name: string;
  slug: string;
  summary: string;
  abbreviation: string;
  photoUrl: string;
}

interface MajorsListResponse {
  meta: PaginationMeta;
  items: MajorListItem[];
}

const DEFAULT_MAJORS: MajorListItem[] = [
  {
    name: "Teknik Kendaraan Ringan",
    slug: "teknik-kendaraan-ringan",
    summary: "Mempelajari tentang perawatan dan perbaikan kendaraan ringan.",
    abbreviation: "TKR",
    photoUrl: "/spmb/TKR.jpg",
  },
  {
    name: "Teknik Instalasi Tenaga Listrik",
    slug: "teknik-instalasi-tenaga-listrik",
    summary:
      "Mempelajari tentang instalasi dan pemeliharaan sistem tenaga listrik.",
    abbreviation: "TITL",
    photoUrl: "/spmb/TITL.jpg",
  },
  {
    name: "Teknik Pemesinan",
    slug: "teknik-pemesinan",
    summary: "Mempelajari tentang proses pembuatan benda kerja menggunakan mesin.",
    abbreviation: "TP",
    photoUrl: "/spmb/TP.jpg",
  },
  {
    name: "Desain Komunikasi Visual",
    slug: "desain-komunikasi-visual",
    summary: "Mempelajari tentang desain grafis dan komunikasi visual.",
    abbreviation: "DKV",
    photoUrl: "/spmb/DKV.jpg",
  },
];

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const buildPaginatedResponse = (
  rawItems: MajorListItem[],
  page: number,
  perPage: number,
  baseUrl: string,
): MajorsListResponse => {
  const total = rawItems.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = rawItems.slice(startIndex, endIndex);

  return {
    meta: {
      total,
      perPage,
      currentPage,
      lastPage,
      firstPage: 1,
      firstPageUrl: `${baseUrl}?page=1`,
      lastPageUrl: `${baseUrl}?page=${lastPage}`,
      nextPageUrl:
        currentPage < lastPage ? `${baseUrl}?page=${currentPage + 1}` : null,
      previousPageUrl:
        currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
    },
    items: paginatedData,
  };
};

const buildDefaultMajorsResponse = (
  page: number,
  perPage: number,
  search: string,
  baseUrl: string,
): MajorsListResponse => {
  const keyword = search.trim().toLowerCase();

  const filteredItems = keyword
    ? DEFAULT_MAJORS.filter((item) => {
        const name = item.name.toLowerCase();
        const abbreviation = item.abbreviation.toLowerCase();
        return name.includes(keyword) || abbreviation.includes(keyword);
      })
    : DEFAULT_MAJORS;

  return buildPaginatedResponse(filteredItems, page, perPage, baseUrl);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const perPage = parsePositiveInt(
      searchParams.get("perPage") || searchParams.get("limit"),
      10
    );
    const search = searchParams.get("search") || "";
    const baseUrl = request.nextUrl.pathname;

    const backendParams = new URLSearchParams();
    backendParams.set("page", String(page));
    backendParams.set("perPage", String(perPage));

    if (search) {
      backendParams.set("search", search);
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/majors${backendParams.toString() ? `?${backendParams.toString()}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!backendResponse.ok) {
      console.error("Majors backend not OK, using defaults", {
        status: backendResponse.status,
      });
      return NextResponse.json(
        buildDefaultMajorsResponse(page, perPage, search, baseUrl),
        { status: 200 }
      );
    }

    const backendData = await backendResponse.json();

    // Handle paginated response with meta
    if (backendData?.meta && Array.isArray(backendData?.data)) {
      const baseUrl = request.nextUrl.pathname;
      const backendTotal = Number(backendData.meta?.total ?? 0);
      const backendPerPage = Number(backendData.meta?.perPage ?? perPage);
      const backendCurrentPage = Number(backendData.meta?.currentPage ?? page);
      const backendLastPage =
        Number(backendData.meta?.lastPage) ||
        Math.max(1, Math.ceil(backendTotal / Math.max(1, backendPerPage)));

      const response: MajorsListResponse = {
        meta: {
          total: backendTotal,
          perPage: backendPerPage,
          currentPage: backendCurrentPage,
          lastPage: backendLastPage,
          firstPage: 1,
          firstPageUrl: `${baseUrl}?page=1`,
          lastPageUrl: `${baseUrl}?page=${backendLastPage}`,
          nextPageUrl:
            backendCurrentPage < backendLastPage
              ? `${baseUrl}?page=${backendCurrentPage + 1}`
              : null,
          previousPageUrl:
            backendCurrentPage > 1
              ? `${baseUrl}?page=${backendCurrentPage - 1}`
              : null,
        },
        items: backendData.data,
      };

      return NextResponse.json(response);
    }

    // Handle non-paginated array response
    const rawData: MajorListItem[] = Array.isArray(backendData)
      ? backendData
      : backendData?.data || [];

    return NextResponse.json(
      buildPaginatedResponse(rawData, page, perPage, baseUrl),
    );
  } catch (error) {
    console.error("Error fetching majors:", error);
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const perPage = parsePositiveInt(
      searchParams.get("perPage") || searchParams.get("limit"),
      10
    );
    const search = searchParams.get("search") || "";
    const baseUrl = request.nextUrl.pathname;

    return NextResponse.json(
      buildDefaultMajorsResponse(page, perPage, search, baseUrl),
      { status: 200 }
    );
  }
}

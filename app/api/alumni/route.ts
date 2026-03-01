import { NextRequest, NextResponse } from "next/server";
const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

interface AlumniItem {
  id: number;
  name: string;
  generationYear: number;
  photoUrl: string;
  major: string;
  currentJob: string;
}

interface AlumniResponse {
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
  data: AlumniItem[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "9");

    const backendResponse = await fetch(
      `${API_BASE_URL}/alumni?page=${page}&limit=${perPage}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch alumni data" },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    if (backendData?.meta && Array.isArray(backendData?.data)) {
      return NextResponse.json(backendData);
    }

    const rawData: AlumniItem[] = Array.isArray(backendData)
      ? backendData
      : backendData?.data || [];

    // Pagination logic
    const total = rawData.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(1, page), lastPage);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = rawData.slice(startIndex, endIndex);

    const baseUrl = request.nextUrl.pathname;

    const response: AlumniResponse = {  
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
      data: paginatedData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { error: "Failed to fetch alumni data" },
      { status: 500 }
    );
  }
}

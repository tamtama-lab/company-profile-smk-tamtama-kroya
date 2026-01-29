import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "E_UNAUTHORIZED_ACCESS",
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Get query parameters (for pagination, search, and limit)
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit") || "10";

    // Build query string for backend
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      queryParams.append("search", search);
    }

    // Forward request to backend
    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/students?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Students fetch error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}

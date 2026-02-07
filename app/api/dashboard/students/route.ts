import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit") || "10";
    const authored = searchParams.get("authored") || "";
    const batch_id = searchParams.get("batch_id") || "";
    const academic_year_id = searchParams.get("academic_year_id") || "";

    const queryParams = new URLSearchParams({ page, limit });
    if (search) {
      queryParams.append("search", search);
    }
    
    if (authored !== "") {
      queryParams.append("authored", authored);
    }

    if (batch_id !== "") {
      queryParams.append("batch_id", batch_id);
    }

    if (academic_year_id !== "") {
      queryParams.append("academic_year_id", academic_year_id);
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/registrations?${queryParams.toString()}`,
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
    return NextResponse.json(data, { status: backendResponse.status });
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

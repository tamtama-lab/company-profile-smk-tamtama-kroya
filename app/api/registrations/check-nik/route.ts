import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || process.env.API_BASE_URL;


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("nik")?.trim() || "";

  if (query.length < 3) {
    return NextResponse.json(
      {
        error: "E_VALIDATION_ERROR",
        message: "The nik field must have at least 3 characters",
        errors: [
          {
            field: "nik",
            message: "The nik field must have at least 3 characters",
            rule: "minLength",
          },
        ],
      },
      { status: 422 }
    );
  }

  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        error: "SERVER_CONFIG_ERROR",
        message: "Server configuration error (BACKEND_URL not set)",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/registrations/check-nik?nik=${encodeURIComponent(query)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
    const data = await response.json();

    // Forward backend response directly (expecting { valid: boolean })
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Check NIK error:", error);
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Terjadi kesalahan saat memeriksa NIK",
      },
      { status: 500 }
    );
  }
}
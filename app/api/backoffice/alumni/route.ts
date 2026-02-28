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
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("perPage") || searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const major = searchParams.get("major") || "";
    const generationYear = searchParams.get("generationYear") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const queryParams = new URLSearchParams({
      page,
      limit: perPage,
      perPage,
      sortBy,
      sortOrder,
    });

    if (search) {
      queryParams.append("search", search);
    }
    if (major) {
      queryParams.append("major", major);
    }
    if (generationYear) {
      queryParams.append("generationYear", generationYear);
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/alumni?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    const data = await backendResponse.json();

    if (data?.meta && typeof data.meta === "object") {
      data.meta.perPage = Number(data.meta.perPage ?? data.meta.limit ?? perPage);
    }
    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Backoffice alumni fetch error:", error);
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
      return NextResponse.json(
        {
          error: "E_UNAUTHORIZED_ACCESS",
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (
      !body.name ||
      !body.major ||
      typeof body.generationYear !== "number" ||
      !body.currentJob
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, major, generationYear, currentJob",
        },
        { status: 400 },
      );
    }

    const backendRes = await fetch(`${API_BASE_URL}/backoffice/alumni`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        name: body.name,
        major: body.major,
        generationYear: body.generationYear,
        photoUrl: body.photoUrl || null,
        currentJob: body.currentJob,
        isPublished: Boolean(body.isPublished),
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create alumni:", error);
    return NextResponse.json({ error: "Failed to create alumni" }, { status: 500 });
  }
}

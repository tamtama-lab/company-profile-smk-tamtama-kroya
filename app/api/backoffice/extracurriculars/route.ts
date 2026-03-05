import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

const unauthorizedResponse = () =>
  NextResponse.json(
    {
      error: "E_UNAUTHORIZED_ACCESS",
      message: "Not authenticated",
    },
    { status: 401 },
  );

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const perPage = parsePositiveInt(
      searchParams.get("perPage") || searchParams.get("limit"),
      9,
    );
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const sortBy = (searchParams.get("sortBy") || "createdAt").trim();
    const sortOrder = (searchParams.get("sortOrder") || "desc").trim();

    const queryParams = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      limit: String(perPage),
      sortBy,
      sortOrder,
    });

    if (search) {
      queryParams.set("search", search);
    }

    if (category) {
      queryParams.set("category", category);
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars?${queryParams.toString()}`,
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
    console.error("Backoffice extracurriculars fetch error:", error);
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
      return unauthorizedResponse();
    }

    const body = await request.json();
    const categories = Array.isArray(body.categories)
      ? body.categories
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];
    const galleries = Array.isArray(body.galleries)
      ? body.galleries
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];
    const achievements = Array.isArray(body.achievements)
      ? body.achievements
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];

    if (!body.name || categories.length === 0 || !body.description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, categories, description",
        },
        { status: 400 },
      );
    }

    const payload = {
      name: String(body.name).trim(),
      thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl).trim() : "",
      categories,
      mentorName: body.mentorName ? String(body.mentorName).trim() : "",
      description: String(body.description).trim(),
      schedule: body.schedule ? String(body.schedule).trim() : "",
      location: body.location ? String(body.location).trim() : "",
      isPublished:
        typeof body.isPublished === "boolean" ? body.isPublished : true,
      galleries,
      achievements,
    };

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create extracurricular:", error);
    return NextResponse.json(
      { error: "Failed to create extracurricular" },
      { status: 500 },
    );
  }
}

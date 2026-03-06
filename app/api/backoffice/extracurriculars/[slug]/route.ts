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

const getSlugParam = async (params: Promise<{ slug: string }>) => {
  const { slug } = await params;
  return decodeURIComponent(slug || "").trim();
};

const parseCategoryId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const toCategoryName = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const firstCategory = value.find((item) => typeof item === "string");
    return typeof firstCategory === "string" ? firstCategory.trim() : "";
  }

  return "";
};

const normalizeDetailCategory = (value: unknown, categoryId: unknown) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const root = value as Record<string, unknown>;
    const categoryName =
      typeof root.name === "string" ? root.name.trim() : "";

    if (categoryName) {
      return {
        ...root,
        id: parseCategoryId(root.id) ?? parseCategoryId(categoryId) ?? 0,
        name: categoryName,
      };
    }
  }

  const categoryName = toCategoryName(value);

  if (!categoryName) {
    return null;
  }

  return {
    id: parseCategoryId(categoryId) ?? 0,
    name: categoryName,
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const slug = await getSlugParam(params);

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid extracurricular slug" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const rawDetail =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    if (!rawDetail || typeof rawDetail !== "object") {
      return NextResponse.json(rawDetail, { status: 200 });
    }

    const detail = rawDetail as Record<string, unknown>;
    const normalizedDetail = {
      ...detail,
      category: normalizeDetailCategory(
        detail.category ?? detail.categories,
        detail.categoryId,
      ),
      categoryId:
        parseCategoryId(detail.categoryId) ??
        parseCategoryId(
          (detail.category as Record<string, unknown> | undefined)?.id,
        ),
      galleries: Array.isArray(detail.galleries) ? detail.galleries : [],
      achievements: Array.isArray(detail.achievements)
        ? detail.achievements
        : [],
    };

    delete (normalizedDetail as { categories?: unknown }).categories;

    return NextResponse.json(normalizedDetail, { status: 200 });
  } catch (error) {
    console.error("Error fetching extracurricular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const slug = await getSlugParam(params);

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid extracurricular slug" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const categoryId = parseCategoryId(
      body.categoryId ??
        (body.category && typeof body.category === "object"
          ? (body.category as Record<string, unknown>).id
          : null),
    );
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

    if (!body.name || !categoryId || !body.description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, categoryId, description",
        },
        { status: 400 },
      );
    }

    const payload = {
      name: body.name ? String(body.name).trim() : "",
      thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl).trim() : "",
      categoryId,
      mentorName: body.mentorName ? String(body.mentorName).trim() : "",
      description: body.description ? String(body.description).trim() : "",
      schedule: body.schedule ? String(body.schedule).trim() : "",
      location: body.location ? String(body.location).trim() : "",
      isPublished:
        typeof body.isPublished === "boolean" ? body.isPublished : true,
      galleries,
      achievements,
    };

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
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

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating extracurricular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const slug = await getSlugParam(params);

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid extracurricular slug" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars/${encodeURIComponent(slug)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    if (!backendResponse.ok) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(
      { message: "Extracurricular deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting extracurricular:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

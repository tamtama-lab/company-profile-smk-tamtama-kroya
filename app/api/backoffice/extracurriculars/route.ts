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

const normalizeListCategory = (value: unknown, categoryId: unknown) => {
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
      6,
    );
    const search = (searchParams.get("search") || "").trim();
    const categoryId = (searchParams.get("categoryId") || "").trim();
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

    if (categoryId) {
      queryParams.set("categoryId", categoryId);
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

    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const root =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const rawItems = Array.isArray(root.items)
      ? root.items
      : Array.isArray(root.data)
        ? root.data
        : [];
    const normalizedItems = rawItems.map((item) => {
      if (!item || typeof item !== "object") {
        return item;
      }

      const row = item as Record<string, unknown>;
      const normalized = {
        ...row,
        category: normalizeListCategory(
          row.category ?? row.categories,
          row.categoryId,
        ),
        categoryId:
          parseCategoryId(row.categoryId) ??
          parseCategoryId(
            (row.category as Record<string, unknown> | undefined)?.id,
          ),
        galleries: Array.isArray(row.galleries) ? row.galleries : [],
        achievements: Array.isArray(row.achievements) ? row.achievements : [],
      };

      delete (normalized as { categories?: unknown }).categories;

      return normalized;
    });
    const rawMeta =
      root.meta && typeof root.meta === "object"
        ? (root.meta as Record<string, unknown>)
        : null;

    const normalizedMeta = rawMeta
      ? {
          ...rawMeta,
          perPage: Number(rawMeta.perPage ?? rawMeta.limit ?? perPage),
        }
      : {
          total: normalizedItems.length,
          perPage,
          currentPage: page,
          lastPage: 1,
          firstPage: 1,
          firstPageUrl: `${request.nextUrl.pathname}?page=1`,
          lastPageUrl: `${request.nextUrl.pathname}?page=1`,
          nextPageUrl: null,
          previousPageUrl: null,
        };

    return NextResponse.json(
      {
        meta: normalizedMeta,
        items: normalizedItems,
      },
      { status: backendResponse.status },
    );
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
      name: String(body.name).trim(),
      thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl).trim() : "",
      categoryId,
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

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

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }

  return false;
};

const toCategoryObject = (value: unknown, fallbackCategoryId: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const categoryName = toStringValue(root.name);

  if (!categoryName) {
    return null;
  }

  return {
    id: parseCategoryId(root.id) ?? parseCategoryId(fallbackCategoryId) ?? 0,
    name: categoryName,
    createdAt: toStringValue(root.createdAt),
    updatedAt: toStringValue(root.updatedAt),
  };
};

const normalizeGallery = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const root = item as Record<string, unknown>;
      const photoUrl = toStringValue(root.photoUrl);

      if (!photoUrl) {
        return null;
      }

      return {
        id: Number(root.id || index + 1),
        photoUrl,
        order: Number(root.order ?? index),
        createdAt: toStringValue(root.createdAt),
        updatedAt: toStringValue(root.updatedAt),
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: number;
        photoUrl: string;
        order: number;
        createdAt: string;
        updatedAt: string;
      } => Boolean(item),
    );
};

const normalizeItem = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const normalizedTitle = toStringValue(root.title) || "Tanpa Judul";
  const category = toCategoryObject(root.category, root.categoryId);
  const categoryId = parseCategoryId(root.categoryId) ?? parseCategoryId(category?.id);

  return {
    id: Number(root.id || 0),
    title: normalizedTitle,
    summary: toStringValue(root.summary),
    slug: toStringValue(root.slug) || toSlug(normalizedTitle),
    description: toStringValue(root.description),
    coverPhotoUrl:
      toStringValue(root.coverPhotoUrl) || "https://placehold.co/1200x800/png",
    galleryDescription: toStringValue(root.galleryDescription),
    isPublished: normalizeBoolean(root.isPublished),
    categoryId: categoryId ?? null,
    category:
      category && categoryId
        ? {
            ...category,
            id: categoryId,
          }
        : category,
    galleries: normalizeGallery(root.galleries),
    createdAt: toStringValue(root.createdAt),
    updatedAt: toStringValue(root.updatedAt),
    deletedAt:
      typeof root.deletedAt === "string" && root.deletedAt
        ? root.deletedAt
        : null,
  };
};

const getSafePayload = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const buildBasePayload = (body: Record<string, unknown>) => {
  const categoryId = parseCategoryId(
    body.categoryId ??
      (body.category && typeof body.category === "object"
        ? (body.category as Record<string, unknown>).id
        : null),
  );

  return {
    title: toStringValue(body.title),
    slug: toStringValue(body.slug),
    summary: toStringValue(body.summary),
    description: toStringValue(body.description),
    categoryId,
    coverPhotoUrl: toStringValue(body.coverPhotoUrl),
    galleryDescription: toStringValue(body.galleryDescription),
    isPublished:
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : normalizeBoolean(body.isPublished),
    galleries: toStringArray(body.galleries),
  };
};

const hasMissingRequiredFields = (payload: ReturnType<typeof buildBasePayload>) => {
  const requiredTextFields: Array<keyof ReturnType<typeof buildBasePayload>> = [
    "title",
    "summary",
    "description",
  ];

  if (!payload.categoryId) {
    return true;
  }

  return requiredTextFields.some((field) => !payload[field]);
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
        { message: "Invalid school facility slug" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-facilities/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    const payload = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(payload, { status: backendResponse.status });
    }

    const detail =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    const normalizedDetail = normalizeItem(detail);

    if (!normalizedDetail) {
      return NextResponse.json(detail, { status: 200 });
    }

    return NextResponse.json(normalizedDetail, { status: 200 });
  } catch (error) {
    console.error("Error fetching school facility:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
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
        { message: "Invalid school facility slug" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const payload = buildBasePayload(body);

    if (hasMissingRequiredFields(payload)) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, summary, description, categoryId",
        },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-facilities/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating school facility:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
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
        { message: "Invalid school facility slug" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-facilities/${encodeURIComponent(slug)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    const data = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(
      { message: "School facility deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting school facility:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

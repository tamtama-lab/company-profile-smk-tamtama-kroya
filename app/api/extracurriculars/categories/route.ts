import { NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

const MOCK_CATEGORIES = [
  "Kepemimpinan & Organisasi",
  "Kejuruan & Teknologi",
  "Olahraga",
  "Seni & Budaya",
];

const normalizeCategories = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getCategoriesFromPayload = (payload: unknown): string[] => {
  const direct = normalizeCategories(payload);
  if (direct.length > 0) {
    return direct;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;

  const fromData = normalizeCategories(root.data);
  if (fromData.length > 0) {
    return fromData;
  }

  const fromItems = normalizeCategories(root.items);
  if (fromItems.length > 0) {
    return fromItems;
  }

  return [];
};

export async function GET() {
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/extracurricular/categories`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (backendResponse.ok) {
      const payload = await backendResponse.json();
      const categories = getCategoriesFromPayload(payload);

      if (categories.length > 0) {
        return NextResponse.json(categories, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Failed to fetch extracurricular categories:", error);
  }

  return NextResponse.json(MOCK_CATEGORIES, { status: 200 });
}

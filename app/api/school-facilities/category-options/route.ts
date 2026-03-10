import { NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

interface CategoryOption {
  id: number;
  name: string;
}

const MOCK_CATEGORIES: CategoryOption[] = [
  { id: 2, name: "Laboratorium" },
  { id: 3, name: "Olahraga" },
  { id: 4, name: "Umum" },
  { id: 1, name: "Workshop" },
];

const normalizeCategories = (value: unknown): CategoryOption[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenById = new Set<number>();
  const seenByName = new Set<string>();

  return value
    .map((item, index) => {
      if (typeof item === "string") {
        const name = item.trim();

        if (!name) {
          return null;
        }

        return {
          id: index + 1,
          name,
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const root = item as Record<string, unknown>;
      const name = typeof root.name === "string" ? root.name.trim() : "";
      const parsedId = Number(root.id);

      if (!name) {
        return null;
      }

      return {
        id:
          Number.isFinite(parsedId) && parsedId > 0
            ? Math.floor(parsedId)
            : index + 1,
        name,
      };
    })
    .filter((item): item is CategoryOption => Boolean(item))
    .filter((item) => {
      const normalizedName = item.name.toLowerCase();

      if (seenById.has(item.id) || seenByName.has(normalizedName)) {
        return false;
      }

      seenById.add(item.id);
      seenByName.add(normalizedName);

      return true;
    });
};

const getCategoriesFromPayload = (payload: unknown): CategoryOption[] => {
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

  const fromCategories = normalizeCategories(root.categories);

  if (fromCategories.length > 0) {
    return fromCategories;
  }

  return [];
};

export async function GET() {
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/school-facilities/category-options`,
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
        return NextResponse.json(
          categories.sort((a, b) => a.name.localeCompare(b.name)),
          { status: 200 },
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch school facility categories:", error);
  }

  return NextResponse.json(MOCK_CATEGORIES, { status: 200 });
}

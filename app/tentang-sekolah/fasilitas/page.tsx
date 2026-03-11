"use client";

import Breadcrumb from "@/components/Breadcrumb";
import { TextButton } from "@/components/Buttons/TextButton";
import Search from "@/components/Filter/Search";
import GridListPaginate from "@/components/GridListPaginate";
import SelectInput from "@/components/InputForm/SelectInput";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { toSlug } from "@/utils/resolveSlug";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RiFilterOffFill } from "react-icons/ri";
import {
  SchoolFacilityCategoryOption,
  SchoolFacilityListItem,
  SchoolFacilityListResponse,
} from "./types";

const ITEMS_PER_PAGE = 6;
const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const CATEGORY_OPTIONS_ENDPOINT = "/api/school-facilities/category-options";

const getArrayFromPayload = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;

  if (Array.isArray(root.data)) {
    return root.data;
  }

  if (Array.isArray(root.items)) {
    return root.items;
  }

  return [];
};

const toCategoryOptionArray = (
  payload: unknown,
): SchoolFacilityCategoryOption[] => {
  const rawItems = getArrayFromPayload(payload);

  return rawItems
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
        id: Number.isFinite(parsedId) && parsedId > 0 ? parsedId : index + 1,
        name,
      };
    })
    .filter((item): item is SchoolFacilityCategoryOption => Boolean(item));
};

const resolveCategoryBadgeVariant = (
  category: SchoolFacilityListItem["category"],
): BadgeVariant => {
  if (!category) {
    return "gray";
  }

  if (category.id === 1) {
    return "yellow";
  }

  if (category.id === 2) {
    return "blue";
  }

  if (category.id === 3) {
    return "green";
  }

  if (category.id === 4) {
    return "purple";
  }

  const normalizedName = category.name.trim().toLowerCase();

  if (normalizedName.includes("workshop")) {
    return "yellow";
  }

  if (normalizedName.includes("laborat")) {
    return "blue";
  }

  if (normalizedName.includes("olahraga")) {
    return "green";
  }

  if (normalizedName.includes("umum")) {
    return "purple";
  }

  return "gray";
};

export default function SchoolFacilityPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<SchoolFacilityListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([CATEGORY_FILTER_DEFAULT]);

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    perPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch(CATEGORY_OPTIONS_ENDPOINT, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat kategori fasilitas");
        }

        const payload = (await response.json()) as unknown;
        const categories = toCategoryOptionArray(payload);

        if (cancelled) {
          return;
        }

        const seenCategoryIds = new Set<number>();

        setCategoryOptions([
          CATEGORY_FILTER_DEFAULT,
          ...categories
            .filter((category) => {
              if (seenCategoryIds.has(category.id)) {
                return false;
              }

              seenCategoryIds.add(category.id);
              return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => ({
              value: String(category.id),
              label: category.name,
            })),
        ]);
      } catch (error) {
        console.error("Failed fetch school facility categories", error);

        if (!cancelled) {
          setCategoryOptions([CATEGORY_FILTER_DEFAULT]);
        }
      }
    };

    fetchCategoryOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchFacilities = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setFetchError(null);

        const params = new URLSearchParams({
          page: String(page),
          perPage: String(ITEMS_PER_PAGE),
          isPublished: "true",
        });

        if (debouncedSearchTerm) {
          params.append("search", debouncedSearchTerm);
        }

        if (selectedCategoryId) {
          params.append("categoryId", selectedCategoryId);
        }

        const response = await fetch(
          `/api/school-facilities?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch school facilities");
        }

        const result: SchoolFacilityListResponse = await response.json();
        const items = (result.data || []).slice(0, ITEMS_PER_PAGE);

        setFacilities(items);
        setPagination({
          total: result.meta?.total || 0,
          currentPage: result.meta?.currentPage || page,
          perPage: ITEMS_PER_PAGE,
        });
      } catch (error) {
        console.error("Failed fetch school facilities", error);
        setFacilities([]);
        setPagination((prev) => ({ ...prev, total: 0, currentPage: page }));
        setFetchError("Gagal memuat fasilitas sekolah.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchTerm, selectedCategoryId],
  );

  useEffect(() => {
    fetchFacilities(1);
  }, [fetchFacilities]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(event.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategoryId("");
  };

  const filterValue = searchTerm || selectedCategoryId;

  const paginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: ITEMS_PER_PAGE,
      total: pagination.total,
      onChange: (page: number) => {
        fetchFacilities(page);
      },
      onShowSizeChange: (page: number) => {
        fetchFacilities(page);
      },
    }),
    [fetchFacilities, pagination.currentPage, pagination.total],
  );

  const renderItem = (
    item: SchoolFacilityListItem,
    _: number,
    mode: "grid" | "list",
  ) => {
    const slug = item.slug?.trim() || toSlug(item.title);
    const categoryName = item.category?.name?.trim() || "";
    const summaryText =
      item.summary?.trim() ||
      item.description?.trim() ||
      "Informasi fasilitas akan diperbarui segera.";

    if (mode === "list") {
      return (
        <article className="w-full rounded-lg border border-gray-200 bg-white p-3 transition duration-300 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-48 sm:shrink-0">
              <Image
                src={item.coverPhotoUrl || "https://placehold.co/1200x800/png"}
                alt={item.title}
                width={1200}
                height={800}
                loading="lazy"
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mt-3 flex flex-col gap-2">
                <h2 className="line-clamp-2 text-xl font-semibold text-primary">
                  {item.title}
                </h2>
                {categoryName ? (
                  <Badge
                    variant={resolveCategoryBadgeVariant(item.category)}
                    className="w-fit px-3 py-1 text-[10px]! font-semibold tracking-[0.14em] uppercase"
                  >
                    {categoryName}
                  </Badge>
                ) : (
                  <Badge
                    variant="gray"
                    className="w-fit px-3 py-1 text-[10px]! font-semibold tracking-[0.14em] uppercase"
                  >
                    Tanpa Kategori
                  </Badge>
                )}
                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {summaryText}
                </p>
              </div>
            </div>

            <div className="sm:ml-auto sm:shrink-0">
              <TextButton
                variant="gray"
                text="Lihat Detail"
                className="w-fit rounded-full! text-sm!"
                onClick={() =>
                  router.push(`/tentang-sekolah/fasilitas/${slug}`)
                }
              />
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-64 overflow-hidden bg-gray-100 sm:h-72">
          <Image
            src={item.coverPhotoUrl || "https://placehold.co/1200x800/png"}
            alt={item.title}
            width={1200}
            height={800}
            loading="lazy"
            unoptimized
            className="h-full w-full object-cover transition duration-500"
          />
        </div>

        <div className="flex min-h-64 flex-col gap-4 p-5 sm:min-h-72">
          <div className="flex flex-col gap-3">
            <h2 className="line-clamp-2 text-xl font-semibold text-primary">
              {item.title}
            </h2>
            <div className="flex min-h-7 flex-wrap gap-2">
              {categoryName ? (
                <Badge
                  variant={resolveCategoryBadgeVariant(item.category)}
                  className="px-3 py-1 text-xs! font-semibold tracking-[0.14em] uppercase"
                >
                  {categoryName}
                </Badge>
              ) : (
                <Badge
                  variant="gray"
                  className="px-3 py-1 text-xs! font-semibold tracking-[0.14em] uppercase"
                >
                  Tanpa Kategori
                </Badge>
              )}
            </div>
            <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">
              {summaryText}
            </p>
          </div>

          <div className="mt-auto flex justify-end">
            <TextButton
              variant="gray"
              text="Lihat Detail"
              className="w-fit rounded-full! text-sm!"
              onClick={() => router.push(`/tentang-sekolah/fasilitas/${slug}`)}
            />
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto mt-20 flex w-full max-w-7xl flex-col items-center justify-center gap-6 pb-4 max-sm:mt-20 max-sm:px-4">
        <Breadcrumb
          className="w-full justify-start"
          items={[{ label: "Tentang Sekolah" }, { label: "Fasilitas" }]}
        />

        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold text-primary max-sm:text-2xl">
            FASILITAS <br /> SMK TAMTAMA KROYA
          </h1>
          <p className="text-lg text-gray-600 max-sm:text-sm">
            Jelajahi laboratorium, workshop, area olahraga, dan fasilitas umum
            yang mendukung proses belajar di SMK Tamtama Kroya.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 px-0 md:flex-row md:flex-nowrap md:items-end md:justify-end">
          <SelectInput
            className="w-full!"
            options={categoryOptions}
            value={selectedCategoryId}
            onChange={handleCategoryChange}
          />
          {filterValue ? (
            <TextButton
              variant="outline"
              className="w-full sm:w-fit! sm:mb-2"
              onClick={handleResetFilters}
              icon={<RiFilterOffFill className="shrink-0 text-xl" />}
            />
          ) : null}
          <Search
            placeholder="Cari fasilitas sekolah"
            className="mb-2 w-full sm:max-w-68 md:max-w-72"
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
        </div>

        {fetchError ? (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        ) : null}

        <GridListPaginate
          data={facilities}
          showSizeChanger={false}
          showNumberInfo={false}
          renderItem={renderItem}
          viewMode="list"
          loading={loading}
          emptyText="Data fasilitas sekolah belum tersedia"
          pagination={paginationConfig}
        />
      </div>
    </main>
  );
}

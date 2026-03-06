"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import Search from "@/components/Filter/Search";
import GridListPaginate from "@/components/GridListPaginate";
import SelectInput from "@/components/InputForm/SelectInput";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RiFilterOffFill } from "react-icons/ri";
import {
  ExtracurricularCategoryOption,
  ExtracurricularListItem,
  ExtracurricularListResponse,
} from "./type";
import { toSlug } from "@/utils/resolveSlug";

const ITEMS_PER_PAGE = 6;
const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const CATEGORY_OPTIONS_ENDPOINT = "/api/extracurriculars/categories";

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
): ExtracurricularCategoryOption[] => {
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
    .filter((item): item is ExtracurricularCategoryOption => Boolean(item));
};

export default function ExtracurricularPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extracurriculars, setExtracurriculars] = useState<
    ExtracurricularListItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
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
          throw new Error("Gagal memuat kategori ekstrakurikuler");
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
        console.error("Failed fetch extracurricular categories", error);

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

  const fetchExtracurriculars = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(ITEMS_PER_PAGE),
        });

        if (debouncedSearchTerm) {
          params.append("search", debouncedSearchTerm);
        }
        if (selectedCategoryId) {
          params.append("categoryId", selectedCategoryId);
        }

        const response = await fetch(
          `/api/extracurriculars?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch extracurricular data");
        }

        const result: ExtracurricularListResponse = await response.json();
        const items = (result.data || []).slice(0, ITEMS_PER_PAGE);

        setExtracurriculars(items);
        setPagination({
          total: result.meta?.total || 0,
          currentPage: result.meta?.currentPage || page,
          perPage: ITEMS_PER_PAGE,
        });
      } catch (error) {
        console.error("Failed fetch extracurriculars", error);
        setExtracurriculars([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchTerm, selectedCategoryId],
  );

  useEffect(() => {
    fetchExtracurriculars(1);
  }, [fetchExtracurriculars]);

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
        fetchExtracurriculars(page);
      },
      onShowSizeChange: (page: number) => {
        fetchExtracurriculars(page);
      },
    }),
    [pagination, fetchExtracurriculars],
  );

  const renderItem = (item: ExtracurricularListItem, _: number) => {
    const slug = item.slug || toSlug(item.name);
    const categoryName = item.category?.name?.trim() || "";

    return (
      <div className="rounded-lg flex flex-col border border-gray-300 bg-white overflow-hidden">
        <Image
          src={item.thumbnailUrl || "https://placehold.co/1200x800/png"}
          alt={item.name}
          width={1200}
          height={800}
          loading="lazy"
          unoptimized
          className="w-full h-58 aspect-1.5/1 bg-gray-300 object-cover"
        />

        <div className="w-full flex flex-col px-3 py-2 gap-4">
          <p className="text-base text-left font-semibold text-gray-800">
            {item.name}
          </p>
          <div className="flex flex-wrap gap-1 min-h-6">
            {categoryName ? (
              <span className="rounded-full bg-teal-500/10 w-fit px-2 py-1 text-xs text-primary">
                {categoryName}
              </span>
            ) : (
              <span className="text-xs text-gray-500">-</span>
            )}
          </div>
          <TextButton
            variant="gray"
            text="Lihat Detail"
            className="w-fit rounded-full! text-sm!"
            onClick={() =>
              router.push(`/tentang-sekolah/ekstrakulikuler/${slug}`)
            }
          />
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 mt-20 sm:pb-4 max-sm:mt-20 max-sm:px-8 justify-center items-center">
        <div className="w-full flex flex-wrap items-center justify-center max-w-2xl gap-4">
          <h1 className="text-4xl max-sm:text-2xl font-bold text-primary text-center">
            Ekstrakurikuler di SMK Tamtama Kroya
          </h1>
          <p className="text-center text-lg max-sm:text-sm text-gray-600">
            Berbagai kegiatan ekstrakurikuler tersedia untuk mengembangkan
            minat, bakat, dan karakter siswa.
          </p>
        </div>
        <div className="flex flex-col justify-end w-full flex-wrap md:flex-nowrap gap-3 md:flex-row md:items-end px-0">
          <SelectInput
            className="w-full!"
            options={categoryOptions}
            value={selectedCategoryId}
            onChange={handleCategoryChange}
          />
          {filterValue && (
            <TextButton
              variant="outline"
              className="w-full sm:w-fit! sm:mb-2"
              onClick={handleResetFilters}
              icon={<RiFilterOffFill className="text-xl shrink-0" />}
            />
          )}
          <Search
            placeholder="Cari nama ekstrakurikuler"
            className="w-full md:max-w-72 sm:max-w-68 mb-2"
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
        </div>
        <GridListPaginate
          data={extracurriculars}
          showSizeChanger={false}
          showNumberInfo={false}
          renderItem={renderItem}
          viewMode="grid"
          loading={loading}
          emptyText="Data ekstrakurikuler belum tersedia"
          pagination={paginationConfig}
        />
      </div>
    </main>
  );
}

"use client";

import { toSlug } from "@/utils/resolveSlug";
import Breadcrumb from "@/components/Breadcrumb";
import { TextButton } from "@/components/Buttons/TextButton";
import Search from "@/components/Filter/Search";
import GridListPaginate from "@/components/GridListPaginate";
import SelectInput from "@/components/InputForm/SelectInput";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RiFilterOffFill } from "react-icons/ri";
import {
  SchoolAchievementCategoryOption,
  SchoolAchievementListItem,
  SchoolAchievementListResponse,
} from "./types";

const ITEMS_PER_PAGE = 5;
const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const CATEGORY_OPTIONS_ENDPOINT = "/api/school-achievements/category-options";
const DESCRIPTION_TOOLTIP_CHARACTER_LIMIT = 80;

const COMPETITION_LEVEL_FILTER_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "", label: "Semua Tingkat" },
  { value: "nasional", label: "Nasional" },
  { value: "provinsi", label: "Provinsi" },
  { value: "daerah", label: "Daerah" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
];

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
): SchoolAchievementCategoryOption[] => {
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
    .filter((item): item is SchoolAchievementCategoryOption => Boolean(item));
};

const competitionLevelLabel = (value: string) => {
  const lowered = value.trim().toLowerCase();

  const matched = COMPETITION_LEVEL_FILTER_OPTIONS.find(
    (option) => option.value === lowered,
  );

  if (matched) {
    return matched.label;
  }

  if (!lowered) {
    return "-";
  }

  return `${lowered.charAt(0).toUpperCase()}${lowered.slice(1)}`;
};

const formatCompetitionDate = (value: string) => {
  if (!value.trim()) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SchoolAchievementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<SchoolAchievementListItem[]>(
    [],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCompetitionLevel, setSelectedCompetitionLevel] = useState("");
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
          throw new Error("Gagal memuat kategori prestasi");
        }

        const payload = (await response.json()) as unknown;
        const categories = toCategoryOptionArray(payload);

        if (cancelled) {
          return;
        }

        const seenCategoryNames = new Set<string>();

        setCategoryOptions([
          CATEGORY_FILTER_DEFAULT,
          ...categories
            .filter((category) => {
              const normalizedName = category.name.toLowerCase();

              if (seenCategoryNames.has(normalizedName)) {
                return false;
              }

              seenCategoryNames.add(normalizedName);
              return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => ({
              value: category.name,
              label: category.name,
            })),
        ]);
      } catch (error) {
        console.error("Failed fetch school achievement categories", error);

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

  const fetchSchoolAchievements = useCallback(
    async (page = 1, perPage = ITEMS_PER_PAGE) => {
      try {
        setLoading(true);
        setFetchError(null);

        const params = new URLSearchParams({
          page: String(page),
          perPage: String(perPage),
          limit: String(perPage),
        });

        if (debouncedSearchTerm) {
          params.set("search", debouncedSearchTerm);
        }

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

        if (selectedCompetitionLevel) {
          params.set("competitionLevel", selectedCompetitionLevel);
        }

        const response = await fetch(
          `/api/school-achievements?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Gagal memuat data prestasi siswa");
        }

        const result: SchoolAchievementListResponse = await response.json();

        setAchievements(result.data || []);
        setPagination({
          total: result.meta?.total || 0,
          currentPage: result.meta?.currentPage || page,
          perPage: result.meta?.perPage || perPage,
        });
      } catch (error) {
        console.error("Failed fetch school achievements", error);
        setAchievements([]);
        setFetchError("Data prestasi siswa belum dapat dimuat.");
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchTerm, selectedCategory, selectedCompetitionLevel],
  );

  useEffect(() => {
    fetchSchoolAchievements(1, ITEMS_PER_PAGE);
  }, [fetchSchoolAchievements]);

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const handleCompetitionLevelChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCompetitionLevel(event.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategory("");
    setSelectedCompetitionLevel("");
  };

  const filterValue =
    searchTerm || selectedCategory || selectedCompetitionLevel;

  const paginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.perPage,
      total: pagination.total,
      onChange: (page: number, pageSize: number) => {
        fetchSchoolAchievements(page, pageSize);
      },
      onShowSizeChange: (page: number, pageSize: number) => {
        fetchSchoolAchievements(page, pageSize);
      },
    }),
    [pagination, fetchSchoolAchievements],
  );

  const renderItem = (item: SchoolAchievementListItem, _: number) => {
    const slug = item.slug?.trim() || toSlug(item.title || "prestasi");
    const descriptionText = item.description?.trim() || "-";
    const shouldShowDescriptionTooltip =
      descriptionText !== "-" &&
      descriptionText.length > DESCRIPTION_TOOLTIP_CHARACTER_LIMIT;

    return (
      <div className="w-full rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Image
            src={item.coverPhotoUrl || "https://placehold.co/1200x800/png"}
            alt={item.title}
            width={1200}
            height={800}
            loading="lazy"
            unoptimized
            className="h-36 w-full shrink-0 rounded-md border border-gray-200 object-cover sm:h-24 sm:w-42"
          />

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-base font-semibold text-gray-800">
              {item.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-500/10 px-2 py-1 text-xs text-primary">
                {item.category || "Tanpa Kategori"}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {competitionLevelLabel(item.competitionLevel || "")}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1">
                {shouldShowDescriptionTooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="mt-0.5 cursor-help truncate text-gray-600">
                        {descriptionText}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs border border-gray-300 text-sm bg-white text-black font-normal shadow-md sm:max-w-sm [&>svg]:border-gray-200 [&>svg]:fill-white"
                    >
                      <p className="whitespace-normal wrap-break-word">
                        {descriptionText}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <p className="mt-0.5 truncate text-gray-600">
                    {descriptionText}
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-gray-200 sm:h-auto sm:w-px" />

              <div className="flex-1 space-y-0.5">
                <p>
                  <span className="font-medium text-gray-700">Tempat:</span>{" "}
                  {item.placeName || "-"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Penyelenggara:
                  </span>{" "}
                  {item.organizerName || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="sm:ml-auto sm:shrink-0">
            <TextButton
              variant="gray"
              text="Lihat Detail"
              className="w-fit rounded-full! text-sm!"
              onClick={() =>
                router.push(
                  `/tentang-sekolah/prestasi-siswa/${encodeURIComponent(slug)}`,
                )
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 mt-20 sm:pb-4 max-sm:mt-20 max-sm:px-8 justify-center items-center">
        <Breadcrumb
          className="w-full justify-start"
          items={[{ label: "Tentang Sekolah" }, { label: "Prestasi Siswa" }]}
        />

        <div className="w-full flex flex-wrap items-center justify-center max-w-3xl gap-4">
          <h1 className="text-4xl max-sm:text-2xl font-bold text-primary text-center">
            PRESTASI SISWA <br /> SMK TAMTAMA KROYA
          </h1>
          <p className="text-center text-lg max-sm:text-sm text-gray-600">
            Jelajahi pencapaian siswa dari berbagai kompetisi tingkat kecamatan,
            kabupaten, daerah, provinsi, hingga nasional.
          </p>
        </div>

        <div className="flex flex-col justify-end w-full flex-wrap md:flex-nowrap gap-3 md:flex-row md:items-end px-0">
          <SelectInput
            className="w-full!"
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
          />

          <SelectInput
            className="w-full!"
            options={COMPETITION_LEVEL_FILTER_OPTIONS}
            value={selectedCompetitionLevel}
            onChange={handleCompetitionLevelChange}
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
            placeholder="Cari judul/tempat/penyelenggara"
            className="w-full md:max-w-72 sm:max-w-68 mb-2"
            searchTerm={searchTerm}
            handleSearchChange={setSearchTerm}
          />
        </div>

        {fetchError && (
          <div className="w-full rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        <GridListPaginate
          data={achievements}
          showSizeChanger={false}
          showNumberInfo={false}
          renderItem={renderItem}
          viewMode="list"
          loading={loading}
          emptyText="Data prestasi siswa belum tersedia"
          pagination={paginationConfig}
        />
      </div>
    </main>
  );
}

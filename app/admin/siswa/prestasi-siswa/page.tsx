"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import Search from "@/components/Filter/Search";
import GridListPaginate from "@/components/GridListPaginate";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import { TitleSection } from "@/components/TitleSection/index";
import Toggle from "@/components/ui/toggle";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoMdRefresh } from "react-icons/io";
import { LuPen, LuPlus, LuTrash2 } from "react-icons/lu";
import { competitionLevelLabel, normalizeItem } from "./helpers";
import {
  PaginationMeta,
  SchoolAchievementItem,
  SchoolAchievementListResponse,
} from "./type";

const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const CATEGORY_OPTIONS_ENDPOINT = "/api/school-achievements/category-options";

const COMPETITION_LEVEL_FILTER_OPTIONS = [
  { value: "", label: "Semua Tingkat" },
  { value: "nasional", label: "Nasional" },
  { value: "provinsi", label: "Provinsi" },
  { value: "daerah", label: "Daerah" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
];

const toCategoryOptionList = (payload: unknown): string[] => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Array.isArray((payload as Record<string, unknown>).data)
        ? ((payload as Record<string, unknown>).data as unknown[])
        : Array.isArray((payload as Record<string, unknown>).items)
          ? ((payload as Record<string, unknown>).items as unknown[])
          : []
      : [];

  const seenNames = new Set<string>();

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      const root = item as Record<string, unknown>;
      return typeof root.name === "string" ? root.name.trim() : "";
    })
    .filter(Boolean)
    .filter((name) => {
      const lowered = name.toLowerCase();

      if (seenNames.has(lowered)) {
        return false;
      }

      seenNames.add(lowered);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
};

const formatCompetitionDate = (value: string): string => {
  if (!value.trim()) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DataPrestasiSiswaPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [items, setItems] = useState<SchoolAchievementItem[]>([]);
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
    perPage: 10,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [togglingBySlug, setTogglingBySlug] = useState<Record<string, boolean>>(
    {},
  );

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
        const categories = toCategoryOptionList(payload);

        if (cancelled) {
          return;
        }

        setCategoryOptions([
          CATEGORY_FILTER_DEFAULT,
          ...categories.map((category) => ({
            value: category,
            label: category,
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

  const fetchSchoolAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const params = new URLSearchParams({
        page: String(pagination.currentPage),
        perPage: String(pagination.perPage),
        limit: String(pagination.perPage),
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
        `/api/backoffice/school-achievements?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data prestasi siswa");
      }

      const payload = (await response.json()) as
        | SchoolAchievementListResponse
        | {
            data?: Partial<SchoolAchievementItem>[];
            items?: Partial<SchoolAchievementItem>[];
            meta?: Partial<PaginationMeta>;
          };

      const rawItems = Array.isArray(
        (payload as { items?: Partial<SchoolAchievementItem>[] }).items,
      )
        ? (payload as { items: Partial<SchoolAchievementItem>[] }).items
        : Array.isArray(
              (payload as { data?: Partial<SchoolAchievementItem>[] }).data,
            )
          ? (payload as { data: Partial<SchoolAchievementItem>[] }).data
          : [];

      const normalizedItems = rawItems.map((item) => normalizeItem(item));

      setItems(normalizedItems);

      const responseMeta = payload.meta;
      setPagination((prev) => ({
        ...prev,
        total: Number(responseMeta?.total ?? normalizedItems.length),
        currentPage: Number(responseMeta?.currentPage ?? prev.currentPage),
        perPage: Number(responseMeta?.perPage ?? prev.perPage),
      }));
    } catch (error) {
      console.error("Failed fetch school achievements", error);
      setItems([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      setFetchError("Gagal memuat data prestasi siswa.");
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data prestasi siswa",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.perPage,
    debouncedSearchTerm,
    selectedCategory,
    selectedCompetitionLevel,
    showAlert,
  ]);

  useEffect(() => {
    fetchSchoolAchievements();
  }, [fetchSchoolAchievements]);

  const deletingItem = useMemo(
    () => items.find((item) => item.slug === deletingSlug) || null,
    [items, deletingSlug],
  );

  const openDeleteModal = (slug: string) => {
    setDeletingSlug(slug);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSlug) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/backoffice/school-achievements/${encodeURIComponent(deletingSlug)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus data prestasi siswa");
      }

      showAlert({
        title: "Berhasil",
        description: "Data prestasi siswa berhasil dihapus",
        variant: "success",
      });

      setIsDeleteModalOpen(false);
      setDeletingSlug(null);

      if (items.length === 1 && pagination.currentPage > 1) {
        setPagination((prev) => ({
          ...prev,
          currentPage: Math.max(1, prev.currentPage - 1),
        }));
      } else {
        fetchSchoolAchievements();
      }
    } catch (error) {
      console.error("Failed delete school achievement", error);
      showAlert({
        title: "Gagal",
        description: "Gagal menghapus data prestasi siswa",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (
    item: SchoolAchievementItem,
    nextPublishedValue: boolean,
  ) => {
    setItems((prev) =>
      prev.map((current) =>
        current.slug === item.slug
          ? { ...current, isPublished: nextPublishedValue }
          : current,
      ),
    );
    setTogglingBySlug((prev) => ({ ...prev, [item.slug]: true }));

    try {
      const response = await fetch(
        `/api/backoffice/school-achievements/${encodeURIComponent(item.slug)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            title: item.title,
            slug: item.slug,
            description: item.description,
            competitionLevel: item.competitionLevel,
            placeName: item.placeName,
            organizerName: item.organizerName,
            competitionDate: item.competitionDate,
            category: item.category,
            participantName: item.participantName,
            coverPhotoUrl: item.coverPhotoUrl,
            isPublished: nextPublishedValue,
            galleries: (item.galleries || [])
              .map((gallery) => String(gallery.photoUrl || "").trim())
              .filter(Boolean),
            awards: (item.awards || [])
              .map((award) => String(award.name || "").trim())
              .filter(Boolean),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status publikasi");
      }

      showAlert({
        title: "Berhasil",
        description: `Status prestasi siswa berhasil diubah menjadi ${
          nextPublishedValue ? "Active" : "Non Active"
        }`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed toggle school achievement status", error);

      setItems((prev) =>
        prev.map((current) =>
          current.slug === item.slug
            ? { ...current, isPublished: item.isPublished }
            : current,
        ),
      );

      showAlert({
        title: "Gagal",
        description: "Gagal memperbarui status prestasi siswa",
        variant: "error",
      });
    } finally {
      setTogglingBySlug((prev) => {
        const nextValue = { ...prev };
        delete nextValue[item.slug];
        return nextValue;
      });
    }
  };

  const paginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.perPage,
      total: pagination.total,
      onChange: (page: number, pageSize: number) => {
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          perPage: pageSize,
        }));
      },
      showSizeChanger: true,
      onShowSizeChange: (_page: number, pageSize: number) => {
        setPagination((prev) => ({
          ...prev,
          currentPage: 1,
          perPage: pageSize,
        }));
      },
    }),
    [pagination],
  );

  const renderItem = (
    item: SchoolAchievementItem,
    _: number,
    __: "grid" | "list",
  ) => (
    <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-2xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Image
            src={item.coverPhotoUrl || "https://placehold.co/1200x800/png"}
            alt={item.title}
            width={320}
            height={200}
            loading="lazy"
            unoptimized
            className="h-24 w-34 shrink-0 rounded-md border border-gray-200 object-cover"
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

            <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600 sm:grid-cols-2">
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
              <p>
                <span className="font-medium text-gray-700">Tanggal:</span>{" "}
                {formatCompetitionDate(item.competitionDate || "")}
              </p>
              <p>
                <span className="font-medium text-gray-700">Peserta:</span>{" "}
                {item.participantName || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:ml-3">
          <Toggle
            size="md"
            showIcon
            enabled={Boolean(item.isPublished)}
            disabled={Boolean(togglingBySlug[item.slug])}
            onChange={(nextValue) => handleTogglePublish(item, nextValue)}
          />

          <TextButton
            icon={<LuPen className="text-base" />}
            variant="outline-info"
            className="w-fit border px-2! py-1 text-xs"
            onClick={() =>
              router.push(
                `/admin/siswa/prestasi-siswa/edit/${encodeURIComponent(item.slug)}`,
              )
            }
          />
          <TextButton
            icon={<LuTrash2 className="text-base" />}
            variant="outline-danger"
            className="w-fit border px-2! py-1 text-xs"
            onClick={() => openDeleteModal(item.slug)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-fit w-full rounded-md bg-white px-4 py-2 drop-shadow-sm">
        <TitleSection
          title="Data Prestasi Siswa"
          subtitle="Berisi data prestasi siswa SMK Tamtama Kroya."
        />

        <div className="mb-3 w-full">
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
            <SelectInput
              value={selectedCategory}
              options={categoryOptions}
              className="-mb-1.5 w-full lg:w-56"
              onChange={(event) => {
                setSelectedCategory(String(event.target.value));
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />

            <SelectInput
              value={selectedCompetitionLevel}
              options={COMPETITION_LEVEL_FILTER_OPTIONS}
              className="-mb-1.5 w-full lg:w-52"
              onChange={(event) => {
                const nextValue = String(event.target.value || "").trim();
                setSelectedCompetitionLevel(nextValue);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />

            <TextButton
              variant="outline"
              text="Reset"
              icon={<IoMdRefresh className="text-base" />}
              className="w-full sm:w-auto"
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchTerm("");
                setSelectedCategory("");
                setSelectedCompetitionLevel("");
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />

            <Search
              placeholder="Cari judul / tempat / penyelenggara"
              className="w-full lg:max-w-72"
              searchTerm={searchTerm}
              handleSearchChange={setSearchTerm}
            />

            <TextButton
              variant="primary"
              text="Tambah Prestasi"
              icon={<LuPlus className="text-base" />}
              className="w-full sm:w-auto"
              onClick={() => router.push("/admin/siswa/prestasi-siswa/tambah")}
            />
          </div>
        </div>

        {fetchError && (
          <div className="mb-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        <GridListPaginate
          data={items}
          renderItem={renderItem}
          viewMode="list"
          loading={loading}
          emptyText="Data prestasi siswa belum tersedia"
          showNumberInfo
          pageSizeOptions={[5, 10, 20, 30]}
          showSizeChanger={true}
          pagination={paginationConfig}
        />

        <BaseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteModalOpen(false);
              setDeletingSlug(null);
            }
          }}
          title="Konfirmasi Hapus"
          footer={
            <div className="flex justify-end gap-2">
              <TextButton
                variant="outline"
                text="Batal"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingSlug(null);
                }}
              />
              <TextButton
                variant="danger"
                text="Hapus"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={handleDelete}
              />
            </div>
          }
        >
          <p className="text-sm text-gray-700">
            Anda yakin ingin menghapus data prestasi siswa
            <span className="font-semibold">
              {deletingItem ? ` ${deletingItem.title}` : " ini"}
            </span>
            ?
          </p>
        </BaseModal>
      </div>
    </div>
  );
}

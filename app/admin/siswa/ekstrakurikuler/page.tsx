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
import { ExtracurricularItem, ExtracurricularListResponse } from "./type";
import { normalizeItem } from "./helpers";

const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const CATEGORY_OPTIONS_ENDPOINT = "/api/extracurriculars/categories";

interface CategoryOptionPayloadItem {
  id: number;
  name: string;
}

const toCategoryOptionPayload = (
  payload: unknown,
): CategoryOptionPayloadItem[] => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Array.isArray((payload as Record<string, unknown>).data)
        ? ((payload as Record<string, unknown>).data as unknown[])
        : Array.isArray((payload as Record<string, unknown>).items)
          ? ((payload as Record<string, unknown>).items as unknown[])
          : []
      : [];

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
        id:
          Number.isFinite(parsedId) && parsedId > 0
            ? Math.floor(parsedId)
            : index + 1,
        name,
      };
    })
    .filter((item): item is CategoryOptionPayloadItem => Boolean(item));
};

export default function DataExtraPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [items, setItems] = useState<ExtracurricularItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([CATEGORY_FILTER_DEFAULT]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    perPage: 6,
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
          throw new Error("Gagal memuat kategori ekstrakurikuler");
        }

        const payload = (await response.json()) as unknown;
        const categories = toCategoryOptionPayload(payload);

        if (cancelled) {
          return;
        }

        const seenIds = new Set<number>();

        setCategoryOptions([
          CATEGORY_FILTER_DEFAULT,
          ...categories
            .filter((category) => {
              if (seenIds.has(category.id)) {
                return false;
              }

              seenIds.add(category.id);
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

  const fetchExtracurriculars = useCallback(async () => {
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

      if (selectedCategoryId) {
        params.set("categoryId", selectedCategoryId);
      }

      const response = await fetch(
        `/api/backoffice/extracurriculars?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data ekstrakurikuler");
      }

      const payload = (await response.json()) as
        | ExtracurricularListResponse
        | {
            data?: ExtracurricularItem[];
            meta?: ExtracurricularListResponse["meta"];
          };

      const rawItems = Array.isArray(
        (payload as ExtracurricularListResponse).items,
      )
        ? (payload as ExtracurricularListResponse).items
        : Array.isArray((payload as { data?: ExtracurricularItem[] }).data)
          ? (payload as { data: ExtracurricularItem[] }).data || []
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
      console.error("Failed fetch extracurriculars", error);
      setItems([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      setFetchError("Gagal memuat data ekstrakurikuler.");
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data ekstrakurikuler",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.perPage,
    debouncedSearchTerm,
    selectedCategoryId,
    showAlert,
  ]);

  useEffect(() => {
    fetchExtracurriculars();
  }, [fetchExtracurriculars]);

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
        `/api/backoffice/extracurriculars/${encodeURIComponent(deletingSlug)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus data ekstrakurikuler");
      }

      showAlert({
        title: "Berhasil",
        description: "Data ekstrakurikuler berhasil dihapus",
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
        fetchExtracurriculars();
      }
    } catch (error) {
      console.error("Failed delete extracurricular", error);
      showAlert({
        title: "Gagal",
        description: "Gagal menghapus data ekstrakurikuler",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (
    item: ExtracurricularItem,
    nextPublishedValue: boolean,
  ) => {
    const categoryId = item.categoryId ?? item.category?.id ?? null;

    if (!categoryId) {
      showAlert({
        title: "Gagal",
        description: "Kategori ekstrakurikuler tidak valid",
        variant: "error",
      });
      return;
    }

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
        `/api/backoffice/extracurriculars/${encodeURIComponent(item.slug)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            name: item.name,
            thumbnailUrl: item.thumbnailUrl,
            categoryId,
            mentorName: item.mentorName,
            description: item.description,
            schedule: item.schedule,
            location: item.location,
            isPublished: nextPublishedValue,
            galleries: (item.galleries || [])
              .map((gallery) => String(gallery.photoUrl || "").trim())
              .filter(Boolean),
            achievements: (item.achievements || [])
              .map((achievement) => String(achievement.name || "").trim())
              .filter(Boolean),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status publikasi");
      }

      showAlert({
        title: "Berhasil",
        description: `Status ekstrakurikuler berhasil diubah menjadi ${
          nextPublishedValue ? "Active" : "Non Active"
        }`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed toggle extracurricular status", error);

      setItems((prev) =>
        prev.map((current) =>
          current.slug === item.slug
            ? { ...current, isPublished: item.isPublished }
            : current,
        ),
      );

      showAlert({
        title: "Gagal",
        description: "Gagal memperbarui status ekstrakurikuler",
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

  const renderItem = (item: ExtracurricularItem, _: number) => (
    <div className="h-full rounded-lg border border-gray-300 bg-white overflow-hidden flex flex-col">
      <Image
        src={item.thumbnailUrl || "https://placehold.co/1200x800/png"}
        alt={item.name}
        width={1200}
        height={800}
        loading="lazy"
        unoptimized
        className="w-full h-58 object-cover border-b border-gray-200"
      />
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-800 leading-5">
            {item.name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1 min-h-6">
          {item.category?.name?.trim() || item.categories[0] ? (
            <span className="rounded-full bg-teal-500/10 px-2 py-1 text-xs text-primary">
              {item.category?.name?.trim() || item.categories[0]}
            </span>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Toggle
              size="md"
              showIcon
              enabled={Boolean(item.isPublished)}
              disabled={Boolean(togglingBySlug[item.slug])}
              onChange={(nextValue) => {
                handleTogglePublish(item, nextValue);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <TextButton
              icon={<LuPen className="text-base" />}
              variant="outline-info"
              className="w-fit py-1 px-2! text-xs border"
              onClick={() =>
                router.push(
                  `/admin/siswa/ekstrakurikuler/edit/${encodeURIComponent(item.slug)}`,
                )
              }
            />
            <TextButton
              icon={<LuTrash2 className="text-base" />}
              variant="outline-danger"
              className="w-fit py-1 px-2! text-xs border"
              onClick={() => openDeleteModal(item.slug)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-auto min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="w-full h-fit bg-white rounded-md drop-shadow-sm px-4 py-2">
        <TitleSection
          title="Data Ekstrakurikuler"
          subtitle="Berisi data ekstrakurikuler SMK Tamtama Kroya."
        />

        <div className="w-full mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <SelectInput
            value={selectedCategoryId}
            options={categoryOptions}
            className="w-full lg:w-60 -mb-1.5"
            onChange={(event) => {
              setSelectedCategoryId(String(event.target.value));
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
              setSelectedCategoryId("");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          />

          <Search
            placeholder="Cari nama ekstrakurikuler"
            searchTerm={searchTerm}
            handleSearchChange={setSearchTerm}
          />

          <TextButton
            variant="primary"
            text="Tambah Data"
            className="w-full sm:w-auto"
            onClick={() => router.push("/admin/siswa/ekstrakurikuler/tambah")}
          />
        </div>

        {fetchError && (
          <div className="mb-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        <GridListPaginate
          data={items}
          renderItem={renderItem}
          viewMode="grid"
          loading={loading}
          emptyText="Data ekstrakurikuler belum tersedia"
          showNumberInfo
          pageSizeOptions={[6, 12, 24]}
          showSizeChanger={true}
          pagination={paginationConfig}
        />
      </div>

      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeletingSlug(null);
          }
        }}
        title="Konfirmasi Hapus"
        size="md"
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
          Anda yakin ingin menghapus data ekstrakurikuler
          <span className="font-semibold">
            {deletingItem ? ` ${deletingItem.name}` : " ini"}
          </span>
          ?
        </p>
      </BaseModal>
    </div>
  );
}

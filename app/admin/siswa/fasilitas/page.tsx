"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import Search from "@/components/Filter/Search";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import ReusableTable from "@/components/Table/ReusableTable";
import { Column } from "@/components/Table/type";
import { TitleSection } from "@/components/TitleSection/index";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import Toggle from "@/components/ui/toggle";
import { useAlert } from "@/components/ui/alert";
import { formatDate } from "@/lib/stringFormat";
import { getAuthHeader } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoMdRefresh } from "react-icons/io";
import { LuPen, LuPlus, LuTrash2 } from "react-icons/lu";
import { normalizeItem } from "./helpers";
import { SchoolFacilityItem, SchoolFacilityListResponse } from "./type";

const CATEGORY_FILTER_DEFAULT = { value: "", label: "Semua Kategori" };
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "published", label: "Publish" },
  { value: "draft", label: "Draft" },
];
const CATEGORY_OPTIONS_ENDPOINT = "/api/school-facilities/category-options";

const CATEGORY_BADGE_VARIANTS_BY_ID: Record<number, BadgeVariant> = {
  1: "yellow",
  2: "blue",
  3: "green",
  4: "purple",
};

const resolveCategoryBadgeVariant = (
  category: SchoolFacilityItem["category"],
): BadgeVariant => {
  if (!category) {
    return "gray";
  }

  const categoryId = Number(category.id || 0);

  if (CATEGORY_BADGE_VARIANTS_BY_ID[categoryId]) {
    return CATEGORY_BADGE_VARIANTS_BY_ID[categoryId];
  }

  const categoryName = String(category.name || "")
    .trim()
    .toLowerCase();

  if (categoryName.includes("laborat")) {
    return "blue";
  }

  if (categoryName.includes("workshop")) {
    return "yellow";
  }

  if (categoryName.includes("umum")) {
    return "purple";
  }

  if (categoryName.includes("olahraga")) {
    return "green";
  }

  return "gray";
};

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

export default function DataFasilitasPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [items, setItems] = useState<SchoolFacilityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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
          throw new Error("Gagal memuat kategori fasilitas");
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

  const fetchFacilities = useCallback(async () => {
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

      if (selectedStatus === "published") {
        params.set("isPublished", "true");
      }

      if (selectedStatus === "draft") {
        params.set("isPublished", "false");
      }

      const response = await fetch(
        `/api/backoffice/school-facilities?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data fasilitas");
      }

      const payload = (await response.json()) as
        | SchoolFacilityListResponse
        | {
            data?: SchoolFacilityItem[];
            items?: SchoolFacilityItem[];
            meta?: SchoolFacilityListResponse["meta"];
          };

      const rawItems = Array.isArray(
        (payload as { items?: SchoolFacilityItem[] }).items,
      )
        ? (payload as { items: SchoolFacilityItem[] }).items
        : Array.isArray((payload as { data?: SchoolFacilityItem[] }).data)
          ? (payload as { data: SchoolFacilityItem[] }).data || []
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
      console.error("Failed fetch school facilities", error);
      setItems([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      setFetchError("Gagal memuat data fasilitas sekolah.");
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data fasilitas sekolah",
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
    selectedStatus,
    showAlert,
  ]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

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
        `/api/backoffice/school-facilities/${encodeURIComponent(deletingSlug)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus data fasilitas sekolah");
      }

      showAlert({
        title: "Berhasil",
        description: "Data fasilitas sekolah berhasil dihapus",
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
        fetchFacilities();
      }
    } catch (error) {
      console.error("Failed delete school facility", error);
      showAlert({
        title: "Gagal",
        description: "Gagal menghapus data fasilitas sekolah",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (
    item: SchoolFacilityItem,
    nextPublishedValue: boolean,
  ) => {
    const categoryId = item.categoryId ?? item.category?.id ?? null;

    if (!categoryId) {
      showAlert({
        title: "Gagal",
        description: "Kategori fasilitas tidak valid",
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
        `/api/backoffice/school-facilities/${encodeURIComponent(item.slug)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            title: item.title,
            slug: item.slug,
            summary: item.summary,
            description: item.description,
            categoryId,
            coverPhotoUrl: item.coverPhotoUrl,
            galleryDescription: item.galleryDescription,
            isPublished: nextPublishedValue,
            galleries: (item.galleries || [])
              .map((gallery) => String(gallery.photoUrl || "").trim())
              .filter(Boolean),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status publikasi");
      }

      showAlert({
        title: "Berhasil",
        description: `Status fasilitas berhasil diubah menjadi ${
          nextPublishedValue ? "Publish" : "Draft"
        }`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed toggle school facility status", error);

      setItems((prev) =>
        prev.map((current) =>
          current.slug === item.slug
            ? { ...current, isPublished: item.isPublished }
            : current,
        ),
      );

      showAlert({
        title: "Gagal",
        description: "Gagal memperbarui status fasilitas",
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

  const columns: Column<SchoolFacilityItem>[] = [
    {
      title: "No",
      dataIndex: "id",
      key: "no",
      align: "center",
      width: 70,
      render: (_value, _record, index) =>
        (pagination.currentPage - 1) * pagination.perPage + index + 1,
    },
    {
      title: "Foto",
      dataIndex: "coverPhotoUrl",
      key: "coverPhotoUrl",
      align: "center",
      width: 110,
      render: (value, record) => (
        <div className="flex justify-center">
          <Image
            src={String(value || "https://placehold.co/1200x800/png")}
            alt={record.title}
            width={80}
            height={56}
            loading="lazy"
            unoptimized
            className="h-14 w-20 rounded border border-gray-200 object-cover"
          />
        </div>
      ),
    },
    {
      title: "Nama Fasilitas",
      dataIndex: "title",
      key: "title",
      width: 260,
      render: (value) => (
        <span className="font-medium text-gray-800">
          {String(value || "-")}
        </span>
      ),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 160,
      render: (_value, record) => {
        const categoryName = record.category?.name?.trim();

        if (!categoryName) {
          return "-";
        }

        return (
          <Badge variant={resolveCategoryBadgeVariant(record.category)}>
            {categoryName}
          </Badge>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isPublished",
      key: "isPublished",
      align: "center",
      width: 120,
      render: (value) => (
        <Badge variant={Boolean(value) ? "green" : "gray"}>
          {Boolean(value) ? "Publish" : "Draft"}
        </Badge>
      ),
    },
    {
      title: "Tgl Dibuat",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 160,
      render: (value) => {
        const dateValue = String(value || "").trim();

        if (!dateValue) {
          return "-";
        }

        return formatDate(dateValue);
      },
    },
    {
      title: "Aksi",
      dataIndex: "slug",
      key: "actions",
      align: "center",
      width: 200,
      render: (_value, record) => (
        <div className="flex items-center justify-center gap-2">
          <Toggle
            size="md"
            showIcon
            enabled={Boolean(record.isPublished)}
            disabled={Boolean(togglingBySlug[record.slug])}
            onChange={(nextValue) => {
              handleTogglePublish(record, nextValue);
            }}
          />

          <TextButton
            icon={<LuPen className="text-base" />}
            variant="outline-info"
            className="w-fit py-1 px-2! text-xs border"
            onClick={() =>
              router.push(
                `/admin/siswa/fasilitas/edit/${encodeURIComponent(record.slug)}`,
              )
            }
          />

          <TextButton
            icon={<LuTrash2 className="text-base" />}
            variant="outline-danger"
            className="w-fit py-1 px-2! text-xs border"
            onClick={() => openDeleteModal(record.slug)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-auto min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="w-full h-fit bg-white rounded-md drop-shadow-sm px-4 py-2">
        <TitleSection
          title="Data Fasilitas Sekolah"
          subtitle="Berisi data fasilitas SMK Tamtama Kroya yang tampil di website."
        />

        <div className="w-full mb-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
          <SelectInput
            value={selectedCategoryId}
            options={categoryOptions}
            className="w-full lg:w-42 -mb-1.5"
            onChange={(event) => {
              setSelectedCategoryId(String(event.target.value));
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          />

          <SelectInput
            value={selectedStatus}
            options={STATUS_FILTER_OPTIONS}
            className="w-full lg:w-36 -mb-1.5"
            onChange={(event) => {
              setSelectedStatus(String(event.target.value || "").trim());
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
              setSelectedStatus("");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          />

          <Search
            placeholder="Cari judul / ringkasan / deskripsi"
            searchTerm={searchTerm}
            className="w-fit md:w-full lg:w-xs"
            handleSearchChange={setSearchTerm}
          />

          <TextButton
            variant="primary"
            text="Tambah Fasilitas"
            icon={<LuPlus className="text-base" />}
            className="w-full sm:w-auto"
            onClick={() => router.push("/admin/siswa/fasilitas/tambah")}
          />
        </div>

        <ReusableTable
          columns={columns}
          dataSource={items}
          loading={loading}
          error={fetchError || undefined}
          rowKey="id"
          serverSidePagination={true}
          tableLayout="fixed"
          emptyText="Data fasilitas sekolah belum tersedia"
          pagination={{
            ...paginationConfig,
            pageSizeOptions: [6, 12, 24],
          }}
          scroll={{ y: 580 }}
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
          Anda yakin ingin menghapus data fasilitas
          <span className="font-semibold">
            {deletingItem ? ` ${deletingItem.title}` : " ini"}
          </span>
          ?
        </p>
      </BaseModal>
    </div>
  );
}

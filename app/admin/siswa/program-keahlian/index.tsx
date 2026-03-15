"use client";

import GridListPaginate from "@/components/GridListPaginate";
import { TitleSection } from "@/components/TitleSection/index";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MajorApiResponse, MajorItem } from "./type";
import { TextButton } from "@/components/Buttons/TextButton";
import { LuLayoutGrid, LuList, LuPen, LuTrash2 } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BaseModal } from "@/components/Modal/BaseModal";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/utils/auth";
import { useAlert } from "@/components/ui/alert";
import Search from "@/components/Filter/Search";
import SelectInput from "@/components/InputForm/SelectInput";
import { IoMdRefresh } from "react-icons/io";
import Image from "next/image";

const sortByOptions = [
  { value: "latest", label: "Urutkan: Terbaru" },
  { value: "oldest", label: "Urutkan: Terlama" },
  { value: "name_asc", label: "Urutkan: Nama A-Z" },
  { value: "name_desc", label: "Urutkan: Nama Z-A" },
];

export default function ProgramKeahlianPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [status, setStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMajors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sortBy,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(
        `/api/backoffice/majors?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data program keahlian");
      }

      const result: MajorApiResponse = await response.json();

      setMajors(result.data || []);
      setTotal(result.meta?.total || 0);
      setCurrentPage(result.meta?.currentPage || currentPage);
      setLimit(result.meta?.perPage || limit);
    } catch (error) {
      console.error("Failed fetch majors", error);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data program keahlian",
        variant: "error",
      });
      setMajors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm, sortBy, status, showAlert]);

  useEffect(() => {
    fetchMajors();
  }, [fetchMajors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortBy, status]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSortBy("latest");
    setStatus("");
    setCurrentPage(1);
  };

  const paginationConfig = useMemo(
    () => ({
      current: currentPage,
      pageSize: limit,
      total,
      onChange: (page: number, pageSize: number) => {
        setCurrentPage(page);
        setLimit(pageSize);
      },
      showSizeChanger: true,
      onShowSizeChange: (_page: number, pageSize: number) => {
        setCurrentPage(1);
        setLimit(pageSize);
      },
    }),
    [currentPage, limit, total],
  );

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/backoffice/majors/${deletingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus data program keahlian");
      }

      showAlert({
        title: "Berhasil",
        description: "Data program keahlian berhasil dihapus",
        variant: "success",
      });
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchMajors();
    } catch (error) {
      console.error("Failed delete major", error);
      showAlert({
        title: "Gagal",
        description: "Gagal menghapus data program keahlian",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = (item: MajorItem, _: number) => {
    return (
      <div className="rounded-lg flex h-full flex-col border border-gray-300 bg-white overflow-hidden">
        <Image
          src={item.photoUrl || "https://placehold.co/1200x800/png"}
          alt={item.name}
          width={1200}
          height={800}
          loading="lazy"
          unoptimized
          className="w-full h-58 aspect-video bg-gray-300 object-cover"
        />

        <div className="w-full flex flex-col px-3 py-3 gap-3 grow">
          <div>
            <p className="text-base font-semibold text-gray-800">{item.name}</p>
            <p className="text-sm text-gray-600">{item.abbreviation}</p>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2 grow">
            {item.summary || "-"}
          </p>

          <div className="w-full flex flex-row justify-end gap-2 mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <TextButton
                  icon={<LuPen className="text-xl" />}
                  variant="outline-info"
                  className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                  onClick={() =>
                    router.push(`/admin/siswa/program-keahlian/${item.id}/edit`)
                  }
                />
              </TooltipTrigger>
              <TooltipContent side="top">Edit Program Keahlian</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TextButton
                  icon={<LuTrash2 className="text-xl" />}
                  variant="outline-danger"
                  className="w-fit py-1 px-2! border-2"
                  onClick={() => confirmDelete(item.id)}
                />
              </TooltipTrigger>
              <TooltipContent side="top">Hapus Program Keahlian</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  const renderListItem = (item: MajorItem, _: number) => {
    return (
      <div className="rounded-lg h-32 flex flex-row items-center justify-between border border-gray-300 shadow-2xs p-3 gap-4">
        <div className="h-full flex flex-row items-center gap-4">
          <Image
            src={item.photoUrl || "https://placehold.co/600x400/png"}
            alt={item.name}
            height={200}
            width={120}
            loading="lazy"
            unoptimized
            className="w-48 h-full border border-gray-300 aspect-video bg-gray-300 rounded-lg object-cover"
          />
          <div className="grow">
            <p className="text-base font-semibold text-gray-800 mb-1">
              {item.name}
            </p>
            <p className="text-sm text-gray-600 mb-2">{item.abbreviation}</p>
            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
              {item.summary || "-"}
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-3 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuPen className="text-xl" />}
                variant="outline-info"
                className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                onClick={() =>
                  router.push(`/admin/siswa/program-keahlian/${item.id}/edit`)
                }
              />
            </TooltipTrigger>
            <TooltipContent side="top">Edit Program Keahlian</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuTrash2 className="text-xl" />}
                variant="outline-danger"
                className="w-fit py-1 px-2! border-2"
                onClick={() => confirmDelete(item.id)}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Hapus Program Keahlian</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-auto min-h-screen bg-gray-100 p-4">
      <div className="w-full h-fit bg-white rounded-md drop-shadow-sm px-4 py-2">
        {/* <Breadcrumb
          homeHref="/admin/dashboard"
          homeLabel="Dashboard"
          items={[{ label: "Jurusan Sekolah" }]}
          className="pt-2 pb-1"
        /> */}
        <TitleSection
          title="Jurusan Sekolah"
          subtitle="Kelola data jurusan yang ditampilkan pada halaman website sekolah"
        />
        <div className="w-full mb-3">
          <div className="w-full flex flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
            <div className="w-full lg:w-54">
              <SelectInput
                label=""
                value={sortBy}
                onChange={(event) => setSortBy(String(event.target.value))}
                options={sortByOptions}
              />
            </div>
            <TextButton
              variant="outline"
              text="Reset"
              className="w-full lg:w-auto lg:mb-2"
              onClick={handleResetFilters}
              icon={<IoMdRefresh className="text-lg shrink-0" />}
            />
            <Search
              placeholder="Cari jurusan"
              className="w-full lg:max-w-72 lg:mb-2"
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
            />
            <div className="hidden lg:flex items-center gap-1 mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded border transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <LuList className="text-lg" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Tampilan List</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded border transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <LuLayoutGrid className="text-lg" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Tampilan Grid</TooltipContent>
              </Tooltip>
            </div>
            <TextButton
              variant="primary"
              text="Tambah Data"
              onClick={() =>
                router.push("/admin/siswa/program-keahlian/tambah")
              }
              className="w-full lg:w-auto lg:mb-2"
            />
          </div>
        </div>
        <div className="w-full h-fit">
          <GridListPaginate
            data={majors}
            viewMode={viewMode}
            loading={loading}
            pagination={paginationConfig}
            emptyText="Data jurusan belum tersedia"
            renderItem={viewMode === "list" ? renderListItem : renderItem}
            gridClassName="w-full h-fit grid gap-6 my-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2"
          />
        </div>
        <BaseModal
          isOpen={deleteModalOpen}
          onClose={() => {
            if (!isDeleting) {
              setDeleteModalOpen(false);
              setDeletingId(null);
            }
          }}
          title="Konfirmasi Hapus Program Keahlian"
          footer={
            <div className="flex justify-end gap-2">
              <TextButton
                variant="outline"
                text="Batal"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingId(null);
                }}
              />
              <TextButton
                text={isDeleting ? "Menghapus..." : "Hapus"}
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
              />
            </div>
          }
        >
          <p>
            Apakah Anda yakin ingin menghapus program keahlian ini? Tindakan ini
            tidak dapat dibatalkan.
          </p>
        </BaseModal>
      </div>
    </div>
  );
}

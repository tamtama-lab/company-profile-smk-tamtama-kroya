"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import Search from "@/components/Filter/Search";
import { ProfileUser } from "@/components/Icon/UserIcon";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import { TitleSection } from "@/components/TitleSection/index";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Teacher } from "@/types/teacher/list";
import { getAuthHeader } from "@/utils/auth";
import { transformTeacherData } from "@/utils/trasformTeacherData";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuEye, LuPen, LuPlus, LuTrash2 } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/alert";
import { BaseModal } from "@/components/Modal/BaseModal";
import Image from "next/image";
import { BsDot } from "react-icons/bs";

interface TeacherDetail {
  id: number;
  fullName: string;
  username: string;
  role: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  schoolLessons: Array<{
    id: number;
    name: string;
    abbreviation: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function AdminTeacherAccountPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [selectedBatchId, setSelectedBatchId] = useState<string | number | "">(
    "",
  );
  const [selectedMajor, setSelectedMajor] = useState<string | number | "">("");
  const [selectAuthored, setSelectedAuthor] = useState<"" | "true" | "false">(
    "",
  );
  // Selected academic year filter
  const [selectedYearId, setSelectedYearId] = useState<string | number | "">(
    "",
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750); // 750ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTeachers = useCallback(
    async (page: number, search: string = "", pageLimit: number = 10) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageLimit.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        if (selectedBatchId) {
          params.append("batch_id", String(selectedBatchId));
        }
        // Append selected academic year filter if set
        if (selectedYearId) {
          params.append("academic_year_id", String(selectedYearId));
        }
        // Only append `authored` when a specific type is selected
        if (selectAuthored !== "") {
          params.append("authored", selectAuthored);
        }

        if (selectedMajor !== "") {
          params.append("major_code", String(selectedMajor));
        }

        const response = await fetch(
          `/api/backoffice/teachers?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "E_UNAUTHORIZED_ACCESS") {
            setError("Anda tidak memiliki akses. Silakan login kembali.");
          } else {
            setError(data.message || "Gagal mengambil data guru");
          }
          return;
        }
        const transformed = transformTeacherData(data || []);
        setTeachers(transformed);
        setMeta(data.meta ?? null);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        setError("Terjadi kesalahan saat mengambil data guru");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBatchId, selectAuthored, selectedYearId, selectedMajor],
  );

  useEffect(() => {
    fetchTeachers(currentPage, debouncedSearchTerm, limit);
  }, [currentPage, debouncedSearchTerm, fetchTeachers, limit]);

  const handleResetFilters = () => {
    setSelectedMajor("");
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedBatchId("");
    setSelectedAuthor("");
    setSelectedYearId("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/backoffice/teachers/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus akun guru");
      }

      showAlert({
        title: "Berhasil",
        description: "Akun guru berhasil dihapus",
        variant: "success",
      });

      // Refresh the list
      fetchTeachers(currentPage, debouncedSearchTerm, limit);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error ? error.message : "Gagal menghapus akun guru",
        variant: "error",
      });
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    await handleDelete(deleteTargetId);
    closeDeleteModal();
  };

  const handleDetailClick = async (id: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/backoffice/teachers/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil detail guru");
      }

      const data: TeacherDetail = await response.json();
      setSelectedTeacher(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching teacher detail:", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail guru",
        variant: "error",
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleEditFromModal = () => {
    if (selectedTeacher) {
      router.push(`/admin/guru/akun-guru/edit/${selectedTeacher.id}`);
    }
  };

  const loadingStates = isLoading || isLoadingDetail;

  const columns: Column<Teacher>[] = [
    {
      title: "No",
      dataIndex: "id",
      key: "id",
      render: (value, record, index) => (currentPage - 1) * limit + index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Foto",
      dataIndex: "photoUrl",
      key: "photoUrl",
      width: 80,
      align: "center",
      render: (value) => (
        <div className="w-full my-2 flex justify-center">
          <ProfileUser
            size={40}
            source={typeof value === "string" ? value : null}
          />
        </div>
      ),
    },
    {
      title: "Nama Guru",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      width: 160,
    },
    {
      title: "Mata Pelajaran",
      dataIndex: "schoolLesson",
      key: "schoolLesson",
      width: 300,
      render: (value) => {
        const lessons = Array.isArray(value) ? value : [];
        if (!lessons.length) return "-";
        return lessons
          .map((lesson) => lesson.abbreviation || lesson.name)
          .filter(Boolean)
          .join(", ");
      },
    },
    {
      title: "Aksi",
      dataIndex: "id",
      key: "actions",
      align: "center",
      width: 200,
      render: (value) => (
        <div className="flex justify-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuEye className="text-xl" />}
                isLoading={loadingStates}
                variant="outline-warning"
                className="w-fit py-1 px-2! border-2"
                disabled={loadingStates}
                onClick={() => handleDetailClick(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Detail Data Guru</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuPen className="text-xl" />}
                isLoading={loadingStates}
                variant="outline-info"
                className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                disabled={loadingStates}
                onClick={() =>
                  router.push(`/admin/guru/akun-guru/edit/${value}`)
                }
              />
            </TooltipTrigger>
            <TooltipContent side="top">Edit Data Guru</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuTrash2 className="text-xl" />}
                isLoading={loadingStates}
                variant="outline-danger"
                className="w-fit py-1 px-2! border-2"
                disabled={loadingStates}
                onClick={() => openDeleteModal(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Hapus Data Guru</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Akun Guru"
          subtitle="Halaman ini digunakan untuk membuat akun guru yang akan masuk ke dalam sistem PPDB dan melakukan pendaftaran untuk calon murid baru."
        />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm">
          <div className="p-6 max-sm:p-2 border-b border-gray-200">
            <div className="flex w-auto flex-wrap flex-col gap-4 lg:flex-row lg:items-center lg:justify-end mb-3">
              <Search
                placeholder="Cari nama / username / mata pelajaran"
                className="w-full mb-2 lg:max-w-sm lg:w-full"
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
              />
              <Link href="/admin/guru/akun-guru/tambah">
                <TextButton
                  variant="primary"
                  text="Tambah Akun"
                  disabled={loadingStates}
                  className="w-full font-normal px-2! sm:col-span-2 lg:w-auto mb-2 shrink-0"
                  isLoading={loadingStates}
                  icon={<LuPlus className="text-lg shrink-0" />}
                  onClick={handleResetFilters}
                />
              </Link>
            </div>
            <ReusableTable
              columns={columns}
              dataSource={teachers}
              loading={isLoading}
              error={error || undefined}
              emptyText="Data Guru Tidak Ada"
              rowKey="id"
              serverSidePagination={true}
              tableLayout="fixed"
              pagination={{
                current: currentPage,
                pageSize: limit,
                total: meta?.total || 0,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 25, 50, 100],
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setLimit(pageSize);
                },
                onShowSizeChange: (current, size) => {
                  setCurrentPage(1);
                  setLimit(size);
                },
              }}
              scroll={{ y: 600 }}
            />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detail Akun Guru"
        size="xl"
        footer={
          <div className="flex justify-end">
            <TextButton
              variant="primary"
              text="Tutup"
              onClick={handleCloseDetailModal}
              isLoading={isLoadingDetail}
            />
          </div>
        }
      >
        {isLoadingDetail ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : selectedTeacher ? (
          <div className="flex border-t  border-gray-200">
            {/* ===== SIDEBAR PROFIL ===== */}
            <div className="w-1/3 flex flex-col items-center gap-4 p-6 rounded-md">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border bg-gray-200 border-gray-300">
                <ProfileUser source={selectedTeacher.photoUrl} size={112} />
              </div>

              <TextButton
                variant="primary"
                text="Edit"
                icon={<LuPen />}
                onClick={handleEditFromModal}
              />
            </div>

            {/* ===== KONTEN KANAN ===== */}
            <div className="flex-1 -mb-3">
              <div className="border-r border-l border-gray-200 rounded-none text-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Informasi Akun
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="grid grid-cols-[160px_1fr] px-4 py-3">
                    <span className="text-gray-500">Username</span>
                    <span className="font-medium text-gray-900">
                      {selectedTeacher.username}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] px-4 py-3">
                    <span className="text-gray-500">Password</span>
                    <span className="font-medium text-gray-900">
                      ••••••••••
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 border-y border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Profil Guru
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="grid grid-cols-[160px_1fr] px-4 py-3">
                    <span className="text-gray-500">Nama Guru</span>
                    <span className="font-medium text-gray-900">
                      {selectedTeacher.fullName}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 border-y border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Mata Pelajaran Diampu
                  </h3>
                </div>
                <div className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.schoolLessons.map((lesson) => (
                      <span
                        key={lesson.id}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 rounded-sm text-xs font-medium"
                      >
                        <BsDot className="w-4 h-4" />
                        {lesson.abbreviation || lesson.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Data tidak tersedia</p>
          </div>
        )}
      </BaseModal>

      {/* Delete Confirmation Modal */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Hapus Akun Guru"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <TextButton
              variant="outline"
              text="Batal"
              onClick={closeDeleteModal}
              disabled={loadingStates}
            />
            <TextButton
              variant="danger"
              text="Hapus"
              onClick={confirmDelete}
              isLoading={loadingStates}
              disabled={loadingStates}
            />
          </div>
        }
      >
        <div className="py-4 text-sm text-gray-700">
          Apakah Anda yakin ingin menghapus akun guru ini?
        </div>
      </BaseModal>
    </div>
  );
}

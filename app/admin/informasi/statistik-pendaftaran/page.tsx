"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import StatsMajorCard, {
  MajorData,
} from "@/components/Card/StatsCard/StatCardMajors";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { Student } from "@/components/Dashboard/StudentsTable";
import SelectInput from "@/components/InputForm/SelectInput";
import { BaseModal } from "@/components/Modal/BaseModal";
import { ModalPreviewData } from "@/components/Modal/PreviewDataModal";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import { TitleSection } from "@/components/TitleSection/index";
import { useAlert } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAuthHeader } from "@/utils/auth";
import { RegistrationData } from "@/utils/registrationTypes";
import {
  transformFromApiFormat,
  transformRecentRegistrations,
} from "@/utils/transformRegistrationData";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { LuEye, LuPen, LuTrash2 } from "react-icons/lu";

export default function AdminStatisticPage() {
  const { showAlert } = useAlert();

  const [majorDistribution, setMajorDistribution] = useState<MajorData[]>([
    { major: "TKR", count: 0 },
    { major: "DKV", count: 0 },
    { major: "TITL", count: 0 },
    { major: "TP", count: 0 },
  ]);

  console.log("Major Distribution Data:", majorDistribution);
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [selectedBatchId, setSelectedBatchId] = useState<string | number | "">(
    "",
  );
  const [selectAuthored, setSelectedAuthor] = useState<"" | "true" | "false">(
    "",
  );
  const [batches, setBatches] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<RegistrationData | null>(
    null,
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMajorDistribution = async () => {
      try {
        const response = await fetch(`/api/admin/stats/major-distribution`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMajorDistribution(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        showAlert({
          title: "Terjadi Kesalahan",
          description: "Gagal mengambil data distribusi jurusan",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMajorDistribution();
  }, [showAlert]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750); // 750ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const confirmDelete = (registrationId: number) => {
    setDeletingId(registrationId);
    setDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/dashboard/registrations?id=${deletingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        showAlert({
          title: "Berhasil",
          description: data.message || "Data Siswa berhasil dihapus.",
          variant: "success",
        });
        fetchStudents(currentPage, "", limit);
      } else {
        showAlert({
          title: "Gagal",
          description: data.message || "Gagal menghapus data siswa.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      showAlert({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghapus data siswa.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  const handleRouteDetail = async (registrationId: number) => {
    setIsRouting(true);
    try {
      // short delay to show loader before navigation
      await new Promise((resolve) => setTimeout(resolve, 750));
      router.push(`/admin/ppdb/data-calon-murid/${registrationId}/edit`);
    } finally {
      // component may unmount on navigation; this is safe
      setIsRouting(false);
    }
  };

  const loadingStates = isLoading || isRouting || loadingDetail;

  const fetchStudents = useCallback(
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
        // Only append `authored` when a specific type is selected
        if (selectAuthored !== "") {
          params.append("authored", selectAuthored);
        }

        const response = await fetch(
          `/api/dashboard/students?${params.toString()}`,
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
            setError(data.message || "Gagal mengambil data siswa");
          }
          return;
        }
        const transformed = transformRecentRegistrations(data || []);
        setStudents(transformed);
        setMeta(data.meta);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setError("Terjadi kesalahan saat mengambil data siswa");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBatchId, selectAuthored],
  );

  useEffect(() => {
    fetchStudents(currentPage, debouncedSearchTerm, limit);
  }, [currentPage, debouncedSearchTerm, fetchStudents, limit]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Fetch registration batches for filter select
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`/api/registrations/batches`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const opts = (data || []).map(
          (b: {
            id: number;
            name: string;
            title: string;
            isActive: number;
          }) => ({
            value: b.id,
            label: b.name || b.title || `Gelombang ${b.id}`,
            disabled: Number(b.isActive) === 0,
          }),
        );
        setBatches(opts);
      } catch (err) {
        console.error("Failed to fetch batches:", err);
      }
    };
    fetchBatches();
  }, []);

  const handleDetailClick = async (registrationId: number) => {
    setLoadingDetail(true);
    console.log("Fetching details for registration ID:", registrationId);
    try {
      const response = await fetch(
        `/api/dashboard/students/${registrationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const transformedData = transformFromApiFormat(data);
        setSelectedData(transformedData);
        setIsModalOpen(true);
        setLoadingDetail(false);
      } else {
        const errorData = await response.json();
        showAlert({
          title: "Terjadi Kesalahan",
          description:
            errorData.message || "Gagal mengambil data detail pendaftaran",
          variant: "error",
        });
        setIsModalOpen(false);
        setLoadingDetail(false);
      }
    } catch (error) {
      console.error("Failed to fetch registration details:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Terjadi kesalahan saat mengambil data detail",
        variant: "error",
      });
      setIsModalOpen(false);
      setLoadingDetail(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      title: "No",
      dataIndex: "id",
      key: "id",
      render: (value, record, index) => (currentPage - 1) * limit + index + 1,
      width: 80,
      align: "center",
    },
    {
      title: "Nama Calon Murid",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
      width: 200,
    },
    {
      title: "No. Pendaftaran",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      sorter: true,
      align: "center",
      width: 130,
      render: (value, record) =>
        record.registrationNumber || record.registrationId,
    },
    {
      title: "Asal SMP/MTs",
      dataIndex: "schoolOriginName",
      key: "schoolOriginName",
      // sorter: true,
      width: 200,
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "gender",
      key: "gender",
      width: 160,
      align: "center",
      render: (value) => (value === "1" ? "Laki-laki" : "Perempuan"),
      // sorter: true,
    },

    {
      title: "Jenis Pendaftaran",
      dataIndex: "author",
      key: "author",
      sorter: true,
      align: "center",
      width: 120,
      // render: (value) => value.fullname,
      render: (value, record) =>
        !record.author || Object.keys(record.author).length === 0
          ? "Mandiri"
          : "Oleh Guru",
    },
    {
      title: "Didaftarkan Oleh",
      dataIndex: "authorName",
      key: "authorName",
      sorter: true,
      align: "center",
      width: 160,
    },
    {
      title: "Aksi",
      dataIndex: "registrationId",
      key: "actions",
      align: "center",
      width: 240,
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
            <TooltipContent side="top">Detail Data Murid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuPen className="text-xl" />}
                isLoading={loadingStates}
                variant="outline-info"
                className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                disabled={loadingStates}
                onClick={() => handleRouteDetail(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Edit Data Murid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuTrash2 className="text-xl" />}
                isLoading={loadingStates}
                variant="outline-danger"
                className="w-fit py-1 px-2! border-2"
                disabled={loadingStates}
                onClick={() => confirmDelete(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Hapus Data Murid</TooltipContent>
          </Tooltip>
        </div>
      ),
      // width: 120,
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Data Pendaftar Sekolah"
          subtitle="Menampilkan daftar lengkap calon murid yang telah melakukan <br /> pendaftaran baik secara mandiri maupun melalui guru."
        />
        <StatsMajorCard data={majorDistribution} isLoading={isLoading} />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm">
          <div className="p-6 max-sm:p-2 border-b border-gray-200">
            <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                <div className="w-full sm:w-auto flex flex-row gap-3 items-center">
                  <h3 className="font-semibold text-gray-800 mb-2 text-nowrap">
                    Tahun Ajaran
                  </h3>
                  <SelectInput
                    options={[{ value: 1, label: "2025/2026" }]}
                    placeholder={"Pilih Tahun Ajaran "}
                    isMandatory
                    className="w-full sm:w-56"
                  />
                </div>
                <SelectInput
                  className="w-full sm:w-56"
                  value={selectAuthored}
                  onChange={(e) => {
                    setSelectedAuthor(e.target.value as "" | "true" | "false");
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "", label: "Semua Jenis Pendaftaran" },
                    { value: "true", label: "Oleh Guru" },
                    { value: "false", label: "Mandiri" },
                  ]}
                  placeholder={"Pilih Jenis Pendaftaran "}
                  isMandatory
                />
              </div>
              {/* Search Filter */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-48">
                  <SelectInput
                    value={selectedBatchId}
                    onChange={(e) => {
                      setSelectedBatchId(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "", label: "Semua Gelombang" },
                      ...batches,
                    ]}
                    placeholder="Pilih Gelombang"
                    className="w-full sm:w-48"
                  />
                </div>
                <div className="relative w-7/10 max-sm:w-full max-sm:pb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 pb-2 max-sm:pb-1 flex items-center pointer-events-none">
                    <FaMagnifyingGlass className="text-lg text-gray-400" />
                  </div>
                  <input
                    type="text"
                    aria-label="Cari pendaftar"
                    placeholder="Cari Nama / nomor pendaftaran / atau asal sekolah..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block max-sm:placeholder:text-xs w-full pl-10 pr-3 py-2.5 max-sm:py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <ReusableTable
              columns={columns}
              dataSource={students}
              loading={isLoading}
              emptyText="Data Tidak Ada"
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
            <ModalPreviewData
              title="Detail Data Pendaftaran Murid"
              footer={null}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              data={selectedData || undefined}
            />
            <BaseModal
              isOpen={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              title="Konfirmasi Hapus"
              footer={
                <div className="flex justify-end gap-2">
                  <TextButton
                    variant="outline"
                    text="Batal"
                    isLoading={isDeleting}
                    onClick={() => setDeleteModalOpen(false)}
                  />
                  <TextButton
                    text={"Hapus"}
                    variant="danger"
                    onClick={performDelete}
                    isLoading={isDeleting}
                  />
                </div>
              }
            >
              <p>Anda yakin ingin menghapus siswa ini?</p>
              <p>Aksi tidak dapat dibatalkan.</p>
            </BaseModal>
          </div>
        </div>
      </div>
    </div>
  );
}

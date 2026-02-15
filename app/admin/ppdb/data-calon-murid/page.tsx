"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { Student } from "@/components/Dashboard/StudentsTable";
import Search from "@/components/Filter/Search";
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
import { IoMdRefresh } from "react-icons/io";
import { LuEye, LuPen, LuTrash2 } from "react-icons/lu";

export default function AdminProspectiveStudentPage() {
  const { showAlert } = useAlert();

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
  const [selectedMajor, setSelectedMajor] = useState<string | number | "">("");
  const [selectAuthored, setSelectedAuthor] = useState<"" | "true" | "false">(
    "",
  );
  // Selected academic year filter
  const [selectedYearId, setSelectedYearId] = useState<string | number | "">(
    "",
  );
  const [batches, setBatches] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);

  const [majors, setMajors] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<RegistrationData | null>(
    null,
  );

  // Filter options loaded from server (cached endpoint)
  const [yearsOptions, setYearsOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);
  const [registrationTypeOptions, setRegistrationTypeOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      sessionStorage.setItem(
        "returnUrl",
        window.location.pathname + window.location.search,
      );
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
    [selectedBatchId, selectAuthored, selectedYearId, selectedMajor],
  );

  useEffect(() => {
    fetchStudents(currentPage, debouncedSearchTerm, limit);
  }, [currentPage, debouncedSearchTerm, fetchStudents, limit]);

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

  // Fetch filter options (years, batches, registration types) from server endpoint with caching
  useEffect(() => {
    let cancelled = false;

    const loadCachedOptions = () => {
      if (cancelled) return;
      try {
        const cachedBatches = localStorage.getItem("filterOptions.batches");
        const cachedYears = localStorage.getItem("filterOptions.years");
        const cachedReg = localStorage.getItem("filterOptions.regTypes");
        const cachedMajors = localStorage.getItem("filterOptions.majors");
        if (cachedMajors) setMajors(JSON.parse(cachedMajors));
        if (cachedBatches) setBatches(JSON.parse(cachedBatches));
        if (cachedYears) setYearsOptions(JSON.parse(cachedYears));
        if (cachedReg) setRegistrationTypeOptions(JSON.parse(cachedReg));
      } catch (e) {
        console.error("Failed to load cached filter options", e);
      }
    };

    const loadOptions = async () => {
      try {
        const res = await fetch(`/api/filters/options`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch options", res.status);
          loadCachedOptions();
          return;
        }

        const data = await res.json();

        // Normalize batches to option shape
        const batchOpts = (data.batches || []).map(
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
        const majorOpts = (data.majors || []).map(
          (b: { name: string; abbreviation: string }) => ({
            value: b.abbreviation,
            label: `Jurusan ${b.abbreviation}`,
          }),
        );

        if (cancelled) return;

        setBatches(batchOpts);
        setMajors(majorOpts);
        setYearsOptions(data.years || []);
        setRegistrationTypeOptions(data.registrationTypes || []);

        // Cache to localStorage as fallback when network fails
        try {
          localStorage.setItem(
            "filterOptions.majors",
            JSON.stringify(majorOpts),
          );
          localStorage.setItem(
            "filterOptions.batches",
            JSON.stringify(batchOpts),
          );
          localStorage.setItem(
            "filterOptions.years",
            JSON.stringify(data.years || []),
          );
          localStorage.setItem(
            "filterOptions.regTypes",
            JSON.stringify(data.registrationTypes || []),
          );
        } catch {
          /* ignore localStorage errors */
        }
      } catch (err) {
        console.error(
          "Failed to load filter options, falling back to cache",
          err,
        );
        loadCachedOptions();
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
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
      title: "Jurusan Pilihan",
      dataIndex: "majorChoice",
      key: "majorChoice",
      width: 120,
      align: "center",
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
          title="Data Calon Murid"
          subtitle="Menampilkan halaman daftar lengkap calon murid tahun ajaran saat ini"
        />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm">
          <div className="p-6 max-sm:p-2 border-b border-gray-200">
            <div className="flex w-auto flex-wrap flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-3">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center">
                <SelectInput
                  value={selectedYearId}
                  onChange={(e) => {
                    setSelectedYearId(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "", label: "Seluruh Tahun Ajaran" },
                    ...yearsOptions,
                  ]}
                  placeholder={"Pilih Tahun Ajaran "}
                  isMandatory
                  className="w-full lg:w-48"
                />
                <SelectInput
                  className="w-full lg:w-56"
                  value={selectAuthored}
                  onChange={(e) => {
                    setSelectedAuthor(e.target.value as "" | "true" | "false");
                    setCurrentPage(1);
                  }}
                  options={
                    registrationTypeOptions.length > 0
                      ? registrationTypeOptions
                      : [
                          { value: "", label: "Semua Jenis Pendaftaran" },
                          { value: "true", label: "Oleh Guru" },
                          { value: "false", label: "Mandiri" },
                        ]
                  }
                  placeholder={"Pilih Jenis Pendaftaran "}
                  isMandatory
                />
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
                  className="w-full lg:w-44"
                />
                <SelectInput
                  value={selectedMajor}
                  onChange={(e) => {
                    setSelectedMajor(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[{ value: "", label: "Semua Jurusan" }, ...majors]}
                  placeholder="Pilih Jurusan"
                  className="w-full lg:w-38"
                />
              </div>
              <TextButton
                variant="outline"
                text="Reset Filter"
                disabled={loadingStates}
                className="w-full font-normal px-2! py-1.5! rouned-md! sm:col-span-2 lg:w-auto mb-2 shrink-0"
                isLoading={loadingStates}
                icon={<IoMdRefresh className="text-lg shrink-0" />}
                onClick={handleResetFilters}
              />
              <Search
                className="w-full mb-2 lg:max-w-sm lg:w-full"
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
              />
            </div>
            <ReusableTable
              columns={columns}
              dataSource={students}
              loading={isLoading}
              error={error || undefined}
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

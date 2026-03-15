"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { Student } from "@/components/Dashboard/StudentsTable";
import Search from "@/components/Filter/Search";
import SelectInput from "@/components/InputForm/SelectInput";
import { SearchableSelect } from "@/components/InputForm/SelectInput/SearchableSelect";
import { BaseModal } from "@/components/Modal/BaseModal";
import { ModalPreviewData } from "@/components/Modal/PreviewDataModal";
import ReusableTable from "@/components/Table/ReusableTable";
import { Column } from "@/components/Table/type";
import { TitleSection } from "@/components/TitleSection/index";
import { useAlert } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/stringFormat";
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

export default function AdminRegisteredByTeacherPage() {
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
  const [teacherResetKey, setTeacherResetKey] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState<string | number | "">(
    "",
  );

  const [selectedMajor, setSelectedMajor] = useState<string | number | "">("");
  // Selected academic year filter
  const [selectedYearId, setSelectedYearId] = useState<string | number | "">(
    "",
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<
    string | number | ""
  >("");

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

  const fetchTeacher = async (
    query: string,
  ): Promise<Array<{ value: string | number; label: string }>> => {
    try {
      const res = await fetch(
        `/api/backoffice/teachers/teacher-lookup?q=${encodeURIComponent(query)}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        },
      );
      const result = await res.json();

      if (!res.ok) {
        // Handle error response
        if (result.errors && Array.isArray(result.errors)) {
          const errorMsg = result.errors[0]?.message || result.message;
          throw new Error(errorMsg);
        }
        throw new Error(result.message || "Gagal mengambil data guru");
      }

      const teachers = Array.isArray(result) ? result : result.data || [];
      return Array.isArray(teachers)
        ? teachers
            .filter((item) => item && item.fullName)
            .map((item) => ({
              value: item.id,
              label: item.fullName,
            }))
        : [];
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data guru";
      throw new Error(message);
    }
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
      router.push(`/admin/spmb/data-calon-murid/${registrationId}/edit`);
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
        params.append("authored", "true");

        if (selectedMajor !== "") {
          params.append("major_code", String(selectedMajor));
        }

        if (selectedTeacherId) {
          params.append("teacher_id", String(selectedTeacherId));
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
    [selectedBatchId, selectedYearId, selectedMajor, selectedTeacherId],
  );

  useEffect(() => {
    fetchStudents(currentPage, debouncedSearchTerm, limit);
  }, [currentPage, debouncedSearchTerm, fetchStudents, limit]);

  const handleResetFilters = () => {
    setSelectedMajor("");
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedBatchId("");
    setSelectedYearId("");
    setSelectedTeacherId("");
    setTeacherResetKey((prev) => prev + 1);
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
        const cachedYears = localStorage.getItem("filterOptions.years");
        const cachedMajors = localStorage.getItem("filterOptions.majors");
        if (cachedMajors) setMajors(JSON.parse(cachedMajors));
        if (cachedYears) setYearsOptions(JSON.parse(cachedYears));
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

        setMajors(majorOpts);
        setYearsOptions(data.years || []);

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
      title: "Tanggal Daftar",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      align: "center",
      render: (value) => formatDate(value as string),
      width: 210,
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
          title="Pendaftaran Siswa Oleh Guru"
          subtitle="Halaman ini akan menampilkan daftar siswa yang didaftarkan oleh bapak/ibu guru di sekolah."
        />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm">
          <div className="p-6 max-sm:p-2 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end mb-3">
              <div className="w-full flex flex-col gap-3 sm:col-span-2 sm:flex-row lg:w-auto">
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
                  className="w-full sm:w-48"
                />
                <SelectInput
                  value={selectedMajor}
                  onChange={(e) => {
                    setSelectedMajor(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[{ value: "", label: "Semua Jurusan" }, ...majors]}
                  placeholder="Pilih Jurusan"
                  className="w-full sm:w-40"
                />
              </div>
              <div className="lg:w-6/10 w-full flex flex-col lg:flex-row gap-3 items-start">
                <SearchableSelect
                  label=""
                  fetchOptions={fetchTeacher}
                  isAddValueActive={false}
                  className="w-full sm:col-span-2 lg:max-w-64"
                  minChars={0}
                  placeholder={"Cari berdasarkan Guru"}
                  isMandatory={false}
                  name={"teacherId"}
                  value={selectedTeacherId}
                  resetKey={teacherResetKey}
                  onChange={(e) => {
                    setSelectedTeacherId(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <TextButton
                  variant="outline"
                  text="Reset"
                  disabled={loadingStates}
                  className="w-full font-normal px-2! py-1.5! rouned-md! sm:col-span-1 lg:w-auto shrink-0"
                  isLoading={loadingStates}
                  icon={<IoMdRefresh className="text-lg shrink-0" />}
                  onClick={handleResetFilters}
                />
                <Search
                  className="w-full sm:col-span-2 lg:max-w-md"
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange}
                />
              </div>
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

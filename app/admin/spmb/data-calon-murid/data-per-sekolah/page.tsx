"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { Student } from "@/components/Dashboard/StudentsTable";
import Search from "@/components/Filter/Search";
import SelectInput from "@/components/InputForm/SelectInput";
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
import { getAuthHeader } from "@/utils/auth";
import { formatMajorLabel } from "@/utils/majorMetadata";
import { downloadRegistrationExport } from "@/utils/downloadRegistrationExport";
import { RegistrationData } from "@/utils/registrationTypes";
import {
  transformFromApiFormat,
  transformRecentRegistrations,
} from "@/utils/transformRegistrationData";
import DownloadDropdown from "@/components/Dropdown/DownloadDropdown";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoMdRefresh, IoMdAdd } from "react-icons/io";
import { LuEye, LuPen, LuTrash2, LuX } from "react-icons/lu";
import { BsArrowLeft } from "react-icons/bs";
import { InputText } from "@/components/InputForm/TextInput";

// Tipe data untuk tab sekolah
interface SchoolTab {
  id: string;
  name: string;
  schoolOrigin: string;
}

export default function AdminProspectiveStudentPage() {
  const { showAlert } = useAlert();

  // State untuk tab sekolah
  const [schoolTabs, setSchoolTabs] = useState<SchoolTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);

  // State untuk pencarian sekolah
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [schoolSearchResults, setSchoolSearchResults] = useState<string[]>([]);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [debouncedSchoolSearchQuery, setDebouncedSchoolSearchQuery] =
    useState("");

  // State untuk konfirmasi hapus tab
  const [deleteTabModalOpen, setDeleteTabModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<SchoolTab | null>(null);
  // State untuk konfirmasi hapus semua tab
  const [deleteAllTabsModalOpen, setDeleteAllTabsModalOpen] = useState(false);

  // State untuk data siswa
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
  const [selectedYearId, setSelectedYearId] = useState<string | number | "">(
    "",
  );
  const [selectedSchoolOrigin, setSelectedSchoolOrigin] = useState<string>("");

  // State untuk filter options
  const [batches, setBatches] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);
  const [majors, setMajors] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);
  const [yearsOptions, setYearsOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);
  const [registrationTypeOptions, setRegistrationTypeOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<RegistrationData | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  // Fungsi untuk hapus semua tab
  const handleDeleteAllTabs = () => {
    setDeleteAllTabsModalOpen(true);
  };

  // Load tabs dari localStorage saat komponen dimount
  useEffect(() => {
    const savedTabs = localStorage.getItem("schoolTabs");
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setSchoolTabs(parsedTabs);
        if (parsedTabs.length > 0) {
          setActiveTab(parsedTabs[0].id);
          setSelectedSchoolOrigin(parsedTabs[0].schoolOrigin);
        }
      } catch (e) {
        console.error("Failed to parse saved tabs", e);
      }
    }
  }, []);

  // Save tabs ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("schoolTabs", JSON.stringify(schoolTabs));
  }, [schoolTabs]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fungsi fetch sekolah
  const fetchSchools = async (query: string) => {
    setIsSearchingSchool(true);
    try {
      const res = await fetch(
        `/api/registrations/school-lookup?q=${encodeURIComponent(query)}`,
      );
      const result = await res.json();
      if (!res.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          const errorMsg = result.errors[0]?.message || result.message;
          setSchoolSearchResults([]);
          setIsSearchingSchool(false);
          return;
        }
        setSchoolSearchResults([]);
        setIsSearchingSchool(false);
        return;
      }
      const schools = result.data || [];
      setSchoolSearchResults(Array.isArray(schools) ? schools : []);
    } catch (error) {
      setSchoolSearchResults([]);
    } finally {
      setIsSearchingSchool(false);
    }
  };

  // Debounce school search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSchoolSearchQuery(schoolSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [schoolSearchQuery]);

  // Trigger fetchSchools otomatis
  useEffect(() => {
    if (debouncedSchoolSearchQuery.length >= 3) {
      fetchSchools(debouncedSchoolSearchQuery);
    } else {
      setSchoolSearchResults([]);
      setIsSearchingSchool(false);
    }
  }, [debouncedSchoolSearchQuery]);

  // Fungsi untuk menambah tab sekolah baru
  const handleAddSchoolTab = () => {
    if (!selectedSchool) {
      showAlert({
        title: "Peringatan",
        description: "Pilih sekolah terlebih dahulu",
        variant: "warning",
      });
      return;
    }

    // Cek apakah sekolah sudah ada di tab
    if (schoolTabs.some((tab) => tab.schoolOrigin === selectedSchool)) {
      showAlert({
        title: "Gagal",
        description: "Sekolah sudah ditambahkan",
        variant: "error",
      });
      return;
    }

    const newTab: SchoolTab = {
      id: Date.now().toString(),
      name: selectedSchool,
      schoolOrigin: selectedSchool,
    };

    const updatedTabs = [...schoolTabs, newTab];
    setSchoolTabs(updatedTabs);
    setActiveTab(newTab.id);
    setSelectedSchoolOrigin(selectedSchool);
    setIsAddSchoolModalOpen(false);
    setSchoolSearchQuery("");
    setSchoolSearchResults([]);
    setSelectedSchool("");

    // Reset ke halaman 1 saat menambah tab baru
    setCurrentPage(1);

    showAlert({
      title: "Berhasil",
      description: "Tab sekolah berhasil ditambahkan",
      variant: "success",
    });
  };

  // Fungsi untuk menghapus tab
  const handleDeleteTab = (tab: SchoolTab) => {
    setTabToDelete(tab);
    setDeleteTabModalOpen(true);
  };

  const confirmDeleteTab = () => {
    if (!tabToDelete) return;

    const newTabs = schoolTabs.filter((tab) => tab.id !== tabToDelete.id);
    setSchoolTabs(newTabs);

    if (activeTab === tabToDelete.id) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
        setSelectedSchoolOrigin(newTabs[0].schoolOrigin);
      } else {
        setActiveTab("");
        setSelectedSchoolOrigin(""); // Reset ke empty string
        // Reset students dan meta
        setStudents([]);
        setMeta(null);
      }
    }

    setDeleteTabModalOpen(false);
    setTabToDelete(null);

    showAlert({
      title: "Berhasil",
      description: "Tab sekolah berhasil dihapus",
      variant: "success",
    });
  };

  const confirmDeleteAllTabs = () => {
    setSchoolTabs([]);
    setActiveTab("");
    setSelectedSchoolOrigin(""); // Reset ke empty string
    // Reset students dan meta
    setStudents([]);
    setMeta(null);
    setDeleteAllTabsModalOpen(false);
    showAlert({
      title: "Berhasil",
      description: "Semua tab sekolah berhasil dihapus",
      variant: "success",
    });
  };

  // Fungsi untuk ganti tab
  const handleTabChange = (tabId: string) => {
    const tab = schoolTabs.find((t) => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      setSelectedSchoolOrigin(tab.schoolOrigin);
      setCurrentPage(1); // Reset ke halaman 1 saat ganti tab
    }
  };

  // Fetch students dengan filter school_origin
  const fetchStudents = useCallback(
    async (page: number, search: string = "", pageLimit: number = 10) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageLimit.toString(),
        });

        if (search) params.append("search", search);
        if (selectedBatchId) params.append("batch_id", String(selectedBatchId));
        if (selectedYearId)
          params.append("academic_year_id", String(selectedYearId));
        if (selectAuthored !== "") params.append("authored", selectAuthored);
        if (selectedMajor !== "")
          params.append("major_code", String(selectedMajor));

        // HANYA tambahkan school_origin jika ada nilai dan tidak empty
        if (selectedSchoolOrigin && selectedSchoolOrigin.trim() !== "") {
          params.append("school_origin", selectedSchoolOrigin);
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
    [
      selectedBatchId,
      selectAuthored,
      selectedYearId,
      selectedMajor,
      selectedSchoolOrigin,
    ],
  );

  useEffect(() => {
    // Reset data jika tidak ada selectedSchoolOrigin
    if (!selectedSchoolOrigin || selectedSchoolOrigin.trim() === "") {
      setStudents([]);
      setMeta(null);
      setIsLoading(false);
      return;
    }

    // Fetch hanya jika ada selectedSchoolOrigin
    fetchStudents(currentPage, debouncedSearchTerm, limit);
  }, [
    currentPage,
    debouncedSearchTerm,
    fetchStudents,
    limit,
    selectedSchoolOrigin,
  ]);

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch(`/api/filters/options`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!res.ok) return;

        const data = await res.json();

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

        setBatches(batchOpts);
        setYearsOptions(data.years || []);
        setRegistrationTypeOptions(data.registrationTypes || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };

    loadOptions();
  }, []);

  // Load major options
  useEffect(() => {
    const loadMajorOptions = async () => {
      try {
        const response = await fetch(`/api/alumni/major-options`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const majorOpts = (data || []).map(
          (major: { name: string; abbreviation: string }, index: number) => ({
            value: major.abbreviation,
            label: formatMajorLabel(
              {
                name: major.name,
                abbreviation: major.abbreviation,
              },
              index,
            ),
          }),
        );

        setMajors(majorOpts);
      } catch (error) {
        console.error("Failed to load major options", error);
      }
    };

    loadMajorOptions();
  }, []);

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
    setCurrentPage(1);
  };

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
        fetchStudents(currentPage, debouncedSearchTerm, limit);
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

  const handleRouteDetail = async (registrationId: number) => {
    setIsRouting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 750));
      sessionStorage.setItem(
        "returnUrl",
        window.location.pathname + window.location.search,
      );
      router.push(`/admin/spmb/data-calon-murid/${registrationId}/edit`);
    } finally {
      setIsRouting(false);
    }
  };

  const handleDetailClick = async (registrationId: number) => {
    setLoadingDetail(true);
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
      } else {
        const errorData = await response.json();
        showAlert({
          title: "Terjadi Kesalahan",
          description:
            errorData.message || "Gagal mengambil data detail pendaftaran",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch registration details:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Terjadi kesalahan saat mengambil data detail",
        variant: "error",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownload = useCallback(
    async (type: "pdf" | "xlsx") => {
      setIsExporting(true);
      try {
        // Generate filename with selectedSchoolOrigin if present
        let filename = "Data Calon Murid";
        if (selectedSchoolOrigin && selectedSchoolOrigin.trim() !== "") {
          // Remove special chars and limit length for filename safety
          const safeSchool = selectedSchoolOrigin
            .replace(/[^a-zA-Z0-9\-_ ]/g, "")
            .replace(/\s+/g, "_")
            .slice(0, 40);
          filename = `Data Calon Murid_${safeSchool}`;
        }
        await downloadRegistrationExport({
          type,
          filename,
          filters: {
            search: debouncedSearchTerm,
            batchId: selectedBatchId,
            academicYearId: selectedYearId,
            authored: selectAuthored,
            majorCode: selectedMajor,
            schoolOrigin: selectedSchoolOrigin,
          },
        });

        showAlert({
          title: "Berhasil",
          description: `${type === "pdf" ? "PDF" : "Excel"} Data Calon Murid berhasil diunduh.`,
          variant: "success",
          autoDismissMs: 2500,
        });
      } catch (error) {
        console.error(`Failed to export ${type}:`, error);
        showAlert({
          title: "Gagal",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengunduh data.",
          variant: "error",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [
      debouncedSearchTerm,
      selectAuthored,
      selectedBatchId,
      selectedMajor,
      selectedYearId,
      selectedSchoolOrigin,
      showAlert,
    ],
  );

  const loadingStates = isLoading || isRouting || loadingDetail;

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
    },
  ];

  const routerToDataCalonMurid = () => {
    router.push("/admin/spmb/data-calon-murid");
  };

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TextButton
          variant="outline"
          icon={<BsArrowLeft className="text-xl" />}
          onClick={routerToDataCalonMurid}
        />
        <TitleSection
          title="Calon Murid Pada Tiap SMP/MTs"
          subtitle="Menampilkan halaman daftar lengkap calon murid berdasarkan SMP/MTs"
        />

        {/* Tab Sekolah */}
        <div className="w-full bg-transparent rounded-t-md drop-shadow-sm mt-4">
          <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
            {schoolTabs.map((tab) => (
              <div
                key={tab.id}
                className={`group relative flex items-center min-w-50 max-w-75 ${
                  activeTab === tab.id
                    ? "bg-green-50 border-b-2 border-primary"
                    : "bg-gray-50 hover:bg-gray-100"
                } rounded-t-lg transition-colors`}
              >
                <button
                  onClick={() => handleTabChange(tab.id)}
                  className="flex-1 px-4 py-2 text-left truncate"
                  title={tab.name}
                >
                  <span className="text-xs font-medium">{tab.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteTab(tab)}
                  className="absolute right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-full transition-opacity"
                  title="Hapus tab"
                >
                  <LuX className="text-red-500 text-sm" />
                </button>
              </div>
            ))}
            <Tooltip>
              <TooltipTrigger>
                <TextButton
                  onClick={() => setIsAddSchoolModalOpen(true)}
                  className="text-xs!"
                  icon={<IoMdAdd className="text-lg" />}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>Tambah Tab Sekolah</p>
              </TooltipContent>
            </Tooltip>
            {schoolTabs.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <TextButton
                    variant="outline-danger"
                    className="text-xs! ml-2"
                    icon={<LuTrash2 className="text-lg" />}
                    onClick={handleDeleteAllTabs}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Hapus Semua Tab</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {/* Modal Hapus Semua Tab */}
          <BaseModal
            isOpen={deleteAllTabsModalOpen}
            onClose={() => setDeleteAllTabsModalOpen(false)}
            title="Konfirmasi Hapus Semua Tab"
            footer={
              <div className="flex justify-end gap-2">
                <TextButton
                  variant="outline"
                  text="Batal"
                  onClick={() => setDeleteAllTabsModalOpen(false)}
                />
                <TextButton
                  text="Hapus Semua"
                  variant="danger"
                  onClick={confirmDeleteAllTabs}
                />
              </div>
            }
          >
            <p>Anda yakin ingin menghapus semua tab sekolah?</p>
            <p>Data tidak akan hilang, hanya tab yang dihapus.</p>
          </BaseModal>
        </div>

        {/* Konten Utama */}
        <div className="w-full h-fit bg-white rounded-b-md drop-shadow-sm">
          <div className="p-2 max-sm:p-2">
            {/* Filter dan Aksi - hanya tampilkan jika ada selectedSchoolOrigin */}
            {selectedSchoolOrigin && selectedSchoolOrigin.trim() !== "" && (
              <div className="flex w-auto flex-wrap flex-col gap-4 lg:flex-row lg:items-center lg:justify-end mb-3">
                <DownloadDropdown
                  disabled={isLoading}
                  loading={isExporting}
                  onDownloadExcel={() => handleDownload("xlsx")}
                  onDownloadPdf={() => handleDownload("pdf")}
                />
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
                  className="w-full lg:w-44"
                  disabled={isLoading}
                />
                <SelectInput
                  className="w-full lg:w-52"
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
                  disabled={isLoading}
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
                  className="w-full lg:w-40"
                  disabled={isLoading}
                />
                <SelectInput
                  value={selectedMajor}
                  onChange={(e) => {
                    setSelectedMajor(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[{ value: "", label: "Semua Jurusan" }, ...majors]}
                  placeholder="Pilih Jurusan"
                  className="w-full lg:w-35"
                  disabled={isLoading}
                />
                <TextButton
                  variant="outline"
                  text="Reset"
                  disabled={loadingStates}
                  className="w-full font-normal text-sm! px-2! py-1.5! rouned-md! sm:col-span-2 lg:w-auto mb-2 shrink-0"
                  isLoading={loadingStates}
                  icon={<IoMdRefresh className="text-lg shrink-0" />}
                  onClick={handleResetFilters}
                />
                <Search
                  className="w-full mb-2 lg:max-w-58 lg:w-full"
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange}
                  placeholder="nama / no daftar / sekolah"
                />
              </div>
            )}

            {/* Tabel Data */}
            {!selectedSchoolOrigin || selectedSchoolOrigin.trim() === "" ? (
              <div className="flex flex-col justify-center items-center text-center py-12 min-h-72 text-gray-500">
                <p className="text-lg">Belum ada sekolah yang dipilih</p>
                <p className="text-sm mt-2">
                  Klik tombol{" "}
                  <span className="font-semibold">"+ (Tambah Sekolah)"</span>{" "}
                  untuk memulai
                </p>
              </div>
            ) : (
              <ReusableTable
                columns={columns}
                dataSource={students}
                loading={isLoading}
                error={error || undefined}
                emptyText={isLoading ? "Memuat data..." : "Data Tidak Ada"}
                rowKey="id"
                serverSidePagination={true}
                tableLayout="fixed"
                pagination={
                  meta
                    ? {
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
                      }
                    : false
                }
                scroll={{ y: 600 }}
              />
            )}

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
                    text="Hapus"
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

            {/* Modal Hapus Tab */}
            <BaseModal
              isOpen={deleteTabModalOpen}
              onClose={() => setDeleteTabModalOpen(false)}
              title="Konfirmasi Hapus Tab"
              footer={
                <div className="flex justify-end gap-2">
                  <TextButton
                    variant="outline"
                    text="Batal"
                    onClick={() => setDeleteTabModalOpen(false)}
                  />
                  <TextButton
                    text="Hapus"
                    variant="danger"
                    onClick={confirmDeleteTab}
                  />
                </div>
              }
            >
              <p>Anda yakin ingin menghapus tab</p>
              <p className="font-semibold">{tabToDelete?.name}?</p>
              <p>Data tidak akan hilang, hanya tab yang dihapus.</p>
            </BaseModal>

            {/* Modal Tambah Sekolah */}
            <BaseModal
              isOpen={isAddSchoolModalOpen}
              onClose={() => {
                setIsAddSchoolModalOpen(false);
                setSchoolSearchQuery("");
                setSchoolSearchResults([]);
                setSelectedSchool("");
              }}
              title="Tambah Sekolah"
              size="md"
              footer={
                <div className="flex justify-end gap-2">
                  <TextButton
                    variant="outline"
                    text="Batal"
                    onClick={() => {
                      setIsAddSchoolModalOpen(false);
                      setSchoolSearchQuery("");
                      setSchoolSearchResults([]);
                      setSelectedSchool("");
                    }}
                  />
                  <TextButton
                    text="Tambah"
                    variant="primary"
                    onClick={handleAddSchoolTab}
                    disabled={!selectedSchool}
                  />
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cari Sekolah (min. 3 karakter)
                  </label>
                  <InputText
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder="Masukkan nama sekolah..."
                    label={""}
                    name={""}
                  />
                </div>

                {isSearchingSchool && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600" />
                  </div>
                )}

                {!isSearchingSchool && schoolSearchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {schoolSearchResults.map((school, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSchool(school)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                          selectedSchool === school ? "bg-blue-100" : ""
                        } ${index !== 0 ? "border-t border-gray-200" : ""}`}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                )}

                {!isSearchingSchool &&
                  schoolSearchQuery.length >= 3 &&
                  schoolSearchResults.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Tidak ada sekolah ditemukan
                    </p>
                  )}

                {schoolSearchQuery.length < 3 &&
                  schoolSearchQuery.length > 0 && (
                    <p className="text-sm text-yellow-600">
                      Minimal 3 karakter untuk mencari
                    </p>
                  )}
              </div>
            </BaseModal>
          </div>
        </div>
      </div>
    </div>
  );
}

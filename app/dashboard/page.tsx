"use client";

import { useAuth } from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { getAuthHeader, getCurrentUser } from "@/utils/auth";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { TextButton } from "@/components/Buttons/TextButton";
import { HiUserGroup } from "react-icons/hi";
import {
  FaCalendarDay,
  FaCalendarWeek,
} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { ModalPreviewData } from "@/components/Modal/PreviewDataModal";
import { RegistrationData } from "@/utils/registrationTypes";
import {
  transformFromApiFormat,
  transformRecentRegistrations,
} from "@/utils/transformRegistrationData";
import { useAlert } from "@/components/ui/alert";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import dayjs from "dayjs";
import "dayjs/locale/id";
import SelectInput from "@/components/InputForm/SelectInput";
import { Student } from "@/components/Dashboard";
import Search from "@/components/Filter/Search";

export function GreetingCard() {
  const { user } = useAuth();
  const greeting =
    dayjs().hour() < 10
      ? "Selamat Pagi"
      : dayjs().hour() < 15
        ? "Selamat Siang"
        : dayjs().hour() < 18
          ? "Selamat Sore"
          : "Selamat Malam";
  return (
    <div
      id="greeting-card"
      className="w-full rounded-xl p-6 flex flex-col justify-center items-center gap-2"
    >
      <h1 className="text-2xl font-semibold text-gray-800">
        {greeting}, {user?.fullName || "User"} 👋🏻
      </h1>
      <h2 className="text-base text-gray-500">
        Lihat data penerimaan murid baru Anda!
      </h2>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  isLoading,
}: StatCardProps) {
  return (
    <div className="bg-white w-full rounded-lg shadow-sm p-6 flex items-center gap-4">
      <div
        className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        <span className={color}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
        ) : (
          <span className="text-3xl font-bold text-gray-800">{value}</span>
        )}
      </div>
    </div>
  );
}

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        {
          title: "Total Pendaftar",
          icon: HiUserGroup,
          value: stats?.registration_total_count ?? 0,
        },
        {
          title: "Pendaftar Hari Ini",
          icon: FaCalendarDay,
          value: stats?.daily_registration_count ?? 0,
        },
        {
          title: "Pendaftar Minggu Ini",
          icon: FaCalendarWeek,
          value: stats?.weekly_registration_count ?? 0,
        },
      ].map((stats) => (
        <StatCard
          key={stats.title}
          title={stats.title}
          value={stats?.value ?? 0}
          icon={<stats.icon className="text-3xl" />}
          color="text-primary"
          bgColor="bg-primary-light"
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export function StudentDataTable() {
  const { showAlert } = useAlert();

  const [students, setStudents] = useState<Student[]>([]);
  console.log("Students state:", students);
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
  const [batches, setBatches] = useState<
    Array<{ value: string | number; label: string; disabled?: boolean }>
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<RegistrationData | null>(
    null,
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750); // 750ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filter options from cached server endpoint (batches etc.)
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const res = await fetch(`/api/filters/options`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const opts = (data.batches || []).map(
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
        if (cancelled) return;
        setBatches(opts);
        try {
          localStorage.setItem("filterOptions.batches", JSON.stringify(opts));
        } catch (e) {}
      } catch (err) {
        console.error("Failed to fetch filter options, fallback cache", err);
        try {
          const cached = localStorage.getItem("filterOptions.batches");
          if (cached) setBatches(JSON.parse(cached));
        } catch (e) {}
      }
    };
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchStudents = async (
    page: number,
    search: string = "",
    pageLimit: number = 10,
  ) => {
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
  };

  useEffect(() => {
    fetchStudents(currentPage, debouncedSearchTerm, limit);
  }, [currentPage, debouncedSearchTerm, limit, selectedBatchId]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

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
      title: "Nama Murid",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
      width: 200,
    },
    {
      title: "No. Pendaftaran",
      dataIndex: "registrationId",
      key: "registrationId",
      sorter: true,
      align: "center",
      width: 120,
    },
    {
      title: "Gelombang Pendaftaran",
      dataIndex: "registrationBatchId",
      key: "registrationBatchId",
      sorter: true,
      align: "center",
      width: 120,
    },
    {
      title: "Waktu Pendaftaran",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) =>
        dayjs(value as string | number | Date | null | undefined)
          .locale("id")
          .format("DD MMMM YYYY, HH:mm"),
      sorter: true,
      width: 240,
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
      width: "10rem",
    },
    {
      title: "Asal SMP/MTs",
      dataIndex: "schoolOriginName",
      key: "schoolOriginName",
      sorter: true,
      width: 200,
    },
    {
      title: "Aksi",
      dataIndex: "registrationId",
      key: "actions",
      render: (value) => (
        <div className="flex justify-center">
          <TextButton
            text={"Detail"}
            isLoading={loadingDetail}
            variant="primary"
            className="w-fit py-1 px-3 text-xs"
            disabled={loadingDetail}
            onClick={() => handleDetailClick(Number(value))}
          />
        </div>
      ),
      align: "center",
      width: 120,
    },
  ];

  return (
    <div className="bg-white max-w-screen rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 max-sm:p-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Data Murid Terdaftar
            </h3>
          </div>
          {/* Search Filter */}
          <div className="w-fit flex flex-row gap-3">
            <div className="w-48">
              <SelectInput
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  setCurrentPage(1);
                }}
                options={[{ value: "", label: "Semua Gelombang" }, ...batches]}
                placeholder="Pilih Gelombang"
                className="w-48"
              />
            </div>
            <Search
              className="w-full sm:w-100"
              searchTerm={searchTerm}
              handleSearchChange={setSearchTerm}
            />
          </div>
        </div>
      </div>

      <ReusableTable
        columns={columns}
        dataSource={students}
        loading={isLoading}
        error={error || undefined}
        emptyText="Data Tidak Ada"
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
        rowKey="id"
        serverSidePagination={true}
        tableLayout="fixed"
        scroll={{ y: 400 }}
      />
      {/* )} */}
      <ModalPreviewData
        title="Detail Data Pendaftaran Murid"
        footer={null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedData || undefined}
      />
    </div>
  );
}

interface DashboardStats {
  registration_total_count: number;
  daily_registration_count: number;
  weekly_registration_count: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  if (user?.role === "admin") {
    return null; // Akan redirect
  }

  return (
    <div className="w-full max-w-screen h-full min-h-screen space-y-6 p-10 pb-30 max-sm:p-2">
      <GreetingCard />
      <StatsGrid />
      <StudentDataTable />
    </div>
  );
}

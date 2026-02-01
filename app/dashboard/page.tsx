"use client";

import { useAuth } from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { getAuthHeader, getCurrentUser } from "@/utils/auth";
import { Student } from "@/components/Dashboard/StudentsTable";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { TextButton } from "@/components/Buttons/TextButton";
import { HiUserGroup } from "react-icons/hi";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { ModalPreviewData } from "@/components/Modal/PreviewDataModal";
import { RegistrationData } from "@/utils/registrationTypes";
import { transformFromApiFormat } from "@/utils/transformRegistrationData";
import { useAlert } from "@/components/ui/alert";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import dayjs from "dayjs";
import "dayjs/locale/id";

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
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
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

      const response = await fetch(`/api/students?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "E_UNAUTHORIZED_ACCESS") {
          setError("Anda tidak memiliki akses. Silakan login kembali.");
        } else {
          setError(data.message || "Gagal mengambil data siswa");
        }
        return;
      }

      setStudents(data.data);
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
  }, [currentPage, debouncedSearchTerm, limit]);

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
      width: 200,
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
        <TextButton
          text={loadingDetail ? "Memuat..." : "Detail"}
          variant="primary"
          disabled={loadingDetail}
          onClick={() => handleDetailClick(Number(value))}
        />
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
          <div className="relative w-full sm:w-100">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMagnifyingGlass className="text-lg text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama / nomor pendaftaran / atau asal sekolah..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block max-sm:placeholder:text-xs w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          dataSource={students}
          loading={isLoading}
          emptyText="Belum ada data siswa terdaftar"
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
          // className="p-6"
          serverSidePagination={true}
          tableLayout="fixed"
          scroll={{ y: 400 }}
        />
      )}
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

"use client";

import dayjs from "dayjs";
import { useAuth } from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { getAuthHeader } from "@/utils/auth";
import { StudentsTable, Student } from "@/components/Dashboard/StudentsTable";
import { Pagination, PaginationMeta } from "@/components/Dashboard/Pagination";
import { HiUserGroup } from "react-icons/hi";
import { FaCalendarDay, FaCalendarWeek } from "react-icons/fa6";

interface DashboardStats {
  registration_total_count: number;
  daily_registration_count: number;
  weekly_registration_count: number;
}

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
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
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
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);

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

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  function handlePageChange(page: number): void {
    setCurrentPage(page);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Data Murid Terdaftar
            </h3>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-100">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari Nama / nomor pendaftaran / atau asal sekolah..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
        <>
          <div className="p-6">
            <StudentsTable students={students} isLoading={isLoading} />
          </div>
          {meta && !isLoading && (
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="w-full h-full min-h-screen space-y-6">
      <GreetingCard />
      <StatsGrid />
      <StudentDataTable />
    </div>
  );
}

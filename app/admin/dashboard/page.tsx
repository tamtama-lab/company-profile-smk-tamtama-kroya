"use client";

import { useAuth } from "@/components/AuthGuard";
import StatsCard from "@/components/Card/StatsCard";
import { getAuthHeader } from "@/utils/auth";
import dayjs from "dayjs";
import { formatRelativeTime } from "@/utils/relativeTimeFormat";
import { useEffect, useState } from "react";
import { FiUser, FiUsers } from "react-icons/fi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { MdOutlineToday } from "react-icons/md";
import AreaChart from "@/components/Chart/AreaChart";
import PieChart from "@/components/Chart/PieChart";
import { transformRecentRegistrations } from "@/utils/transformRegistrationData";
import { PaginationMeta, Student } from "@/components/Dashboard";
import { TextButton } from "@/components/Buttons/TextButton";
import { RegistrationData } from "@/utils/registrationTypes";
import { transformFromApiFormat } from "@/utils/transformRegistrationData";
import { useAlert } from "@/components/ui/alert";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import { ModalPreviewData } from "@/components/Modal/PreviewDataModal";
import { BaseModal } from "@/components/Modal/BaseModal";
import Skeleton from "@/components/Skeleton";
import { LuEye, LuPen, LuTrash2 } from "react-icons/lu";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      className="w-full py-4 rounded-xl flex flex-col justify-center items-start gap-2"
    >
      <h1 className="text-xl font-semibold text-gray-800">
        {greeting}, {user?.fullName || "User"} 👋🏻
      </h1>
      <h2 className="text-sm text-gray-500">
        Lihat statistik data terbaru pendaftaran calon murid baru SMK Tamtama
        Kroya tahun ajaran 2025/2026
      </h2>
    </div>
  );
}

interface DashboardStats {
  registration_total_count: number;
  daily_registration_count: number;
  weekly_registration_count: number;
  registrations_by_teacher: number;
  registrations_independent: number;
}

export default function AdminDashboardPage() {
  // const router = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>(
    [],
  );
  const [majorTrendData, setMajorTrendData] = useState<
    { date: string; count: number }[]
  >([]);

  const { showAlert } = useAlert();

  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<RegistrationData | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRegistrationTrend = async () => {
      try {
        const response = await fetch(`/api/admin/registration-trend`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTrendData(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        showAlert({
          title: "Terjadi Kesalahan",
          description: "Gagal mengambil data tren pendaftaran",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationTrend();
  }, [showAlert]);

  useEffect(() => {
    const fetchMajorTrend = async () => {
      try {
        const response = await fetch(`/api/admin/major-trend`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMajorTrendData(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMajorTrend();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/admin/stats`, {
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

  const statsData = [
    {
      title: "Total Pendaftar",
      icon: FiUsers,
      amount: stats?.registration_total_count ?? 0,
      isFirstUnique: true,
    },
    {
      title: "Pendaftar Hari Ini",
      icon: MdOutlineToday,
      amount: stats?.daily_registration_count ?? 0,
    },
    {
      title: "Pendaftar Oleh Guru",
      icon: LiaChalkboardTeacherSolid,
      amount: stats?.registrations_by_teacher ?? 0,
    },
    {
      title: "Pendaftar Mandiri",
      icon: FiUser,
      amount: stats?.registrations_independent ?? 0,
    },
  ];

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

      const response = await fetch(
        `/api/admin/recent-registrations?${params.toString()}`,
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

      try {
        const transformed = transformRecentRegistrations(
          data.data || data || [],
        );
        console.log("Transformed data:", transformed);
        setStudents(transformed);
      } catch (transformError) {
        console.error("Error during transformation:", transformError);
        setError("Gagal memproses data siswa");
        return;
      }
      setMeta(data.meta);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError("Terjadi kesalahan saat mengambil data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteDetail = (registrationId: number) => {
    window.location.href = `/admin/ppdb/data-calon-murid/${registrationId}/edit`;
  };

  useEffect(() => {
    fetchStudents(currentPage, "", limit);
  }, [currentPage, limit]);

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
      title: "Waktu Pendaftaran",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (value) =>
        formatRelativeTime(value as string | number | Date | null | undefined),
      sorter: true,
      width: 240,
    },
    {
      title: "Gelombang Pendaftaran",
      dataIndex: "registrationBatchId",
      key: "registrationBatchId",
      sorter: true,
      align: "center",
      width: 120,
      render: (value, record) => record.registrationBatchId,
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
                isLoading={loadingDetail}
                variant="outline-warning"
                className="w-fit py-1 px-2! border-2"
                disabled={loadingDetail}
                onClick={() => handleDetailClick(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Detail Data Murid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuPen className="text-xl" />}
                isLoading={loadingDetail}
                variant="outline-info"
                className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                disabled={loadingDetail}
                onClick={() => handleRouteDetail(Number(value))}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Edit Data Murid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuTrash2 className="text-xl" />}
                isLoading={loadingDetail}
                variant="outline-danger"
                className="w-fit py-1 px-2! border-2"
                disabled={loadingDetail}
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
    <div className="w-full max-w-screen min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full w-full">
        <GreetingCard />
        <StatsCard data={statsData} isLoading={isLoading} />
        <div className="w-full grid grid-cols-5 max-lg:grid-cols-1 max-md:grid-cols-1 max-sm:grid-cols-1 gap-4 max-lg:gap-x-0 max-md:gap-x-0 max-sm:gap-x-0 mb-4">
          <div className="w-full h-full col-span-3 drop-shadow-sm rounded-xl bg-white ">
            <h3 className="text-base font-medium text-gray-700 mb-2 p-4">
              Grafik Pendaftaran
            </h3>
            <div className="w-full flex flex-row gap-4 justify-center px-4">
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <AreaChart data={trendData} />
              )}
            </div>
          </div>
          <div className="w-full h-full col-span-2 max-md:grid-cols-1 max-sm:grid-cols-1 mb-4">
            <div className="w-full h-full drop-shadow-sm rounded-xl bg-white ">
              <h3 className="text-base font-medium text-gray-700 mb-2 p-4">
                Grafik Pendaftaran per Jurusan
              </h3>
              <div className="w-full flex flex-row gap-4 justify-center px-4">
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <PieChart data={majorTrendData} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-fit p-4 bg-white rounded-xl shadow-sm">
          <div className="w-full h-fit flex flex-row justify-between items-center py-4">
            <h3 className="text-xl font-medium text-gray-700">
              Pendaftaran Terbaru
            </h3>
            <Link
              className="text-primary text-sm hover:underline"
              href="/admin/ppdb/data-calon-murid"
            >
              Lihat Selengkapnya
            </Link>
          </div>
          <ReusableTable
            columns={columns}
            dataSource={students}
            loading={isLoading}
            emptyText="Data Tidak Ada"
            rowKey="id"
            serverSidePagination={true}
            tableLayout="fixed"
            scroll={{ y: 400 }}
          />
        </div>
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
  );
}

"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import StatsMajorCard from "@/components/Card/StatsCard/StatCardMajors";
import { PaginationMeta } from "@/components/Dashboard/Pagination";
import { Student } from "@/components/Dashboard/StudentsTable";
import SelectInput from "@/components/InputForm/SelectInput";
import ReusableTable, { Column } from "@/components/Table/ReusableTable";
import { TitleSection } from "@/components/TitleSection/index";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import { RegistrationData } from "@/utils/registrationTypes";
import { transformRecentRegistrations } from "@/utils/transformRegistrationData";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { LuEye, LuPen, LuTrash2 } from "react-icons/lu";

export default function AdminStatisticPage() {
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

  useEffect(() => {
    fetchStudents(currentPage, "", limit);
  }, [currentPage, limit]);

  const statsData = [
    {
      title: "Total Pendaftar",
      amount: 1120,
      isFirstUnique: true,
    },
    {
      title: "Jurusan TKR",
      amount: 120,
    },
    {
      title: "Jurusan DKV",
      amount: 80,
    },
    {
      title: "Jurusan TITL",
      amount: 90,
    },
    {
      title: "Jurusan TP",
      amount: 120,
    },
  ];

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
          <TextButton
            icon={<LuEye className="text-xl" />}
            isLoading={loadingDetail}
            variant="outline-warning"
            className="w-fit py-1 px-2! border-2"
            disabled={loadingDetail}
          />
          <TextButton
            icon={<LuPen className="text-xl" />}
            isLoading={loadingDetail}
            variant="outline-info"
            className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
            disabled={loadingDetail}
          />
          <TextButton
            icon={<LuTrash2 className="text-xl" />}
            isLoading={loadingDetail}
            variant="outline-danger"
            className="w-fit py-1 px-2! border-2"
            disabled={loadingDetail}
          />
        </div>
      ),
      // width: 120,
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Data Pendaftar Sekolah"
          subtitle="Menampilkan daftar lengkap calon murid yang telah melakukan <br /> pendaftaran baik secara mandiri maupun melalui guru."
        />
        <StatsMajorCard data={statsData} isLoading={false} />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm">
          <div className="p-6 max-sm:p-2 border-b border-gray-200">
            <div className="flex flex-col items-center justify-center md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-row gap-3 justify-center items-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Tahun Ajaran
                </h3>
                <SelectInput
                  options={[
                    { value: "1", label: "2026/2027" },
                    { value: "2", label: "2027/2028" },
                  ]}
                  placeholder={"Pilih Tahun Ajaran "}
                  isMandatory
                />
                <SelectInput
                  options={[
                    { value: "1", label: "Semua Jenis Pendaftaran" },
                    { value: "2", label: "Mandiri" },
                    { value: "3", label: "Oleh Guru" },
                  ]}
                  placeholder={"Pilih Jenis Pendaftaran "}
                  isMandatory
                />
              </div>
              {/* Search Filter */}
              <div className="relative w-full sm:w-100 mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMagnifyingGlass className="text-lg text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nama / nomor pendaftaran / atau asal sekolah..."
                  // value={""}
                  // onChange={(e) => handleSearchChange(e.target.value)}
                  className="block max-sm:placeholder:text-xs w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
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
              scroll={{ y: 400 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

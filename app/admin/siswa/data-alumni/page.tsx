"use client";

import GridListPaginate from "@/components/GridListPaginate";
import { TitleSection } from "@/components/TitleSection/index";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlumniApiResponse, AlumniItem, YEAR_OPTIONS_LIMIT } from "./type";
import Toggle from "@/components/ui/toggle";
import { TextButton } from "@/components/Buttons/TextButton";
import { LuPen, LuTrash2 } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BaseModal } from "@/components/Modal/BaseModal";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/utils/auth";
import { useAlert } from "@/components/ui/alert";
import Search from "@/components/Filter/Search";
import SelectInput from "@/components/InputForm/SelectInput";
import { IoMdRefresh } from "react-icons/io";
import { SearchableSelect } from "@/components/InputForm/SelectInput/SearchableSelect";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_MIN = 1977;

const sortByOptions = [
  { value: "createdAt", label: "Urutkan: Tanggal Dibuat" },
  { value: "name", label: "Urutkan: Nama" },
  { value: "generationYear", label: "Urutkan: Angkatan" },
];

const sortOrderOptions = [
  { value: "desc", label: "Urutan: Terbaru / Z-A" },
  { value: "asc", label: "Urutan: Terlama / A-Z" },
];

const MAJOR_LABEL_MAP: Record<string, string> = {
  TP: "Teknik Permesinan",
  TKR: "Teknik Kendaraan Ringan",
  TITL: "Teknik Instalasi Tenaga Listrik",
  DKV: "Desain Komunikasi Visual",
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    return lowered === "true" || lowered === "1";
  }
  return false;
};

export default function DataAlumniPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedGenerationYear, setSelectedGenerationYear] =
    useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [majorOptions, setMajorOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([]);
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const yearFilterOptions = useMemo(
    () => [
      { value: "", label: "Semua Angkatan" },
      ...Array.from({ length: CURRENT_YEAR - YEAR_MIN }, (_, index) => {
        const year = CURRENT_YEAR - 1 - index;
        return { value: String(year), label: String(year) };
      }),
    ],
    [],
  );

  const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sortBy,
        sortOrder,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      if (selectedMajor) {
        params.append("major", selectedMajor);
      }
      if (selectedGenerationYear) {
        params.append("generationYear", selectedGenerationYear);
      }

      const response = await fetch(
        `/api/backoffice/alumni?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data alumni");
      }

      const result: AlumniApiResponse = await response.json();

      setAlumni(
        (result.data || []).map((item) => ({
          ...item,
          isPublished: normalizeBoolean(item.isPublished),
        })),
      );
      setTotal(result.meta?.total || 0);
      setCurrentPage(result.meta?.currentPage || currentPage);
      setLimit(result.meta?.perPage || limit);
    } catch (error) {
      console.error("Failed fetch alumni", error);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data alumni",
        variant: "error",
      });
      setAlumni([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    sortBy,
    sortOrder,
    debouncedSearchTerm,
    selectedMajor,
    selectedGenerationYear,
    showAlert,
  ]);

  useEffect(() => {
    let cancelled = false;

    const fetchMajors = async () => {
      setIsLoadingMajors(true);
      try {
        const response = await fetch("/api/filters/options", {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal memuat data jurusan");
        }

        const data = await response.json();
        const mappedMajors = (data.majors || []).map(
          (major: { name: string; abbreviation: string }) => ({
            value: major.abbreviation,
            label: `${major.name} (${major.abbreviation})`,
          }),
        );

        if (!cancelled) {
          setMajorOptions([
            { value: "", label: "Semua Jurusan" },
            ...mappedMajors,
          ]);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
        if (!cancelled) {
          showAlert({
            title: "Gagal",
            description: "Gagal memuat daftar jurusan",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMajors(false);
        }
      }
    };

    fetchMajors();

    return () => {
      cancelled = true;
    };
  }, [showAlert]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    selectedMajor,
    selectedGenerationYear,
    sortBy,
    sortOrder,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedMajor("");
    setSelectedGenerationYear("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const paginationConfig = useMemo(
    () => ({
      current: currentPage,
      pageSize: limit,
      total,
      onChange: (page: number, pageSize: number) => {
        setCurrentPage(page);
        setLimit(pageSize);
      },
      showSizeChanger: true,
      onShowSizeChange: (_page: number, pageSize: number) => {
        setCurrentPage(1);
        setLimit(pageSize);
      },
    }),
    [currentPage, limit, total],
  );

  const handleTogglePublish = async (
    item: AlumniItem,
    isPublished: boolean,
  ) => {
    try {
      const response = await fetch(`/api/backoffice/alumni/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: item.name,
          major: item.major,
          generationYear: item.generationYear,
          photoUrl: item.photoUrl,
          currentJob: item.currentJob,
          isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah visibilitas alumni");
      }

      setAlumni((prev) =>
        prev.map((current) =>
          current.id === item.id ? { ...current, isPublished } : current,
        ),
      );
      showAlert({
        title: "Berhasil",
        description: `Visibilitas alumni berhasil diubah menjadi ${
          isPublished ? "ditampilkan" : "disembunyikan"
        }`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed update visibility", error);
      showAlert({
        title: "Gagal",
        description: "Gagal mengubah visibilitas alumni",
        variant: "error",
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/backoffice/alumni/${deletingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus data alumni");
      }

      showAlert({
        title: "Berhasil",
        description: "Data alumni berhasil dihapus",
        variant: "success",
      });
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchAlumni();
    } catch (error) {
      console.error("Failed delete alumni", error);
      showAlert({
        title: "Gagal",
        description: "Gagal menghapus data alumni",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = (item: AlumniItem, _: number) => {
    const majorAbbr = item.major;
    const majorName = MAJOR_LABEL_MAP[item.major] || item.major;

    return (
      <div className="rounded-lg h-28 flex flex-row items-center justify-between border border-gray-300 shadow-2xs p-2 gap-4">
        <div className="h-full flex flex-row items-center gap-4 ">
          <img
            src={item.photoUrl}
            alt={item.name}
            // height={100}
            // width={100}
            className="w-auto h-full border border-gray-300 aspect-video bg-gray-300 rounded-lg object-cover"
          />
          <div>
            <p className="text-base font-semibold text-gray-800 mb-3">
              {item.name}
            </p>
            <div className="w-full flex flex-row items-center gap-4">
              <p className="text-base italic text-gray-800">
                {majorName} ({majorAbbr})
              </p>{" "}
              <span className="text-gray-300">|</span>
              <p className="text-base italic text-gray-800">
                Angkatan Tahun {item.generationYear}
              </p>{" "}
              <span className="text-gray-300">|</span>
              <p className="text-base italic text-gray-800">
                {item.currentJob}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-4 items-center mr-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-1">
                <Toggle
                  size="md"
                  showIcon
                  enabled={Boolean(item.isPublished)}
                  onChange={(setVisibility) => {
                    handleTogglePublish(item, setVisibility);
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Tampilkan Alumni
              <br /> di Landing Page
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuPen className="text-xl" />}
                // isLoading={loadingStates}
                variant="outline-info"
                className="w-fit py-1 px-2! text-xs border-2 border-blue-500"
                // disabled={loadingStates}
                onClick={() =>
                  router.push(`/admin/siswa/data-alumni/edit/${item.id}`)
                }
              />
            </TooltipTrigger>
            <TooltipContent side="top">Edit Data Murid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TextButton
                icon={<LuTrash2 className="text-xl" />}
                variant="outline-danger"
                className="w-fit py-1 px-2! border-2"
                onClick={() => confirmDelete(item.id)}
              />
            </TooltipTrigger>
            <TooltipContent side="top">Hapus Data Murid</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-auto min-h-screen bg-gray-100 p-4">
      <div className="w-full h-fit bg-white rounded-md drop-shadow-sm px-4 py-2">
        <TitleSection
          title="Data Alumni SMK Tamtama Kroya"
          subtitle="Halaman ini akan menampilkan daftar alumni SMK Tamtama Kroya yang dapat diubah"
        />
        <div className="w-full mb-3">
          <div className="w-full flex flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
            {/* <div className="w-full lg:w-52">
              <SearchableSelect
                label=""
                options={yearFilterOptions}
                isAddValueActive={false}
                allowClear={false}
                maxDisplayOptions={YEAR_OPTIONS_LIMIT}
                className="w-full"
                minChars={0}
                placeholder={"Pilih Tahun Angkatan"}
                isMandatory={false}
                name={"generationYear"}
                value={selectedGenerationYear}
                onChange={(e) => {
                  setSelectedGenerationYear(String(e.target.value));
                  setCurrentPage(1);
                }}
              />
            </div> */}
            <div className="w-full lg:w-74">
              <SelectInput
                label=""
                value={selectedMajor}
                onChange={(event) =>
                  setSelectedMajor(String(event.target.value))
                }
                options={majorOptions}
                placeholder="Pilih jurusan"
                disabled={isLoadingMajors}
              />
            </div>

            <div className="w-full lg:w-54">
              <SelectInput
                label=""
                value={sortBy}
                onChange={(event) => setSortBy(String(event.target.value))}
                options={sortByOptions}
              />
            </div>
            <div className="w-full lg:w-50">
              <SelectInput
                label=""
                value={sortOrder}
                onChange={(event) => setSortOrder(String(event.target.value))}
                options={sortOrderOptions}
              />
            </div>
            <TextButton
              variant="outline"
              text="Reset Filter"
              className="w-full lg:w-auto lg:mb-2"
              onClick={handleResetFilters}
              icon={<IoMdRefresh className="text-lg shrink-0" />}
            />
            <Search
              placeholder="Cari nama alumni"
              className="w-full lg:max-w-58 lg:mb-2"
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
            />
            <TextButton
              variant="primary"
              text="Tambah Alumni"
              onClick={() => router.push("/admin/siswa/data-alumni/tambah")}
              className="w-full lg:w-auto lg:mb-2"
            />
          </div>
        </div>
        <div className="w-full h-fit">
          <GridListPaginate
            data={alumni}
            renderItem={renderItem}
            viewMode="list"
            loading={loading}
            emptyText="Data alumni belum tersedia"
            pagination={paginationConfig}
          />
        </div>
        <BaseModal
          isOpen={deleteModalOpen}
          onClose={() => {
            if (!isDeleting) {
              setDeleteModalOpen(false);
              setDeletingId(null);
            }
          }}
          title="Konfirmasi Hapus"
          footer={
            <div className="flex justify-end gap-2">
              <TextButton
                variant="outline"
                text="Batal"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingId(null);
                }}
              />
              <TextButton
                text="Hapus"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
              />
            </div>
          }
        >
          <p>Anda yakin ingin menghapus data alumni ini?</p>
        </BaseModal>
      </div>
    </div>
  );
}

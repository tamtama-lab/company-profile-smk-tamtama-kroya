"use client";

import { AlumniApiResponse, AlumniItem } from "@/admin/siswa/data-alumni/type";
import { TextButton } from "@/components/Buttons/TextButton";
import GenerationYearDropdown from "@/components/Filter/GenerationYearDropdown";
import Search from "@/components/Filter/Search";
import GridListPaginate from "@/components/GridListPaginate";
import SelectInput from "@/components/InputForm/SelectInput";
import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RiFilterOffFill } from "react-icons/ri";

const MAJOR_LABEL_MAP: Record<string, string> = {
  TP: "Teknik Permesinan",
  TKR: "Teknik Kendaraan Ringan",
  TITL: "Teknik Instalasi Tenaga Listrik",
  DKV: "Desain Komunikasi Visual",
};

const LG_BREAKPOINT = 1024;

const getPerPageByViewport = () =>
  typeof window !== "undefined" && window.innerWidth < LG_BREAKPOINT ? 10 : 9;

export default function AlumnusPage() {
  const [loading, setLoading] = useState(false);
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedGenerationYear, setSelectedGenerationYear] =
    useState<string>("");
  const [majorOptions, setMajorOptions] = useState<
    Array<{ value: string | number; label: string }>
  >([{ value: "", label: "Semua Jurusan" }]);
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    perPage: getPerPageByViewport(),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const fetchMajors = async () => {
      setIsLoadingMajors(true);
      try {
        const response = await fetch("/api/filters/options");
        if (!response.ok) {
          throw new Error("Failed to fetch major options");
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
        console.error("Failed fetch major options", error);
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
  }, []);

  useEffect(() => {
    const syncPerPageWithViewport = () => {
      const nextPerPage = getPerPageByViewport();

      setPagination((prev) => {
        if (prev.perPage === nextPerPage) {
          return prev;
        }

        return {
          ...prev,
          currentPage: 1,
          perPage: nextPerPage,
        };
      });
    };

    syncPerPageWithViewport();
    window.addEventListener("resize", syncPerPageWithViewport);

    return () => {
      window.removeEventListener("resize", syncPerPageWithViewport);
    };
  }, []);

  const fetchAlumni = useCallback(
    async (page = 1, perPage = pagination.perPage) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(perPage),
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

        const response = await fetch(`/api/alumni?${params.toString()}`);
        const result: AlumniApiResponse = await response.json();

        setAlumni(result.data || []);
        setPagination({
          total: result.meta?.total || 0,
          currentPage: result.meta?.currentPage || 1,
          perPage: result.meta?.perPage || perPage,
        });
      } catch (error) {
        console.error("Failed fetch alumni", error);
        setAlumni([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearchTerm,
      selectedMajor,
      selectedGenerationYear,
      pagination.perPage,
    ],
  );

  useEffect(() => {
    fetchAlumni(1, pagination.perPage);
  }, [fetchAlumni, pagination.perPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleMajorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMajor(event.target.value);
  };

  const handleGenerationYearChange = (value: string) => {
    setSelectedGenerationYear(value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedMajor("");
    setSelectedGenerationYear("");
  };

  const filterValue = searchTerm || selectedMajor || selectedGenerationYear;

  const paginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.perPage,
      total: pagination.total,
      onChange: (page: number, pageSize: number) => {
        fetchAlumni(page, pageSize);
      },
      onShowSizeChange: (page: number, pageSize: number) => {
        fetchAlumni(page, pageSize);
      },
    }),
    [pagination, fetchAlumni],
  );

  const renderItem = (item: AlumniItem, _: number) => {
    const majorAbbr = item.major;
    const majorLabel = MAJOR_LABEL_MAP[item.major] || item.major;

    return (
      <div className="rounded-lg flex flex-col items-center">
        <Image
          src={item.photoUrl || "https://placehold.co/600x400/png"}
          alt={item.name}
          width={232}
          height={121}
          loading="lazy"
          unoptimized
          className="w-full h-58 aspect-1.5/1 bg-gray-300 border border-gray-300 rounded-lg object-cover"
        />
        <p className="text-base font-semibold text-gray-800 my-1">
          {item.name}
        </p>
        <p className="text-base italic text-gray-800">
          {majorAbbr} - {majorLabel}
        </p>
        <p className="text-base italic text-gray-800">
          Angkatan {item.generationYear}
        </p>
        <p className="text-base italic text-gray-600 font-light mt-1">
          {item.currentJob}
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 mt-20 sm:pb-4 max-sm:mt-20 max-sm:px-8 justify-center items-center">
        <div className="w-full flex flex-wrap items-center justify-center max-w-2xl gap-4">
          <h1 className="text-4xl max-sm:text-2xl font-bold text-primary text-center">
            ALUMNI SMK TAMTAMA KROYA
          </h1>
          <p className="text-center text-lg max-sm:text-sm text-gray-600">
            Halaman Alumni SMK Tamtama Kroya menghadirkan profil lulusan dari
            berbagai angkatan sebagai representasi perjalanan dan kontribusi
            mereka setelah menyelesaikan pendidikan.
          </p>
        </div>
        <div className="flex flex-col border border-gray-300 justify-end w-full flex-wrap md:flex-nowarp gap-3 md:flex-row md:items-end px-0">
          <SelectInput
            className="w-full!"
            options={majorOptions}
            value={selectedMajor}
            onChange={handleMajorChange}
            disabled={isLoadingMajors}
          />
          <GenerationYearDropdown
            className="w-full sm:max-w-52 mb-2"
            value={selectedGenerationYear}
            onChange={handleGenerationYearChange}
          />
          {filterValue && (
            <TextButton
              variant="outline"
              // text="Reset Filter"
              className="w-full sm:w-fit! sm:mb-2"
              onClick={handleResetFilters}
              icon={<RiFilterOffFill className="text-xl shrink-0" />}
            />
          )}
          <Search
            placeholder="Cari nama alumni/tempat kerja"
            className="w-full md:max-w-72 sm:max-w-68 mb-2"
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
        </div>
        <GridListPaginate
          data={alumni}
          showSizeChanger={false}
          showNumberInfo={false}
          renderItem={renderItem}
          viewMode="grid"
          loading={loading}
          emptyText="Data alumni belum tersedia"
          pagination={paginationConfig}
        />
      </div>
    </main>
  );
}

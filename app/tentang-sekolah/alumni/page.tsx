"use client";

import { AlumniApiResponse, AlumniItem } from "@/admin/siswa/data-alumni/type";
import GridListPaginate from "@/components/GridListPaginate";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function AlumnusPage() {
  const [loading, setLoading] = useState(false);
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    perPage: 9,
  });

  const fetchAlumni = async (page = 1, perPage = pagination.perPage) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/alumni?page=${page}&perPage=${perPage}`,
      );
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
  };

  useEffect(() => {
    fetchAlumni(1, pagination.perPage);
  }, []);

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
    [pagination],
  );

  const renderItem = (item: AlumniItem, _: number) => {
    let majorAbbr = item.major;
    switch (item.major) {
      case "TP":
        item.major = "Teknik Permesinan";
        break;
      case "TKR":
        item.major = "Teknik Kendaraan Ringan";
        break;
      case "TITL":
        item.major = "Teknik Instalasi Tenaga Listrik";
        break;
      case "DKV":
        item.major = "Desain Komunikasi Visual";
        break;
    }
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
        <p className="text-base italic text-gray-800">{majorAbbr}</p>
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
    <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 py-16 sm:pb-4 max-sm:pt-20 max-sm:px-8">
        <div className="w-full flex flex-wrap items-center justify-center md:justify-start">
          <h1 className="text-center text-3xl font-bold text-primary md:text-left">
            ALUMNI SMK TAMTAMA KROYA
          </h1>
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

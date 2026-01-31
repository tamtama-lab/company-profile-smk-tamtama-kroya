"use client";

import { TitleSection } from "@/components/TitleSection/index";

export default function AdminStatisticPage() {
  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Data Pendaftar Sekolah"
          subtitle="Menampilkan daftar lengkap calon murid yang telah melakukan <br /> pendaftaran baik secara mandiri maupun melalui guru."
        />
        <div className="w-full h-100 bg-white rounded-md drop-shadow-sm"></div>
      </div>
    </div>
  );
}

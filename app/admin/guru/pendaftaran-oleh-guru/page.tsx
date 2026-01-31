"use client";

import { TitleSection } from "@/components/TitleSection/index";

export default function PendaftaranOlehGuruPage() {
  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Pendaftaran Oleh Guru"
          subtitle="Pantau pendaftaran siswa yang dilakukan oleh guru."
        />
        <div className="w-full h-100 bg-white rounded-md drop-shadow-sm"></div>
      </div>
    </div>
  );
}

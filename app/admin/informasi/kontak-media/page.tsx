"use client";

import { TitleSection } from "@/components/TitleSection/index";

export default function KontakMediaPage() {
  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Kontak & Media Sosial"
          subtitle="Kelola informasi kontak sekolah dan akun media sosial."
        />
        <div className="w-full h-100 bg-white rounded-md drop-shadow-sm"></div>
      </div>
    </div>
  );
}

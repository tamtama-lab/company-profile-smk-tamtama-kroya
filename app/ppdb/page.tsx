"use client";

import Image from "next/image";
import PPDBHeader from "../components/Headers/PPDBHeader";

export default function PpdbPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <PPDBHeader />

      {/* Hero Section */}
      <section className="w-full h-[80vh] text-primary flex flex-row border items-center justify-center px-24 pt-20">
        <div className="w-full h-4/5 flex flex-row">
          {/* Text Section */}
          <div className="w-3/5 border border-yellow-500 flex flex-col items-center justify-center p-10">
            <div className="w-full h-full flex-col space-y-6 border border-red-500">
              <h2>Selamat Datang di</h2>
              <h1 className="text-2xl text-[#2D2D2D] font-semibold">
                Portal Penerimaan Peserta Didik Baru (PPDB) SMK Tamtama Kroya
                2026 / 2027
              </h1>
              <h2>🏅SMK Pusat Keunggulan (PK)</h2>
              <h3>
                Bergabunglah bersama kami untuk memulai perjalanan pendidikan
                yang membekali keterampilan, karakter, dan kesiapan menghadapi
                dunia kerja dan masa depan.
              </h3>
              <div className="w-full space-x-10">
                <button className=""></button>
              </div>
            </div>
          </div>
          {/* Text Section */}
          <div className="w-2/5 border border-yellow-500 flex items-center justify-center">
            <Image
              src="/ppdb/hero-image.png"
              alt="Description"
              width={300}
              height={300}
            />
          </div>
        </div>
        
      </section>

      {/* Values Section */}
      <section className="w-full border border-red-500 mb-12 px-20 py-10 h-fit">
        <div className="w-full h-full flex justify-center items-center py-6 border border-[#014921] rounded-lg">
          <h1 className="text-2xl text-[#014921]">Pendaftar Tervalidasi:</h1>
          <span className="bg-[#56B680] px-2 py-1 rounded ml-2">
            <h1 className="text-2xl text-white">150</h1>
          </span>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
        <p className="text-gray-700 leading-relaxed">
          Our talented team is committed to bringing your vision to life with
          creativity, expertise, and dedication.
        </p>
      </section>
    </main>
  );
}

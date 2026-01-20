"use client";

import { HeroSection } from "@/components/LandingPage/HeroSection";
import { VacationTotal } from "@/components/LandingPage/VacationTotal";
import { WhyChooseUs } from "@/components/LandingPage/WhyChooseUs";
import { SchoolLocation } from "./components/LandingPage/SchoolLocation";
import { RegistrationPathSection } from "@/components/LandingPage/RegistrationPathSection";
import { RegistrationRequirementsSection } from "@/components/LandingPage/RegistrationRequirementsSection";
import { BrochureSection } from "./components/LandingPage/BrochureSection";

export default function LandingPage() {
  // Data untuk Registration Path Section
  const registrationPathTabs = [
    {
      id: "prestasi",
      label: "Jalur Prestasi",
      image: "/ppdb/jalur-prestasi.jpg",
      items: [
        {
          grade: "Peringkat 1 Kelas (Gratis SPP 9 Bulan)",
          description: "Untuk siswa dengan prestasi akademik terbaik",
          icon: "🥇",
        },
        {
          grade: "Peringkat 2 Kelas (Gratis SPP 6 Bulan)",
          description: "Untuk siswa dengan prestasi akademik sangat baik",
          icon: "🥈",
        },
        {
          grade: "Peringkat 3 Kelas (Gratis SPP 3 Bulan)",
          description: "Untuk siswa dengan prestasi akademik baik",
          icon: "🥉",
        },
      ],
    },
    {
      id: "non-akademik",
      label: "Jalur Non-Akademik",
      image: "/ppdb/jalur-non-akademik.jpg",
      items: [
        {
          grade: "Juara Nasional (Gratis SPP 1 Tahun)",
          description: "Untuk siswa dengan prestasi non-akademik terbaik",
          icon: "🏆",
        },
        {
          grade: "Juara Provinsi (Gratis SPP 9 Bulan)",
          description: "Untuk siswa dengan prestasi non-akademik sangat baik",
          icon: "🏆",
        },
        {
          grade: "Juara Kabupaten (Gratis SPP 6 Bulan)",
          description: "Untuk siswa dengan prestasi non-akademik baik",
          icon: "🏆",
        },
      ],
    },
  ];

  // Data untuk Registration Requirements Section
  const requirements = [
    {
      id: 1,
      text: "Mengisi formulir pendaftaran",
    },
    {
      id: 2,
      text: "Foto Copy Ijazah",
    },
    {
      id: 3,
      text: "Foto Copy KK dan Akta Kelahiran",
    },
    {
      id: 4,
      text: "Foto Copy KTP Orang Tua",
    },
    {
      id: 5,
      text: "Pas foto 3x4 Berwarna (3 lembar)",
    },
    {
      id: 6,
      text: "Sertifikat TKA (Tes Kemampuan Akademik)",
    },
    {
      id: 7,
      text: "Foto Copy Kartu PIP (Jika Ada)",
    },
  ];

  const registrationPeriods = [
    {
      id: 1,
      period: "1",
      startMonth: "November",
      endMonth: "Februari",
      status: "BUKA",
      icon: "01",
    },
    {
      id: 2,
      period: "2",
      startMonth: "Maret",
      endMonth: "Mei",
      status: "Tutup",
      icon: "02",
    },
    {
      id: 3,
      period: "3",
      startMonth: "Juni",
      endMonth: "Juli",
      status: "Tutup",
      icon: "03",
    },
  ];

  return (
    <main className="h-fit bg-linear-to-b from-[#fafafa] to-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Mengapa harus SMK Tamtama Kroya? */}
      <WhyChooseUs />

      {/* Jumlah Pendaftar per Jurusan */}
      <VacationTotal />

      {/* Jalur Pendaftaran */}
      <RegistrationPathSection tabs={registrationPathTabs} />

      {/* Syarat & Periode Pendaftaran */}
      <RegistrationRequirementsSection
        requirements={requirements}
        periods={registrationPeriods}
      />

      {/* Lokasi Sekolah */}
      <SchoolLocation />

      {/* Info Brosur */}
      <BrochureSection />
    </main>
  );
}

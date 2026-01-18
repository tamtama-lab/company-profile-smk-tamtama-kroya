"use client";

import PPDBHeader from "@/components/Headers/PPDBHeader";
import { HeroSection } from "@/components/ppdb/HeroSection";
import { RegistrationPath } from "@/components/ppdb/RegistrationPath";
import { VacationTotal } from "@/components/ppdb/VacationTotal";
import { WhyChooseUs } from "@/components/ppdb/WhyChooseUs";

export default function PpdbPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <PPDBHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Mengapa harus SMK Tamtama Kroya? */}
      <WhyChooseUs />

      {/* Jumlah Pendaftar per Jurusan */}
      <VacationTotal />

      {/* Registration Path*/}
      <RegistrationPath />
    </main>
  );
}

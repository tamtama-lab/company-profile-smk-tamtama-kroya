"use client";

import { BiodataSiswa } from "@/components/RegistrationForm/BiodataSiswa";
import { BiodataOrangTua } from "@/components/RegistrationForm/BiodataOrangTua";
import { BiodataWali } from "@/components/RegistrationForm/BiodataWali";
import { PilihJurusan } from "@/components/RegistrationForm/PilihJurusan";
import { Selesai } from "@/components/RegistrationForm/Selesai";
import { TabsStep } from "@/components/TabStep";
import { useState } from "react";
import { div } from "framer-motion/client";

const tabsData = [
  "Biodata Siswa",
  "Biodata Orang Tua",
  "Biodata Wali",
  "Pilih Jurusan",
  "Selesai",
];

interface RegistrationData {
  biodataSiswa?: unknown;
  biodataOrangTua?: unknown;
  biodataWali?: unknown;
  pilihJurusan?: unknown;
}

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState(tabsData[0] || "");
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    {},
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleNextBiodataSiswa = (data: unknown) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataSiswa: data,
    }));
    setActiveTab("Biodata Orang Tua");
  };

  const handleNextBiodataOrangTua = (data: unknown) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataOrangTua: data,
    }));
    setActiveTab("Biodata Wali");
  };

  const handleNextBiodataWali = (data: unknown) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataWali: data,
    }));
    setActiveTab("Pilih Jurusan");
  };

  const handleNextPilihJurusan = (data: unknown) => {
    setRegistrationData((prev) => ({
      ...prev,
      pilihJurusan: data,
    }));
    setActiveTab("Selesai");
  };

  const handlePrevBiodataOrangTua = () => {
    setActiveTab("Biodata Siswa");
  };

  const handlePrevBiodataWali = () => {
    setActiveTab("Biodata Orang Tua");
  };

  const handlePrevPilihJurusan = () => {
    setActiveTab("Biodata Wali");
  };

  const handlePrevSelesai = () => {
    setActiveTab("Pilih Jurusan");
  };

  const handleSubmitSelesai = () => {
    console.log("All registration data:", registrationData);
    // Add API call here to submit data
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "Biodata Siswa":
        return <BiodataSiswa onNext={handleNextBiodataSiswa} />;
      case "Biodata Orang Tua":
        return (
          <BiodataOrangTua
            onNext={handleNextBiodataOrangTua}
            onPrev={handlePrevBiodataOrangTua}
          />
        );
      case "Biodata Wali":
        return (
          <BiodataWali
            onNext={handleNextBiodataWali}
            onPrev={handlePrevBiodataWali}
          />
        );
      case "Pilih Jurusan":
        return (
          <PilihJurusan
            onNext={handleNextPilihJurusan}
            onPrev={handlePrevPilihJurusan}
          />
        );
      case "Selesai":
        return (
          <Selesai onSubmit={handleSubmitSelesai} onPrev={handlePrevSelesai} />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50 mt-10">
      <div className="w-full p-20">
        {activeTab === "Biodata Siswa" && (
          <div className="w-full">
            <p className="text-primary mb-2">
              Halo, calon murid <span className="font-bold">Tamtama!</span>
            </p>
            <p className="text-gray-700 text-sm">
              Pastikan semua data telah diisi dengan benar sebelum mengirimkan
              formulir.
              <span className="font-semibold">Lanjutkan.</span>
            </p>
            <p className="text-gray-700 text-sm">
              Jika sudah yakin, silakan klik tombol
              <span className="font-semibold"> Daftar Sekarang.</span>
            </p>
          </div>
        )}
        <div className="w-full h-full">
          <TabsStep
            tabs={tabsData}
            activeTab={activeTab}
            tabsContent={renderFormContent()}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </main>
  );
}

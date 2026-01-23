"use client";

import { BiodataSiswa } from "@/components/RegistrationForm/BiodataSiswa";
import { BiodataOrangTua } from "@/components/RegistrationForm/BiodataOrangTua";
import { BiodataWali } from "@/components/RegistrationForm/BiodataWali";
import { PilihJurusan } from "@/components/RegistrationForm/PilihJurusan";
import { Selesai } from "@/components/RegistrationForm/Selesai";
import { TabsStep } from "@/components/TabStep";
import { useState } from "react";
import { GoArrowLeft } from "react-icons/go";

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

  const handleRouteToHome = () => {
    window.location.href = "/";
  };

  const handleResetBiodataSiswa = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataSiswa: undefined,
    }));
  };

  const handleResetBiodataOrangTua = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataOrangTua: undefined,
    }));
  };

  const handleResetBiodataWali = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataWali: undefined,
    }));
  };

  const handleResetPilihJurusan = () => {
    setRegistrationData((prev) => ({
      ...prev,
      pilihJurusan: undefined,
    }));
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "Biodata Siswa":
        return (
          <BiodataSiswa
            onPrev={handleRouteToHome}
            onNext={handleNextBiodataSiswa}
            onCancel={handleResetBiodataSiswa}
          />
        );
      case "Biodata Orang Tua":
        return (
          <BiodataOrangTua
            onNext={handleNextBiodataOrangTua}
            onPrev={handlePrevBiodataOrangTua}
            onCancel={handleResetBiodataOrangTua}
          />
        );
      case "Biodata Wali":
        return (
          <BiodataWali
            onNext={handleNextBiodataWali}
            onPrev={handlePrevBiodataWali}
            onCancel={handleResetBiodataWali}
          />
        );
      case "Pilih Jurusan":
        return (
          <PilihJurusan
            onNext={handleNextPilihJurusan}
            onPrev={handlePrevPilihJurusan}
            onCancel={handleResetPilihJurusan}
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
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50 mt-10 max-sm:mt-16">
      <div className="w-full p-5 sm:border max-sm:p-5 md:p-10 lg:p-14 xl:p-20 flex flex-col items-center gap-6">
        {activeTab === "Biodata Siswa" && (
          <div className="w-full flex flex-col mb-6 max-sm:mb-0">
            <div className="w-full flex flex-row justify-between mb-3">
              <div
                className="w-10 h-10 text-2xl drop-shadow bg-white rounded-md flex justify-center items-center cursor-pointer"
                onClick={handleRouteToHome}
              >
                <GoArrowLeft />
              </div>
            </div>
            <div className="w-full">
              <p className="text-primary text-2xl max-sm:text-xl mb-2">
                Halo, calon murid <span className="font-bold">Tamtama!</span>
                🙋🏻‍♀️🙋🏻‍
              </p>
              <p className="text-gray-700 text-lg max-sm:text-base">
                📢 Pastikan semua data telah diisi dengan benar sebelum
                mengirimkan formulir.
              </p>
              <p className="text-gray-700 text-lg max-sm:text-base">
                Jika sudah yakin, silakan klik tombol
                <span className="font-semibold"> Daftar Sekarang.</span>
              </p>
            </div>
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

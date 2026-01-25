"use client";

import { BiodataSiswa } from "@/components/RegistrationForm/BiodataSiswa";
import { BiodataOrangTua } from "@/components/RegistrationForm/BiodataOrangTua";
import { BiodataWali } from "@/components/RegistrationForm/BiodataWali";
import { PilihJurusan } from "@/components/RegistrationForm/PilihJurusan";
import { Selesai } from "@/components/RegistrationForm/Selesai";
import { TabsStep } from "@/components/TabStep";
import { SuccessModal } from "@/components/Modal/SuccessModal";
import { useState, useEffect } from "react";
import { GoArrowLeft } from "react-icons/go";
import { getSchoolList } from "../api/registration/get-school";
import { transformToApiFormat } from "@/utils/transformRegistrationData";
import {
  RegistrationData,
  BiodataSiswaForm,
  BiodataOrangTuaForm,
  BiodataWaliForm,
  PilihJurusanForm,
} from "@/utils/registrationTypes";
import { Alert, type AlertVariant } from "@/components/ui/alert";

const tabsData = [
  "Biodata Siswa",
  "Biodata Orang Tua",
  "Biodata Wali",
  "Pilih Jurusan",
  "Selesai",
];

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState(tabsData[0] || "");
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    registrationId: string;
    studentName: string;
  } | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    title?: string;
    message: string;
    variant: AlertVariant;
  } | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await getSchoolList();
      console.log("School List:", schools);
    };
    fetchSchools();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleNextBiodataSiswa = (data: BiodataSiswaForm) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataSiswa: data,
    }));
    setActiveTab("Biodata Orang Tua");
  };

  const handleNextBiodataOrangTua = (data: BiodataOrangTuaForm) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataOrangTua: data,
    }));
    setActiveTab("Biodata Wali");
  };

  const handleNextBiodataWali = (data: BiodataWaliForm) => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataWali: data,
    }));
    setActiveTab("Pilih Jurusan");
  };

  const handleNextPilihJurusan = (data: PilihJurusanForm) => {
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

  const handleSubmitSelesai = async () => {
    try {
      setIsSubmitting(true);

      // Validate all data is present
      if (
        !registrationData.biodataSiswa ||
        !registrationData.biodataOrangTua ||
        !registrationData.biodataWali ||
        !registrationData.pilihJurusan
      ) {
        setAlertInfo({
          title: "Data Tidak Lengkap",
          message: "Semua data harus diisi sebelum mengirim",
          variant: "warning",
        });
        setIsSubmitting(false);
        return;
      }

      // Transform data to API format
      const apiPayload = transformToApiFormat(registrationData);
      console.log("Sending payload:", apiPayload);

      // Submit to API
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        setSuccessData({
          registrationId: result.data?.registrationId || "",
          studentName: result.data?.studentName || "",
        });
        setShowSuccessModal(true);
        setRegistrationData({});
      } else {
        setAlertInfo({
          title: "Gagal mendaftar",
          message: result.message || "Terjadi kesalahan saat mendaftar",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setAlertInfo({
        title: "Terjadi kesalahan",
        message: "Gagal mengirim data. Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRouteToHome = () => {
    window.location.href = "/";
  };

  const handleResetBiodataSiswa = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataSiswa: undefined,
    }));
    setActiveTab("Biodata Siswa");
  };

  const handleResetBiodataOrangTua = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataOrangTua: undefined,
    }));
    setActiveTab("Biodata Orang Tua");
  };

  const handleResetBiodataWali = () => {
    setRegistrationData((prev) => ({
      ...prev,
      biodataWali: undefined,
    }));
    setActiveTab("Biodata Wali");
  };

  const handleResetPilihJurusan = () => {
    setRegistrationData((prev) => ({
      ...prev,
      pilihJurusan: undefined,
    }));
    setActiveTab("Pilih Jurusan");
  };

  const handleValidationError = (message: string): void => {
    setAlertInfo({
      title: "Data Tidak Lengkap",
      message: message,
      variant: "warning",
    });
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "Biodata Siswa":
        return (
          <BiodataSiswa
            onPrev={handleRouteToHome}
            onNext={handleNextBiodataSiswa}
            onCancel={handleResetBiodataSiswa}
            initialData={registrationData.biodataSiswa}
            onValidationError={handleValidationError}
          />
        );
      case "Biodata Orang Tua":
        return (
          <BiodataOrangTua
            onNext={handleNextBiodataOrangTua}
            onPrev={handlePrevBiodataOrangTua}
            onCancel={handleResetBiodataOrangTua}
            initialData={registrationData.biodataOrangTua}
            onValidationError={handleValidationError}
          />
        );
      case "Biodata Wali":
        return (
          <BiodataWali
            onNext={handleNextBiodataWali}
            onPrev={handlePrevBiodataWali}
            onCancel={handleResetBiodataWali}
            initialData={registrationData.biodataWali}
            onValidationError={handleValidationError}
          />
        );
      case "Pilih Jurusan":
        return (
          <PilihJurusan
            onNext={handleNextPilihJurusan}
            onPrev={handlePrevPilihJurusan}
            onCancel={handleResetPilihJurusan}
            initialData={registrationData.pilihJurusan}
            onValidationError={handleValidationError}
          />
        );
      case "Selesai":
        return (
          <Selesai
            onSubmit={handleSubmitSelesai}
            onPrev={handlePrevSelesai}
            onCancel={() => {
              setRegistrationData({});
              setActiveTab("Biodata Siswa");
            }}
            registrationData={registrationData}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50 mt-10 max-sm:mt-16">
      <div className="w-full p-5 sm:border max-sm:p-5 md:p-10 lg:p-14 xl:p-20 flex flex-col items-center gap-6">
        {alertInfo && (
          <Alert
            variant={alertInfo.variant}
            title={alertInfo.title}
            description={alertInfo.message}
            onClose={() => setAlertInfo(null)}
          />
        )}
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
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setActiveTab("Biodata Siswa");
          window.location.href = "/";
        }}
        registrationId={successData?.registrationId}
        studentName={successData?.studentName}
      />
    </main>
  );
}

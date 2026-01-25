"use client";

import { BiodataSiswa } from "@/components/RegistrationForm/BiodataSiswa";
import { BiodataOrangTua } from "@/components/RegistrationForm/BiodataOrangTua";
import { BiodataWali } from "@/components/RegistrationForm/BiodataWali";
import { PilihJurusan } from "@/components/RegistrationForm/PilihJurusan";
import { Selesai } from "@/components/RegistrationForm/Selesai";
import { TabsStep } from "@/components/TabStep";
import { SuccessModal } from "@/components/Modal/SuccessModal";
import { ConfirmationAlert } from "@/components/Modal/ConfirmationAlert";
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
import { useAlert } from "@/components/ui/alert";

const tabsData = [
  "Biodata Siswa",
  "Biodata Orang Tua",
  "Biodata Wali",
  "Pilih Jurusan",
  "Selesai",
];

const STORAGE_KEY = "smk_tamako_registration_data";
const STORAGE_TAB_KEY = "smk_tamako_active_tab";

export default function RegistrationPage() {
  const { showAlert } = useAlert();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationAlert, setConfirmationAlert] = useState<{
    isOpen: boolean;
    type:
      | "biodataSiswa"
      | "biodataOrangTua"
      | "biodataWali"
      | "pilihJurusan"
      | "selesai"
      | null;
  }>({
    isOpen: false,
    type: null,
  });
  const [successData, setSuccessData] = useState<{
    registrationNumber: string;
    studentName: string;
    majorChoiceCode: string;
  } | null>(null);
  const [formKey, setFormKey] = useState(0); // Add key to force re-render

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTab = localStorage.getItem(STORAGE_TAB_KEY);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setRegistrationData(parsedData);
        } catch (error) {
          console.error("Failed to parse saved data:", error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (savedTab && tabsData.includes(savedTab)) {
        setActiveTab(savedTab);
      } else {
        setActiveTab(tabsData[0]);
      }

      setIsHydrated(true);
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      setActiveTab(tabsData[0]);
      setIsHydrated(true);
    }
  }, []);

  // Save data to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationData));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, [registrationData, isHydrated]);

  // Save active tab to localStorage (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(STORAGE_TAB_KEY, activeTab);
    } catch (error) {
      console.error("Failed to save active tab to localStorage:", error);
    }
  }, [activeTab, isHydrated]);

  // Clear localStorage on successful submission
  const clearStoredData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TAB_KEY);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

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

  // SELANJUTNYA: Simpan data dan lanjut ke tab berikutnya
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

  // KEMBALI: Kembali ke halaman sebelumnya, data akan di-load dari localStorage
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
        showAlert({
          title: "Data Tidak Lengkap",
          description: "Semua data harus diisi sebelum mengirim",
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
          registrationNumber: result.data?.registrationNumber || "",
          studentName: result.data?.studentName || "",
          majorChoiceCode: result.data?.majorChoiceCode || "",
        });
        setShowSuccessModal(true);
        setRegistrationData({});
        clearStoredData(); // Clear localStorage on success
      } else {
        // Check if there are validation errors
        if (
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          showAlert({
            title: result.message || "Validasi Gagal",
            variant: "error",
            autoDismissMs: 12000,
            errors: result.errors,
          });
        } else {
          showAlert({
            title: "Gagal Mendaftar",
            description: result.message || "Terjadi kesalahan saat mendaftar",
            variant: "error",
            autoDismissMs: 7000,
          });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Gagal mengirim data. Silakan coba lagi.",
        variant: "error",
        autoDismissMs: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRouteToHome = () => {
    window.location.href = "/";
  };

  // BATAL: Show confirmation alert
  const handleResetBiodataSiswa = () => {
    setConfirmationAlert({ isOpen: true, type: "biodataSiswa" });
  };

  const handleResetBiodataOrangTua = () => {
    setConfirmationAlert({ isOpen: true, type: "biodataOrangTua" });
  };

  const handleResetBiodataWali = () => {
    setConfirmationAlert({ isOpen: true, type: "biodataWali" });
  };

  const handleResetPilihJurusan = () => {
    setConfirmationAlert({ isOpen: true, type: "pilihJurusan" });
  };

  const handleResetSelesai = () => {
    setConfirmationAlert({ isOpen: true, type: "selesai" });
  };

  // Handle confirmation - delete data and force re-render
  const handleConfirmReset = () => {
    const { type } = confirmationAlert;

    if (type === "biodataSiswa") {
      const updatedData = { ...registrationData, biodataSiswa: undefined };
      setRegistrationData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setFormKey((prev) => prev + 1); // Force re-render

      showAlert({
        title: "Data Dihapus",
        description: "Data Biodata Siswa telah dihapus dari formulir",
        variant: "info",
        autoDismissMs: 3000,
      });
    } else if (type === "biodataOrangTua") {
      const updatedData = { ...registrationData, biodataOrangTua: undefined };
      setRegistrationData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setFormKey((prev) => prev + 1); // Force re-render

      showAlert({
        title: "Data Dihapus",
        description: "Data Biodata Orang Tua telah dihapus dari formulir",
        variant: "info",
        autoDismissMs: 3000,
      });
    } else if (type === "biodataWali") {
      const updatedData = { ...registrationData, biodataWali: undefined };
      setRegistrationData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setFormKey((prev) => prev + 1); // Force re-render

      showAlert({
        title: "Data Dihapus",
        description: "Data Biodata Wali telah dihapus dari formulir",
        variant: "info",
        autoDismissMs: 3000,
      });
    } else if (type === "pilihJurusan") {
      const updatedData = { ...registrationData, pilihJurusan: undefined };
      setRegistrationData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setFormKey((prev) => prev + 1); // Force re-render

      showAlert({
        title: "Data Dihapus",
        description: "Data Pilih Jurusan telah dihapus dari formulir",
        variant: "info",
        autoDismissMs: 3000,
      });
    } else if (type === "selesai") {
      setRegistrationData({});
      clearStoredData();
      setActiveTab("Biodata Siswa");
      setFormKey((prev) => prev + 1); // Force re-render

      showAlert({
        title: "Data Dihapus",
        description: "Semua data formulir telah dihapus",
        variant: "info",
        autoDismissMs: 3000,
      });
    }

    setConfirmationAlert({ isOpen: false, type: null });
  };

  const handleValidationError = (message: string): void => {
    showAlert({
      title: "Data Tidak Lengkap",
      description: message,
      variant: "warning",
    });
  };

  const getConfirmationMessage = () => {
    const { type } = confirmationAlert;
    const messages: Record<string, { title: string; message: string }> = {
      biodataSiswa: {
        title: "Hapus Data Biodata Siswa?",
        message:
          "Semua data Biodata Siswa akan dihapus dan tidak dapat dikembalikan.",
      },
      biodataOrangTua: {
        title: "Hapus Data Biodata Orang Tua?",
        message:
          "Semua data Biodata Orang Tua akan dihapus dan tidak dapat dikembalikan.",
      },
      biodataWali: {
        title: "Hapus Data Biodata Wali?",
        message:
          "Semua data Biodata Wali akan dihapus dan tidak dapat dikembalikan.",
      },
      pilihJurusan: {
        title: "Hapus Data Pilih Jurusan?",
        message:
          "Data Pilih Jurusan akan dihapus dan tidak dapat dikembalikan.",
      },
      selesai: {
        title: "Hapus Semua Data?",
        message:
          "Semua data formulir akan dihapus dan tidak dapat dikembalikan. Anda akan kembali ke halaman pertama.",
      },
    };

    return messages[type || ""] || { title: "", message: "" };
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "Biodata Siswa":
        return (
          <BiodataSiswa
            key={`biodataSiswa-${formKey}`}
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
            key={`biodataOrangTua-${formKey}`}
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
            key={`biodataWali-${formKey}`}
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
            key={`pilihJurusan-${formKey}`}
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
            key={`selesai-${formKey}`}
            onSubmit={handleSubmitSelesai}
            onPrev={handlePrevSelesai}
            onCancel={handleResetSelesai}
            registrationData={registrationData}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Don't render until hydration is complete to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  const confirmMessage = getConfirmationMessage();

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
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setActiveTab("Biodata Siswa");
          clearStoredData();
          window.location.href = "/";
        }}
        registrationNumber={successData?.registrationNumber}
        studentName={successData?.studentName}
        majorChoiceCode={successData?.majorChoiceCode}
      />
      <ConfirmationAlert
        isOpen={confirmationAlert.isOpen}
        title={confirmMessage.title}
        message={confirmMessage.message}
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmationAlert({ isOpen: false, type: null })}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </main>
  );
}

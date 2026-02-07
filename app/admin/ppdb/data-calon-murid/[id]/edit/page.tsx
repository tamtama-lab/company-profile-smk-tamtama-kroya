"use client";

import { TitleSection } from "@/components/TitleSection/index";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthHeader } from "@/utils/auth";
import { TextButton } from "@/components/Buttons/TextButton";
import { useAlert } from "@/components/ui/alert";
import { BiodataSiswa } from "@/components/RegistrationForm/BiodataSiswa";
import { BiodataOrangTua } from "@/components/RegistrationForm/BiodataOrangTua";
import { BiodataWali } from "@/components/RegistrationForm/BiodataWali";
import { PilihJurusan } from "@/components/RegistrationForm/PilihJurusan";
import { TabsStep } from "@/components/TabStep";
import {
  RegistrationData,
  BiodataSiswaForm,
  BiodataOrangTuaForm,
  BiodataWaliForm,
  PilihJurusanForm,
} from "@/utils/registrationTypes";
import { transformToApiFormat } from "@/utils/transformRegistrationData";

const tabsData = [
  "Biodata Siswa",
  "Biodata Orang Tua",
  "Biodata Wali",
  "Pilih Jurusan",
  "Simpan",
];

export default function EditDataCalonMuridPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    {},
  );
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setActiveTab(tabsData[0]);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard/students/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Transform API data to registration format
          const transformedData: RegistrationData = {
            biodataSiswa: {
              namaLengkap: result.studentDetail?.fullName || "",
              email: result.studentDetail?.email || "",
              nik: result.studentDetail?.nik || "",
              nisn: result.studentDetail?.nisn || "",
              tempatLahir: result.studentDetail?.placeOfBirth || "",
              tanggalLahir: result.studentDetail?.dateOfBirth || "",
              asalSekolah:
                result.studentDetail?.schoolOriginNpsn ||
                result.studentDetail?.schoolOriginName ||
                "",
              alamat: result.studentDetail?.address || "",
              jenisKelamin:
                result.studentDetail?.gender === 1 ? "Laki-laki" : "Perempuan",
              agama: result.studentDetail?.religion || "",
              adaKip: result.studentDetail?.isKipRecipient || false,
              nomorKip: result.studentDetail?.kipNumber || "",
              nomorWhatsapp: result.studentDetail?.phoneNumber || "",
            },
            biodataOrangTua: {
              alamat: result.parentDetail?.parentAddress || "",
              namaAyah: result.parentDetail?.fatherName || "",
              kondisiAyah: result.parentDetail?.fatherLivingStatus || "",
              namaIbu: result.parentDetail?.motherName || "",
              kondisiIbu: result.parentDetail?.motherLivingStatus || "",
            },
            biodataWali: {
              namaWali: result.parentDetail?.guardianName || "",
              noTelponWali: result.parentDetail?.guardianPhoneNumber || "",
              alamatWali: result.parentDetail?.guardianAddress || "",
            },
            pilihJurusan: {
              jurusanDipilih: result.majorChoiceCode || "",
            },
          };
          setRegistrationData(transformedData);
        } else {
          showAlert({
            title: "Error",
            description: "Failed to fetch data",
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert({
          title: "Error",
          description: "Internal server error",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && isHydrated) {
      fetchData();
    }
  }, [id, isHydrated, showAlert]);

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
    setActiveTab("Simpan");
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

  const handlePrevSimpan = () => {
    setActiveTab("Pilih Jurusan");
  };

  const handleSubmit = async () => {
    if (
      !registrationData.biodataSiswa ||
      !registrationData.biodataOrangTua ||
      !registrationData.biodataWali ||
      !registrationData.pilihJurusan
    ) {
      showAlert({
        title: "Data Tidak Lengkap",
        description: "Semua data harus diisi sebelum menyimpan",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      // Transform data to API format
      const apiPayload = transformToApiFormat(registrationData);

      const response = await fetch(`/api/dashboard/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(apiPayload),
      });

      if (response.ok) {
        showAlert({
          title: "Berhasil",
          description: "Data berhasil diperbarui",
          variant: "success",
        });
        router.push("/admin/dashboard");
      } else {
        const errorData = await response.json();
        showAlert({
          title: "Gagal",
          description: errorData.error || "Failed to update data",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating data:", error);
      showAlert({
        title: "Error",
        description: "Internal server error",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleValidationError = (message: string): void => {
    showAlert({
      title: "Data Tidak Lengkap",
      description: message,
      variant: "warning",
    });
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "Biodata Siswa":
        return (
          <BiodataSiswa
            onPrev={() => router.back()}
            onNext={handleNextBiodataSiswa}
            onCancel={() => {}}
            initialData={registrationData.biodataSiswa}
            onValidationError={handleValidationError}
            skipNikCheck={true}
            nikReadOnly={true}
          />
        );
      case "Biodata Orang Tua":
        return (
          <BiodataOrangTua
            onNext={handleNextBiodataOrangTua}
            onPrev={handlePrevBiodataOrangTua}
            onCancel={() => {}}
            initialData={registrationData.biodataOrangTua}
            onValidationError={handleValidationError}
          />
        );
      case "Biodata Wali":
        return (
          <BiodataWali
            onNext={handleNextBiodataWali}
            onPrev={handlePrevBiodataWali}
            onCancel={() => {}}
            initialData={registrationData.biodataWali}
            onValidationError={handleValidationError}
          />
        );
      case "Pilih Jurusan":
        return (
          <PilihJurusan
            onNext={handleNextPilihJurusan}
            onPrev={handlePrevPilihJurusan}
            onCancel={() => {}}
            initialData={registrationData.pilihJurusan}
            onValidationError={handleValidationError}
          />
        );
      case "Simpan":
        return (
          <div className="w-full flex flex-col items-center justify-center py-10">
            <h3 className="text-xl font-semibold mb-4">Konfirmasi Perubahan</h3>
            <p className="text-gray-600 mb-6 text-center">
              Pastikan semua data telah diisi dengan benar sebelum menyimpan
              perubahan.
            </p>
            <div className="flex gap-4">
              <TextButton
                text="Kembali"
                variant="outline"
                onClick={handlePrevSimpan}
              />
              <TextButton
                text={saving ? "Menyimpan..." : "Simpan Perubahan"}
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
        <div className="h-full flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <div className="w-full">
        <TitleSection
          title="Edit Data Calon Murid"
          subtitle="Perbarui data calon murid."
        />
        <div className="w-full h-full">
          <TabsStep
            tabs={tabsData}
            activeTab={activeTab}
            tabsContent={renderFormContent()}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </div>
      </div>
    </div>
  );
}

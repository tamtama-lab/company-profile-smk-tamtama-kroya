"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { SectionCard } from "@/components/Card/SectionCard";
import { TitleSection } from "@/components/TitleSection/index";
import { BenefitList, BenefitItem } from "@/components/Card/BenefitCard";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import { useEffect, useRef, useState } from "react";
import { LuPlus, LuTrash2, LuUpload } from "react-icons/lu";

interface PathTabProps {
  id: string;
  label: string;
}

const tabs: PathTabProps[] = [
  { id: "akademik", label: "Jalur Prestasi" },
  { id: "non-akademik", label: "Jalur Non-Akademik" },
];

interface ApiRegistrationPathItem {
  id: number;
  name: string;
  benefit: string;
  order: number;
  isActive: number | boolean;
  registrationPathId: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiRegistrationPath {
  id: number;
  name: string;
  photoUrl: string | null;
  requiresTerms: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  registrationPathItems: ApiRegistrationPathItem[];
}

export default function AdminRegistrationPathPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [isSavingPaths, setIsSavingPaths] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoDrafts, setPhotoDrafts] = useState<
    Record<string, { file: File; previewUrl: string }>
  >({});
  const [pathByTab, setPathByTab] = useState<
    Record<string, ApiRegistrationPath | null>
  >({
    akademik: null,
    "non-akademik": null,
  });
  const [initialSnapshot, setInitialSnapshot] = useState<{
    akademik: BenefitItem[];
    nonAkademik: BenefitItem[];
    pathByTab: Record<string, ApiRegistrationPath | null>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showAlert } = useAlert();

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const activePath = pathByTab[activeTab];
  const activePhotoDraft = photoDrafts[activeTab];
  const activePhotoUrl = activePath?.photoUrl;
  const [akademik, setAkademik] = useState<BenefitItem[]>([
    {
      id: "a1",
      title: "Peringkat 1 Kelas",
      benefit: "Gratis SPP 9 Bulan",
      order: 1,
      isActive: true,
    },
    {
      id: "a2",
      title: "Peringkat 2 Kelas",
      benefit: "Untuk siswa dengan prestasi akademik",
      order: 2,
      isActive: true,
    },
    {
      id: "a3",
      title: "Peringkat 3 Kelas",
      benefit: "Untuk siswa dengan prestasi akademik",
      order: 3,
      isActive: true,
    },
  ]);

  const [nonAkademik, setNonAkademik] = useState<BenefitItem[]>([
    {
      id: "n1",
      title: "Juara Nasional",
      benefit: "Gratis SPP 1 Tahun",
      order: 1,
      isActive: true,
    },
    {
      id: "n2",
      title: "Juara Provinsi",
      benefit: "Untuk siswa dengan prestasi non-akademik",
      order: 2,
      isActive: true,
    },
    {
      id: "n3",
      title: "Juara Kabupaten",
      benefit: "Untuk siswa dengan prestasi non-akademik",
      order: 3,
      isActive: true,
    },
  ]);

  const normalizeItems = (items: ApiRegistrationPathItem[]): BenefitItem[] =>
    items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: String(item.id),
        title: item.name || "",
        benefit: item.benefit || "",
        order: (item.order ?? 0) + 1,
        isActive: item.isActive === 1 || item.isActive === true,
      }));

  const resolveTabPaths = (paths: ApiRegistrationPath[]) => {
    const sorted = paths.slice().sort((a, b) => a.order - b.order);
    const akademikPath =
      sorted.find((path) => path.name.toLowerCase().includes("prestasi")) ||
      sorted[0] ||
      null;
    const nonAkademikPath =
      sorted.find((path) => path.name.toLowerCase().includes("non")) ||
      sorted.find((path) => path.id !== akademikPath?.id) ||
      null;

    return { akademik: akademikPath, "non-akademik": nonAkademikPath };
  };

  const fetchRegistrationPaths = async () => {
    setIsLoadingPaths(true);
    try {
      const response = await fetch(`/api/backoffice/registration-paths`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert({
          title: "Gagal memuat data",
          description: data?.message || "Terjadi kesalahan saat mengambil data",
          variant: "error",
        });
        return;
      }

      const resolved = resolveTabPaths(data || []);
      const akademikItems = resolved.akademik
        ? normalizeItems(resolved.akademik.registrationPathItems || [])
        : [];
      const nonAkademikItems = resolved["non-akademik"]
        ? normalizeItems(resolved["non-akademik"]?.registrationPathItems || [])
        : [];

      setPathByTab(resolved);
      setAkademik(akademikItems);
      setNonAkademik(nonAkademikItems);
      setInitialSnapshot({
        akademik: akademikItems,
        nonAkademik: nonAkademikItems,
        pathByTab: resolved,
      });
    } catch (error) {
      console.error("Registration paths fetch error:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Gagal mengambil data jalur pendaftaran",
        variant: "error",
      });
    } finally {
      setIsLoadingPaths(false);
    }
  };

  useEffect(() => {
    fetchRegistrationPaths();
  }, [showAlert]);

  const buildPayloadItems = (items: BenefitItem[]) =>
    items.map((item) => ({
      id: Number(item.id) || 0,
      name: item.title?.trim() || "",
      benefit: item.benefit?.trim() || "",
      order: Math.max(0, (Number(item.order) || 0) - 1),
      isActive: Boolean(item.isActive),
    }));

  const handleSaveChanges = async () => {
    setIsSavingPaths(true);
    try {
      const payload = {
        paths: [
          {
            id: pathByTab.akademik?.id ?? 0,
            registrationPathItems: buildPayloadItems(akademik),
          },
          {
            id: pathByTab["non-akademik"]?.id ?? 0,
            registrationPathItems: buildPayloadItems(nonAkademik),
          },
        ],
      };

      const response = await fetch(`/api/backoffice/registration-paths`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert({
          title: "Gagal menyimpan",
          description: data?.message || "Terjadi kesalahan saat menyimpan",
          variant: "error",
        });
        return;
      }

      setInitialSnapshot({
        akademik: [...akademik],
        nonAkademik: [...nonAkademik],
        pathByTab: { ...pathByTab },
      });

      showAlert({
        title: "Berhasil",
        description: "Perubahan jalur pendaftaran berhasil disimpan",
        variant: "success",
      });
    } catch (error) {
      console.error("Registration paths save error:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Gagal menyimpan perubahan",
        variant: "error",
      });
    } finally {
      setIsSavingPaths(false);
    }
  };

  const handleCancelChanges = () => {
    if (!initialSnapshot) return;
    setAkademik(initialSnapshot.akademik);
    setNonAkademik(initialSnapshot.nonAkademik);
    setPathByTab(initialSnapshot.pathByTab);
    Object.values(photoDrafts).forEach((draft) =>
      URL.revokeObjectURL(draft.previewUrl),
    );
    setPhotoDrafts({});
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const setDraftFile = (file: File | null) => {
    setPhotoDrafts((prev) => {
      const next = { ...prev };
      const existing = next[activeTab];
      if (existing?.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      if (!file) {
        delete next[activeTab];
        return next;
      }

      next[activeTab] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert({
        title: "Format tidak didukung",
        description: "Hanya file gambar (PNG/JPG) yang diterima",
        variant: "warning",
      });
      event.target.value = "";
      return;
    }

    setDraftFile(file);

    event.target.value = "";
  };

  const handleDropAreaDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDropAreaDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropAreaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert({
        title: "Format tidak didukung",
        description: "Hanya file gambar (PNG/JPG) yang diterima",
        variant: "warning",
      });
      return;
    }

    setDraftFile(file);
  };

  const handleUploadPhoto = async () => {
    const activePathId = pathByTab[activeTab]?.id;
    if (!activePathId) {
      showAlert({
        title: "Gagal unggah",
        description: "Jalur pendaftaran tidak ditemukan",
        variant: "error",
      });
      return;
    }

    if (!activePhotoDraft?.file) {
      showAlert({
        title: "Gagal unggah",
        description: "Pilih foto terlebih dahulu",
        variant: "warning",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("photo", activePhotoDraft.file);

      const response = await fetch(
        `/api/backoffice/registration-paths/${activePathId}/photo`,
        {
          method: "POST",
          headers: {
            ...getAuthHeader(),
          },
          body: uploadFormData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        showAlert({
          title: "Gagal unggah",
          description: data?.message || "Terjadi kesalahan saat mengunggah",
          variant: "error",
        });
        return;
      }

      URL.revokeObjectURL(activePhotoDraft.previewUrl);
      setPhotoDrafts((prev) => {
        const next = { ...prev };
        delete next[activeTab];
        return next;
      });

      showAlert({
        title: "Berhasil",
        description: "Foto jalur pendaftaran berhasil diunggah",
        variant: "success",
      });

      await fetchRegistrationPaths();
    } catch (error) {
      console.error("Registration paths photo upload error:", error);
      showAlert({
        title: "Terjadi Kesalahan",
        description: "Gagal mengunggah foto jalur pendaftaran",
        variant: "error",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full w-full bg-white rounded-md drop-shadow-sm p-6">
        <TitleSection
          title="Edit Jalur Pendaftaran"
          subtitle="Menampilkan daftar jalur pendaftaran yang dapat diubah deskripsi dan fotonya"
        />
        <SectionCard
          title="Jalur Pendaftaran"
          className="w-full mb-10"
          handleSaveChanges={handleSaveChanges}
          isLoading={isLoadingPaths || isSavingPaths}
          leftButton={
            null
            // <TextButton
            //   variant="outline"
            //   text="Batalkan"
            //   onClick={handleCancelChanges}
            // />
          }
        >
          <div className="space-y-6">
            <div className="border border-blue-200 rounded-md">
              <BenefitList
                title="Prestasi Akademik"
                items={akademik}
                onChange={setAkademik}
              />
            </div>

            <div className="border border-gray-200 rounded-md">
              <BenefitList
                title="Prestasi Non-Akademik"
                items={nonAkademik}
                onChange={setNonAkademik}
              />
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Foto Jalur Pendaftaran (Landing Page)"
          className="w-full"
          saveButtonText="Unggah Gambar"
          saveButtonIcon={<LuUpload />}
          handleSaveChanges={handleUploadPhoto}
          isLoading={isLoadingPaths || isUploadingPhoto}
          saveButtonDisabled={!activePhotoDraft?.file}
          leftButton={
            <TextButton
              variant="outline-danger"
              icon={<LuTrash2 />}
              className={` ${activePhotoDraft?.previewUrl ? "opacity-100" : "opacity-0"}`}
              isLoading={isUploadingPhoto}
              text="Hapus Gambar"
              onClick={() => setDraftFile(null)}
            />
          }
        >
          <div className="w-full h-fit p-4">
            <div className="h-full grid gap-6 grid-cols-2">
              <div className="w-full h-full flex flex-col gap-2 rounded-md">
                <div className="flex flex-row bg-gray-200 w-full rounded-full justify-center gap-1 sm:gap-0">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full px-4 sm:px-8 py-2 text-sm rounded-full ${index === 0 ? "rounded-l-full rounded-r-none " : "rounded-l-none rounded-r-full"} font-semibold transition-all duration-300 text-sm ${
                        activeTab === tab.id
                          ? "bg-[#1B5E20] text-white shadow-lg"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div
                  onDragOver={handleDropAreaDragOver}
                  onDragEnter={handleDropAreaDragOver}
                  onDragLeave={handleDropAreaDragLeave}
                  onDrop={handleDropAreaDrop}
                  className={`w-full h-full flex flex-col border-2 border-dashed rounded-xl justify-center items-center border-primary bg-gray-100 ${isDragOver ? "bg-green-50 border-green-300" : ""}`}
                >
                  <div className="h-fit w-fit justify-center items-center flex flex-col gap-3">
                    {activePhotoDraft?.previewUrl ? (
                      <>
                        <img
                          src={activePhotoDraft.previewUrl}
                          alt="Preview"
                          className="w-48 h-32 object-cover rounded-md shadow-sm"
                        />
                        <div className="flex gap-2 mt-2">
                          <TextButton
                            variant="primary"
                            text="Pilih Foto Lain"
                            onClick={handlePickPhoto}
                          />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <LuUpload className="text-primary mx-auto my-auto text-6xl" />
                        <TextButton
                          variant="primary"
                          text="Pilih Foto"
                          className="py-1! rounded-md!"
                          onClick={handlePickPhoto}
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <div className="flex flex-col items-center">
                          <div>Seret dan Lepas sebuah foto</div>
                          <div className="text-xs text-gray-600 h-fit ">
                            <span className="text-red-500">*</span> Rekomendasi
                            Jenis File Foto: PNG, JPG
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 h-fit ">
                  <span className="text-red-500">*</span> Foto akan langsung
                  digunakan di halaman Landing Page
                </div>
              </div>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full h-full rounded-md overflow-hidden bg-gray-50">
                  {activePhotoUrl ? (
                    <img
                      src={activePhotoUrl}
                      alt={`Foto ${activePath?.name || activeTabData?.label || ""}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      {activePath?.name || activeTabData?.label}
                    </div>
                  )}
                </div>
                <div className="w-full h-fit py-1 px-3 text-xs text-left rounded-full ">
                  <span className="text-red-500">*</span> Foto{" "}
                  {activeTabData?.label}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

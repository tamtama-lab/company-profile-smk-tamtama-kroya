"use client";

import { TitleSection } from "@/components/TitleSection/index";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import {
  createPageTwoPdfObjectUrl,
  generatePageTwoPdfBlob,
} from "@/utils/pdfPageTwoTemplateGenerator";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DocumentFormData, documentSchema } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import FirstTab from "./TabContent/firstTab";
import SecondTab from "./TabContent/secondTab";

type PageTwoConfig = {
  title?: string;
  letterNumber?: string;
  opening?: string;
  content?: string;
  closing?: string;
  studentInfoFields?: string[];
};

type PageTwoResponse = {
  academicYear?: {
    name?: string;
    formatted?: string;
  };
  config?: PageTwoConfig;
};

type PageThreeConfig = {
  pageThreeUrl?: string;
  pageThreeType?: string;
};

const DEFAULT_FORM_VALUES: DocumentFormData = {
  letterTittle: "",
  letterNumber: "",
  letterOpening: "",
  letterContent: "",
  letterClosing: "",
};

const DEFAULT_STUDENT_INFO_FIELDS = [
  "STUDENT_NAME",
  "REGISTRATION_NUMBER",
  "ACCEPTANCE_STATUS",
  "MAJOR_CHOICE",
];

const readResponseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getApiMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: string }).message;
    const maybeError = (data as { error?: string }).error;
    return maybeMessage || maybeError || fallback;
  }

  return fallback;
};

export default function BuktiPendaftaranPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [displayPreview, setDisplayPreview] = useState(true);
  const [isLoadingTwo, setIsLoadingTwo] = useState(false);
  const [isSavingTwo, setIsSavingTwo] = useState(false);
  const [isSavingThree, setIsSavingThree] = useState(false);
  const [isGeneratingPreviewTwo, setIsGeneratingPreviewTwo] = useState(false);
  const [pageTwoPreviewUrl, setPageTwoPreviewUrl] = useState<string | null>(
    null,
  );
  const [academicYearsLabel, setAcademicYearsLabel] =
    useState<string>("2026/2027");
  const [initialFormValues, setInitialFormValues] =
    useState<DocumentFormData>(DEFAULT_FORM_VALUES);
  const [studentInfoFields, setStudentInfoFields] = useState<string[]>(
    DEFAULT_STUDENT_INFO_FIELDS,
  );
  const [existingPageThreeUrl, setExistingPageThreeUrl] = useState<
    string | null
  >(null);
  const [existingPageThreeType, setExistingPageThreeType] = useState<
    string | null
  >(null);
  const { showAlert } = useAlert();

  const tabs = [
    { id: "tab1", label: "PDF Rangkap ke 2" },
    { id: "tab2", label: "PDF Rangkap ke 3" },
  ];

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const [photoDrafts, setPhotoDrafts] = useState<
    Record<string, { file: File; previewUrl: string }>
  >({});

  const mapTwoConfigToForm = useCallback((config: PageTwoConfig) => {
    return {
      letterTittle: config.title ?? "",
      letterNumber: config.letterNumber ?? "",
      letterOpening: config.opening ?? "",
      letterContent: config.content ?? "",
      letterClosing: config.closing ?? "",
    };
  }, []);

  const fetchPageTwoConfig = useCallback(async () => {
    setIsLoadingTwo(true);
    try {
      const response = await fetch("/api/backoffice/pdf-configs/2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        cache: "no-store",
      });

      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getApiMessage(data, "Gagal memuat konfigurasi PDF halaman 2"),
        );
      }

      const responseData = (data as PageTwoResponse) ?? {};
      const config = (responseData.config ?? {}) as PageTwoConfig;
      const formattedAcademicYear =
        responseData.academicYear?.formatted ||
        responseData.academicYear?.name ||
        "2026/2027";
      const mappedValues = mapTwoConfigToForm(config);
      form.reset(mappedValues);
      setInitialFormValues(mappedValues);
      setAcademicYearsLabel(formattedAcademicYear);
      setStudentInfoFields(
        Array.isArray(config.studentInfoFields) &&
          config.studentInfoFields.length
          ? config.studentInfoFields
          : DEFAULT_STUDENT_INFO_FIELDS,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memuat konfigurasi PDF halaman 2";
      showAlert({
        title: "Gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setIsLoadingTwo(false);
    }
  }, [form, mapTwoConfigToForm, showAlert]);

  const fetchPageThreeConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/backoffice/pdf-configs/3", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        cache: "no-store",
      });

      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(getApiMessage(data, "Gagal memuat PDF halaman 3"));
      }

      const config = ((data as { config?: PageThreeConfig })?.config ??
        {}) as PageThreeConfig;
      setExistingPageThreeUrl(config.pageThreeUrl ?? null);
      setExistingPageThreeType(config.pageThreeType ?? null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat  PDF halaman 3";
      showAlert({
        title: "Gagal",
        description: message,
        variant: "error",
      });
    }
  }, [showAlert]);

  useEffect(() => {
    void fetchPageTwoConfig();
    void fetchPageThreeConfig();
  }, [fetchPageThreeConfig, fetchPageTwoConfig]);

  const watchedTitle = form.watch("letterTittle");
  const watchedLetterNumber = form.watch("letterNumber");
  const watchedOpening = form.watch("letterOpening");
  const watchedContent = form.watch("letterContent");
  const watchedClosing = form.watch("letterClosing");

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setIsGeneratingPreviewTwo(true);
      try {
        const blob = await generatePageTwoPdfBlob({
          title: watchedTitle,
          letterNumber: watchedLetterNumber,
          opening: watchedOpening,
          content: watchedContent,
          closing: watchedClosing,
          academicYears: academicYearsLabel,
        });

        if (isCancelled) {
          return;
        }

        setPageTwoPreviewUrl((prev) => createPageTwoPdfObjectUrl(blob, prev));
      } catch (error) {
        console.error("Gagal membuat preview PDF halaman dua:", error);
      } finally {
        if (!isCancelled) {
          setIsGeneratingPreviewTwo(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    watchedClosing,
    watchedContent,
    watchedLetterNumber,
    watchedOpening,
    watchedTitle,
    academicYearsLabel,
  ]);

  useEffect(() => {
    return () => {
      setPageTwoPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    };
  }, []);

  const onSubmit = async (values: DocumentFormData) => {
    setIsSavingTwo(true);
    try {
      const payload = {
        title: values.letterTittle,
        letterNumber: values.letterNumber,
        opening: values.letterOpening,
        content: values.letterContent,
        closing: values.letterClosing,
        studentInfoFields,
      };

      const response = await fetch("/api/backoffice/pdf-configs/2", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getApiMessage(data, "Gagal menyimpan konfigurasi PDF halaman 2"),
        );
      }

      setInitialFormValues(values);
      showAlert({
        title: "Berhasil",
        description: "PDF rangkap ke 2 berhasil diunggah",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan konfigurasi PDF halaman 2";
      showAlert({
        title: "Gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSavingTwo(false);
    }
  };

  const setDraftFile = (tabId: string, file: File | null) => {
    setPhotoDrafts((prev) => {
      const next = { ...prev };
      const existing = next[tabId];
      if (existing?.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      if (!file) {
        delete next[tabId];
        return next;
      }

      next[tabId] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
  };

  const detectPageThreeType = (file: File) => {
    if (file.type === "application/pdf") {
      return "pdf";
    }

    return "image";
  };

  const savePageThree = async () => {
    const tabId = tabs[1].id;
    const draftFile = photoDrafts[tabId]?.file ?? null;

    if (!draftFile && !existingPageThreeUrl) {
      showAlert({
        title: "Dokumen belum dipilih",
        description: "Silakan unggah file terlebih dahulu",
        variant: "warning",
      });
      return;
    }

    setIsSavingThree(true);
    try {
      let pageThreeUrl = existingPageThreeUrl;
      let pageThreeType = existingPageThreeType;

      if (draftFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", draftFile);

        const uploadResponse = await fetch(
          "/api/backoffice/pdf-configs/3/upload",
          {
            method: "POST",
            headers: {
              ...getAuthHeader(),
            },
            body: uploadFormData,
          },
        );

        const uploadData = await readResponseJson(uploadResponse);

        if (!uploadResponse.ok) {
          throw new Error(
            getApiMessage(uploadData, "Gagal upload dokumen halaman 3"),
          );
        }

        pageThreeUrl =
          (
            uploadData as {
              pageThreeUrl?: string;
              url?: string;
              fileUrl?: string;
            }
          )?.pageThreeUrl ??
          (uploadData as { url?: string })?.url ??
          (uploadData as { fileUrl?: string })?.fileUrl ??
          null;
        pageThreeType =
          (uploadData as { pageThreeType?: string })?.pageThreeType ??
          detectPageThreeType(draftFile);
      }

      if (!pageThreeUrl) {
        throw new Error("URL dokumen halaman 3 tidak ditemukan");
      }

      const response = await fetch("/api/backoffice/pdf-configs/3", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          pageThreeUrl,
          pageThreeType: pageThreeType ?? "image",
        }),
      });

      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getApiMessage(data, "Gagal menyimpan konfigurasi PDF halaman 3"),
        );
      }

      setExistingPageThreeUrl(pageThreeUrl);
      setExistingPageThreeType(pageThreeType ?? "image");
      setDraftFile(tabId, null);

      showAlert({
        title: "Berhasil",
        description: "Konfigurasi PDF rangkap ke 3 berhasil disimpan",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan konfigurasi PDF halaman 3";
      showAlert({
        title: "Gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSavingThree(false);
    }
  };

  const validateUploadFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: "Ukuran terlalu besar",
        description: `Ukuran file maksimal 5MB`,
        variant: "warning",
      });
      return `Ukuran file maksimal 5MB`;
    }

    const allowedTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      showAlert({
        title: "Format tidak didukung",
        description: "Hanya file PDF, PNG, JPG, dan JPEG yang diterima",
        variant: "warning",
      });
      return "Hanya file PDF, PNG, JPG, dan JPEG yang diterima";
    }

    return null;
  };

  const handleResetPageTwo = () => {
    form.reset(initialFormValues);
  };

  const handleResetPageThree = () => {
    setDraftFile(tabs[1].id, null);
  };

  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Bukti Pendaftaran"
          subtitle="Halaman ini digunakan untuk mengedit dokumen PD yang akan dikirimkan ke calon murid baru sebagai bukti pendaftaran nya diterima oleh sekolah"
        />
        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm p-3">
          {/* Tabs Navigation */}
          <div className="flex flex-row  w-full rounded-none justify-between items-center gap-1 sm:gap-0 mb-2">
            <div className="w-fit h-fit rounded-sm bg-white drop-shadow-md">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`w-64 px-4 sm:px-8 py-2 sm:py-3 rounded-sm font-semibold transition-all duration-300 text-sm ${
                    activeTab === index
                      ? "bg-[#1B5E20] text-white shadow-lg"
                      : "bg-white text-gray-700  hover:bg-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 0 ? (
            <FirstTab
              displayPreview={displayPreview}
              onTogglePreview={() => setDisplayPreview((prev) => !prev)}
              form={form}
              onCancel={handleResetPageTwo}
              onSave={form.handleSubmit(onSubmit)}
              isLoading={isLoadingTwo || isSavingTwo}
              previewUrl={pageTwoPreviewUrl}
              isGeneratingPreview={isGeneratingPreviewTwo}
            />
          ) : (
            <SecondTab
              displayPreview={displayPreview}
              onTogglePreview={() => setDisplayPreview((prev) => !prev)}
              draftFile={photoDrafts[tabs[activeTab].id]?.file ?? null}
              draftPreviewUrl={
                photoDrafts[tabs[activeTab].id]?.previewUrl ?? null
              }
              existingPreviewUrl={existingPageThreeUrl}
              onFile={(file) => setDraftFile(tabs[activeTab].id, file)}
              onRemove={() => setDraftFile(tabs[activeTab].id, null)}
              onValidate={validateUploadFile}
              onSave={savePageThree}
              onCancel={handleResetPageThree}
              isSaving={isSavingThree}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { TitleSection } from "@/components/TitleSection/index";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import {
  createPageTwoPdfObjectUrl,
  generatePageTwoPdfBlob,
} from "@/utils/pdfPageTwoTemplateGenerator";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DocumentFormData,
  documentSchema,
  PageThreeConfig,
  PageTwoConfig,
  PageTwoResponse,
} from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import FirstTab from "./TabContent/firstTab";
import SecondTab from "./TabContent/secondTab";
import {
  ALL_STUDENT_INFO_FIELD_KEYS,
  DEFAULT_DISABLED_STUDENT_INFO_FIELDS,
  DEFAULT_FORM_VALUES,
  DEFAULT_STUDENT_INFO_FIELDS,
  DEFAULT_STUDENT_INFO_ORDER,
  getApiMessage,
  readResponseJson,
  STUDENT_INFO_FIELD_OPTIONS,
} from "./helper";

const ACADEMIC_YEAR_TOKEN = "{{ academic_years }}";
const ACADEMIC_YEAR_TOKEN_REGEX = /\{\{\s*academic_years\s*\}\}/gi;

const replaceAcademicYearTokenWithName = (value: string, yearName: string) => {
  if (!value) return value;
  return value.replace(ACADEMIC_YEAR_TOKEN_REGEX, yearName);
};

const replaceAcademicYearNameWithToken = (value: string, yearName: string) => {
  if (!value || !yearName) return value;
  return value.split(yearName).join(ACADEMIC_YEAR_TOKEN);
};

export default function BuktiPendaftaranPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [displayPreview, setDisplayPreview] = useState(true);
  const [isLoadingTwo, setIsLoadingTwo] = useState(false);
  const [isSavingTwo, setIsSavingTwo] = useState(false);
  const [isSavingStudentInfoToggle, setIsSavingStudentInfoToggle] =
    useState(false);
  const [isSavingThree, setIsSavingThree] = useState(false);
  const [isGeneratingPreviewTwo, setIsGeneratingPreviewTwo] = useState(false);
  const [pageTwoPreviewUrl, setPageTwoPreviewUrl] = useState<string | null>(
    null,
  );
  const [academicYearsLabel, setAcademicYearsLabel] =
    useState<string>("2026/2027");
  const [initialFormValues, setInitialFormValues] =
    useState<DocumentFormData>(DEFAULT_FORM_VALUES);
  const [studentInfoOrder, setStudentInfoOrder] = useState<string[]>(
    DEFAULT_STUDENT_INFO_ORDER,
  );
  const [disabledStudentInfoFieldKeys, setDisabledStudentInfoFieldKeys] =
    useState<string[]>(DEFAULT_DISABLED_STUDENT_INFO_FIELDS);
  const [initialStudentInfoOrder, setInitialStudentInfoOrder] = useState<
    string[]
  >(DEFAULT_STUDENT_INFO_ORDER);
  const [
    initialDisabledStudentInfoFieldKeys,
    setInitialDisabledStudentInfoFieldKeys,
  ] = useState<string[]>(DEFAULT_DISABLED_STUDENT_INFO_FIELDS);
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

  const mapTwoConfigToForm = useCallback(
    (config: PageTwoConfig, academicYearName: string) => {
      return {
        letterTittle: replaceAcademicYearTokenWithName(
          config.title ?? "",
          academicYearName,
        ),
        letterNumber: replaceAcademicYearTokenWithName(
          config.letterNumber ?? "",
          academicYearName,
        ),
        letterOpening: replaceAcademicYearTokenWithName(
          config.opening ?? "",
          academicYearName,
        ),
        letterContent: replaceAcademicYearTokenWithName(
          config.content ?? "",
          academicYearName,
        ),
        letterClosing: replaceAcademicYearTokenWithName(
          config.closing ?? "",
          academicYearName,
        ),
      };
    },
    [],
  );

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
      const academicYearName =
        responseData.academicYear?.name ||
        responseData.academicYear?.formatted ||
        "2026/2027";
      const mappedValues = mapTwoConfigToForm(config, academicYearName);
      const fetchedActiveStudentInfoFields =
        Array.isArray(config.studentInfoFields) &&
        config.studentInfoFields.length
          ? config.studentInfoFields.filter((fieldKey): fieldKey is string =>
              ALL_STUDENT_INFO_FIELD_KEYS.includes(fieldKey),
            )
          : DEFAULT_STUDENT_INFO_FIELDS;
      const nextStudentInfoOrder = [
        ...fetchedActiveStudentInfoFields,
        ...ALL_STUDENT_INFO_FIELD_KEYS.filter(
          (key) => !fetchedActiveStudentInfoFields.includes(key),
        ),
      ];
      const nextDisabledStudentInfoFieldKeys =
        ALL_STUDENT_INFO_FIELD_KEYS.filter(
          (key) => !fetchedActiveStudentInfoFields.includes(key),
        );

      form.reset(mappedValues);
      setInitialFormValues(mappedValues);
      setAcademicYearsLabel(academicYearName);
      setStudentInfoOrder(nextStudentInfoOrder);
      setDisabledStudentInfoFieldKeys(nextDisabledStudentInfoFieldKeys);
      setInitialStudentInfoOrder(nextStudentInfoOrder);
      setInitialDisabledStudentInfoFieldKeys(nextDisabledStudentInfoFieldKeys);
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

  const activeStudentInfoFields = useMemo(
    () =>
      studentInfoOrder.filter(
        (fieldKey) => !disabledStudentInfoFieldKeys.includes(fieldKey),
      ),
    [disabledStudentInfoFieldKeys, studentInfoOrder],
  );

  const studentInfoFieldItems = useMemo(
    () =>
      studentInfoOrder.map((fieldKey) => {
        const fieldMeta = STUDENT_INFO_FIELD_OPTIONS.find(
          (option) => option.key === fieldKey,
        );

        return {
          key: fieldKey,
          placeholder: fieldMeta?.placeholder || `{{${fieldKey}}}`,
          label: fieldMeta?.label || fieldKey,
          source: fieldMeta?.source || "-",
          enabled: !disabledStudentInfoFieldKeys.includes(fieldKey),
        };
      }),
    [disabledStudentInfoFieldKeys, studentInfoOrder],
  );

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
          studentInfoFields: activeStudentInfoFields,
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
    activeStudentInfoFields,
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

  const savePageTwoConfig = useCallback(
    async (
      values: DocumentFormData,
      nextActiveStudentInfoFields: string[],
      options?: { showSuccessAlert?: boolean; source?: "submit" | "toggle" },
    ) => {
      const showSuccessAlert = options?.showSuccessAlert ?? true;
      const source = options?.source ?? "submit";

      if (source === "toggle") {
        setIsSavingStudentInfoToggle(true);
      } else {
        setIsSavingTwo(true);
      }
      try {
        const payload = {
          title: replaceAcademicYearNameWithToken(
            values.letterTittle,
            academicYearsLabel,
          ),
          letterNumber: replaceAcademicYearNameWithToken(
            values.letterNumber,
            academicYearsLabel,
          ),
          opening: replaceAcademicYearNameWithToken(
            values.letterOpening,
            academicYearsLabel,
          ),
          content: replaceAcademicYearNameWithToken(
            values.letterContent,
            academicYearsLabel,
          ),
          closing: replaceAcademicYearNameWithToken(
            values.letterClosing,
            academicYearsLabel,
          ),
          studentInfoFields: nextActiveStudentInfoFields,
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

        if (showSuccessAlert) {
          showAlert({
            title: "Berhasil",
            description: "PDF rangkap ke 2 berhasil diunggah",
            variant: "success",
          });
        }

        return true;
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
        return false;
      } finally {
        if (source === "toggle") {
          setIsSavingStudentInfoToggle(false);
        } else {
          setIsSavingTwo(false);
        }
      }
    },
    [academicYearsLabel, showAlert],
  );

  const onSubmit = async (values: DocumentFormData) => {
    const isSaved = await savePageTwoConfig(values, activeStudentInfoFields, {
      showSuccessAlert: true,
      source: "submit",
    });

    if (isSaved) {
      setInitialFormValues(values);
      setInitialStudentInfoOrder(studentInfoOrder);
      setInitialDisabledStudentInfoFieldKeys(disabledStudentInfoFieldKeys);
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

  const handleToggleStudentInfoField = useCallback(
    async (fieldKey: string) => {
      if (isSavingStudentInfoToggle) {
        return;
      }

      const previousDisabledKeys = disabledStudentInfoFieldKeys;
      const nextDisabledKeys = previousDisabledKeys.includes(fieldKey)
        ? previousDisabledKeys.filter((key) => key !== fieldKey)
        : [...previousDisabledKeys, fieldKey];
      const nextActiveStudentInfoFields = studentInfoOrder.filter(
        (key) => !nextDisabledKeys.includes(key),
      );
      const currentValues = form.getValues();

      setDisabledStudentInfoFieldKeys(nextDisabledKeys);

      const isSaved = await savePageTwoConfig(
        currentValues,
        nextActiveStudentInfoFields,
        {
          showSuccessAlert: false,
          source: "toggle",
        },
      );

      if (isSaved) {
        setInitialFormValues(currentValues);
        setInitialStudentInfoOrder(studentInfoOrder);
        setInitialDisabledStudentInfoFieldKeys(nextDisabledKeys);
        return;
      }

      setDisabledStudentInfoFieldKeys(previousDisabledKeys);
    },
    [
      disabledStudentInfoFieldKeys,
      form,
      isSavingStudentInfoToggle,
      savePageTwoConfig,
      studentInfoOrder,
    ],
  );

  const handleReorderStudentInfoField = useCallback(
    (draggedKey: string, targetKey: string) => {
      if (!draggedKey || !targetKey || draggedKey === targetKey) {
        return;
      }

      setStudentInfoOrder((previousOrder) => {
        const draggedIndex = previousOrder.indexOf(draggedKey);
        const targetIndex = previousOrder.indexOf(targetKey);

        if (draggedIndex < 0 || targetIndex < 0) {
          return previousOrder;
        }

        const nextOrder = [...previousOrder];
        nextOrder.splice(draggedIndex, 1);
        nextOrder.splice(targetIndex, 0, draggedKey);
        return nextOrder;
      });
    },
    [],
  );

  const handleResetPageTwo = () => {
    form.reset(initialFormValues);
    setStudentInfoOrder(initialStudentInfoOrder);
    setDisabledStudentInfoFieldKeys(initialDisabledStudentInfoFieldKeys);
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
              isStudentInfoToggleLoading={isSavingStudentInfoToggle}
              previewUrl={pageTwoPreviewUrl}
              isGeneratingPreview={isGeneratingPreviewTwo}
              studentInfoFields={studentInfoFieldItems}
              onToggleStudentInfoField={handleToggleStudentInfoField}
              onReorderStudentInfoField={handleReorderStudentInfoField}
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

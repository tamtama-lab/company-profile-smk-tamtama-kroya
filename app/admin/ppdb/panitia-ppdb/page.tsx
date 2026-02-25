"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { SectionCard } from "@/components/Card/SectionCard";
import { DateInput } from "@/components/InputForm/DateInput";
import SelectInput from "@/components/InputForm/SelectInput";
import { TitleSection } from "@/components/TitleSection";
import { useAlert } from "@/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { PhotoUpload } from "@/components/Upload/PhotoUpload";
import { getAuthHeader } from "@/utils/auth";
import {
  createPdfObjectUrl,
  generatePendaftaranUlangPdfBlob,
} from "@/utils/pdfTemplateGenerator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  buildPreviewRegistration,
  getApiErrorMessage,
  safeReadJson,
  toNullableString,
} from "./helpers";
import {
  committeeSchema,
  type AcademicYearOption,
  type CommitteeData,
  type CommitteeFormData,
  type PreviewCommitteeOverride,
} from "./types";

export default function PanitiaPpdbPage() {
  const { showAlert } = useAlert();

  const [displayPreview, setDisplayPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInlinePreview, setIsGeneratingInlinePreview] =
    useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [isLoadingCommittee, setIsLoadingCommittee] = useState(false);

  const [selectedYearId, setSelectedYearId] = useState<string | number | "">(
    "",
  );
  const [yearOptions, setYearOptions] = useState<AcademicYearOption[]>([]);

  const [committeeId, setCommitteeId] = useState<number | null>(null);

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>("");
  const [stampPreview, setStampPreview] = useState<string>("");
  const [inlinePdfPreviewUrl, setInlinePdfPreviewUrl] = useState<string>("");
  const previewDebounceRef = useRef<number | null>(null);
  const previewRequestRef = useRef(0);

  const form = useForm<CommitteeFormData>({
    resolver: zodResolver(committeeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      position: "",
      nip: null,
      place: "",
      defaultDate: "",
    },
  });
  const { isValid } = form.formState;

  const isBusy = isSaving || isLoadingCommittee || isLoadingYears;

  const toDataUrl = (file: File, setter: (value: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetCommitteeForm = useCallback(() => {
    setCommitteeId(null);
    setSignatureFile(null);
    setStampFile(null);
    setSignaturePreview("");
    setStampPreview("");
    setInlinePdfPreviewUrl("");
    form.reset({
      name: "",
      position: "",
      nip: null,
      place: "",
      defaultDate: "",
    });
  }, [form]);

  const clearInlinePdfPreview = useCallback(() => {
    setInlinePdfPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return "";
    });
  }, []);

  const cancelPendingPreview = useCallback(() => {
    if (previewDebounceRef.current) {
      window.clearTimeout(previewDebounceRef.current);
      previewDebounceRef.current = null;
    }

    previewRequestRef.current += 1;
  }, []);

  const handleSignatureChange = (file: File | null) => {
    if (!file) {
      setSignatureFile(null);
      setSignaturePreview("");
      return;
    }

    setSignatureFile(file);
    toDataUrl(file, setSignaturePreview);
  };

  const handleStampChange = (file: File | null) => {
    if (!file) {
      setStampFile(null);
      setStampPreview("");
      return;
    }

    setStampFile(file);
    toDataUrl(file, setStampPreview);
  };

  const uploadSignature = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("signature", file);

    const response = await fetch(
      "/api/backoffice/committees/upload-signature",
      {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || "Gagal upload tanda tangan",
      );
    }

    return data.signatureUrl || data.url || data.fileUrl || null;
  };

  const uploadStamp = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("stamp", file);

    const response = await fetch("/api/backoffice/committees/upload-stamp", {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Gagal upload stempel");
    }

    return data.stampUrl || data.url || data.fileUrl || null;
  };

  const loadAcademicYears = useCallback(async () => {
    setIsLoadingYears(true);
    try {
      const response = await fetch("/api/filters/options", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil tahun ajaran");
      }

      const data = await response.json();

      const mappedAcademicYears: AcademicYearOption[] = Array.isArray(
        data?.academicYears,
      )
        ? data.academicYears.map((item: { id: number; name: string }) => ({
            value: item.id,
            label: item.name,
          }))
        : [];

      const fallbackYears: AcademicYearOption[] = Array.isArray(data?.years)
        ? data.years.map((item: { value: string | number; label: string }) => ({
            value: item.value,
            label: item.label,
          }))
        : [];

      const finalOptions =
        mappedAcademicYears.length > 0 ? mappedAcademicYears : fallbackYears;

      setYearOptions(finalOptions);
      if (finalOptions.length > 0) {
        setSelectedYearId((prev) => prev || finalOptions[0].value);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat daftar tahun ajaran",
        variant: "error",
      });
    } finally {
      setIsLoadingYears(false);
    }
  }, [showAlert]);

  const loadCommitteeByAcademicYear = useCallback(
    async (academicYearId: string | number) => {
      setIsLoadingCommittee(true);
      try {
        const response = await fetch(
          `/api/backoffice/committees/academic-year/${academicYearId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
            cache: "no-store",
          },
        );

        if (response.status === 404) {
          resetCommitteeForm();
          return null;
        }

        const result = await safeReadJson(response);

        if (!response.ok) {
          showAlert({
            title: "Gagal",
            description: getApiErrorMessage(
              result,
              response.status,
              "Gagal memuat data panitia",
            ),
            variant: "error",
          });
          return null;
        }

        const dataSource = result as { data?: CommitteeData } | CommitteeData;
        const data: CommitteeData =
          (dataSource as { data?: CommitteeData })?.data ??
          (dataSource as CommitteeData);

        setCommitteeId(data?.id ?? null);
        setSignatureFile(null);
        setStampFile(null);
        setSignaturePreview(data?.signatureUrl || "");
        setStampPreview(data?.stampUrl || "");

        form.reset({
          name: data?.name || "",
          position: data?.position || "",
          nip: data?.nip ?? null,
          place: data?.place || "",
          defaultDate: data?.defaultDate || "",
        });

        return data;
      } catch (error) {
        console.error("Error loading committee:", error);
        showAlert({
          title: "Gagal",
          description:
            error instanceof Error
              ? `Gagal memuat data panitia: ${error.message}`
              : "Gagal memuat data panitia",
          variant: "error",
        });
        return null;
      } finally {
        setIsLoadingCommittee(false);
      }
    },
    [form, resetCommitteeForm, showAlert],
  );

  const onSubmit = async (values: CommitteeFormData) => {
    if (!selectedYearId) {
      showAlert({
        title: "Validasi",
        description: "Pilih tahun ajaran terlebih dahulu",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);

    try {
      let signatureUrl = signaturePreview;
      let stampUrl = stampPreview;

      if (signatureFile) {
        const uploadedSignatureUrl = await uploadSignature(signatureFile);
        if (!uploadedSignatureUrl) {
          throw new Error("Response upload tanda tangan tidak valid");
        }
        signatureUrl = uploadedSignatureUrl;
      }

      if (stampFile) {
        const uploadedStampUrl = await uploadStamp(stampFile);
        if (!uploadedStampUrl) {
          throw new Error("Response upload stempel tidak valid");
        }
        stampUrl = uploadedStampUrl;
      }

      if (!signatureUrl || !stampUrl) {
        showAlert({
          title: "Validasi",
          description: "Tanda tangan dan stempel wajib diunggah",
          variant: "error",
        });
        return;
      }

      const payload = {
        ...(committeeId ? { id: committeeId } : {}),
        academicYearId: Number(selectedYearId),
        name: values.name,
        position: values.position,
        nip: toNullableString(values.nip),
        place: values.place,
        defaultDate: values.defaultDate,
        signatureUrl,
        stampUrl,
      };

      const response = await fetch(
        `/api/backoffice/committees/academic-year/${selectedYearId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Gagal menyimpan panitia",
        );
      }

      showAlert({
        title: "Berhasil",
        description: "Data panitia PPDB berhasil disimpan",
        variant: "success",
      });

      await loadCommitteeByAcademicYear(selectedYearId);
    } catch (error) {
      console.error("Error saving committee:", error);
      showAlert({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan data panitia",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadAcademicYears();
  }, [loadAcademicYears]);

  useEffect(() => {
    if (!selectedYearId) return;
    loadCommitteeByAcademicYear(selectedYearId);
  }, [loadCommitteeByAcademicYear, selectedYearId]);

  const renderInlinePdfPreview = useCallback(
    async (overrideData?: PreviewCommitteeOverride) => {
      const requestId = ++previewRequestRef.current;

      try {
        setIsGeneratingInlinePreview(true);

        const registration = buildPreviewRegistration();
        const formValues = form.getValues();

        const effectivePreviewData = {
          name: overrideData?.name ?? formValues.name ?? "",
          position: overrideData?.position ?? formValues.position ?? "",
          nip: overrideData?.nip ?? formValues.nip ?? null,
          place: overrideData?.place ?? formValues.place ?? "",
          defaultDate:
            overrideData?.defaultDate ?? formValues.defaultDate ?? "",
          signatureUrl: overrideData?.signatureUrl ?? signaturePreview,
          stampUrl: overrideData?.stampUrl ?? stampPreview,
        };

        let blob: Blob | null = null;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= 2; attempt += 1) {
          try {
            blob = await generatePendaftaranUlangPdfBlob({
              registration,
              committee: {
                name: effectivePreviewData.name || "Panitia PPDB",
                position: effectivePreviewData.position || "Ketua",
                title: "Panitia Sistem Penerimaan Murid Baru",
                nip: toNullableString(effectivePreviewData.nip),
                place: effectivePreviewData.place || "Kroya",
                date: effectivePreviewData.defaultDate,
                signatureUrl: effectivePreviewData.signatureUrl,
                stampUrl: effectivePreviewData.stampUrl,
              },
            });
            break;
          } catch (error) {
            lastError = error;

            if (attempt === 1) {
              await new Promise((resolve) => setTimeout(resolve, 700));
            }
          }
        }

        if (!blob) {
          throw lastError ?? new Error("Gagal menyiapkan preview PDF");
        }

        if (requestId !== previewRequestRef.current) {
          return;
        }

        setInlinePdfPreviewUrl((previousUrl) =>
          createPdfObjectUrl(blob, previousUrl),
        );
      } catch (error) {
        if (requestId !== previewRequestRef.current) {
          return;
        }

        console.error("Failed to render inline PDF preview:", error);
        clearInlinePdfPreview();
        showAlert({
          title: "Gagal",
          description: "Tidak dapat menampilkan preview PDF di panel",
          variant: "error",
        });
      } finally {
        if (requestId === previewRequestRef.current) {
          setIsGeneratingInlinePreview(false);
        }
      }
    },
    [clearInlinePdfPreview, form, showAlert, signaturePreview, stampPreview],
  );

  const triggerPreviewDebounced = useCallback(
    (overrideData?: PreviewCommitteeOverride) => {
      cancelPendingPreview();

      previewDebounceRef.current = window.setTimeout(() => {
        void renderInlinePdfPreview(overrideData);
      }, 500);
    },
    [cancelPendingPreview, renderInlinePdfPreview],
  );

  const isPreviewReady =
    displayPreview && !isLoadingCommittee && !isLoadingYears;

  useEffect(() => {
    if (isLoadingCommittee || isLoadingYears) {
      cancelPendingPreview();
      clearInlinePdfPreview();
    }
  }, [
    cancelPendingPreview,
    clearInlinePdfPreview,
    isLoadingCommittee,
    isLoadingYears,
  ]);

  useEffect(() => {
    if (!displayPreview) {
      cancelPendingPreview();
      clearInlinePdfPreview();

      return;
    }

    if (!isPreviewReady || !isValid) {
      return;
    }

    triggerPreviewDebounced();
  }, [
    cancelPendingPreview,
    clearInlinePdfPreview,
    displayPreview,
    isPreviewReady,
    isValid,
    triggerPreviewDebounced,
  ]);

  useEffect(() => {
    if (!isPreviewReady) {
      return;
    }

    const subscription = form.watch(() => {
      if (isValid) {
        triggerPreviewDebounced();
      }
    });

    return () => {
      subscription.unsubscribe();
      cancelPendingPreview();
    };
  }, [
    cancelPendingPreview,
    form,
    isPreviewReady,
    isValid,
    triggerPreviewDebounced,
  ]);

  useEffect(() => {
    if (!isPreviewReady || !isValid) {
      return;
    }

    triggerPreviewDebounced();
  }, [
    isPreviewReady,
    isValid,
    signaturePreview,
    stampPreview,
    triggerPreviewDebounced,
  ]);

  useEffect(() => {
    return () => {
      cancelPendingPreview();

      if (inlinePdfPreviewUrl) {
        URL.revokeObjectURL(inlinePdfPreviewUrl);
      }
    };
  }, [cancelPendingPreview, inlinePdfPreviewUrl]);

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <TitleSection
          title="Pengaturan Panitia PPDB"
          subtitle="Halaman ini digunakan untuk mengatur nama panitia yang bertanggung jawab pada PPDB di periode tertentu"
        />

        <div className="w-full h-fit bg-white rounded-md drop-shadow-sm p-4">
          <div className="w-full flex flex-row justify-between p-3">
            <h2 className="text-lg font-semibold">Edit Panitia PPDB</h2>
            <TextButton
              variant="outline"
              isLoading={isBusy || isGeneratingInlinePreview}
              className="text-sm!"
              text={
                displayPreview ? "Sembunyikan Preview" : "Tampilkan Preview"
              }
              onClick={() => {
                if (displayPreview) {
                  setDisplayPreview(false);
                  return;
                }
                setDisplayPreview(true);
              }}
            />
          </div>

          <div className="w-full gap-x-3 h-fit flex flex-row">
            <div className={`${displayPreview ? "w-1/2" : "w-full"}`}>
              <SectionCard
                title="Informasi Panitia"
                className="w-full px-2"
                isLoading={isLoadingCommittee || isBusy}
                saveButtonDisabled={isBusy || isGeneratingInlinePreview}
                leftButton={
                  <TextButton
                    variant="outline"
                    text="Batalkan"
                    isLoading={isBusy || isGeneratingInlinePreview}
                    onClick={() => {
                      if (!selectedYearId) {
                        resetCommitteeForm();
                        return;
                      }
                      loadCommitteeByAcademicYear(selectedYearId);
                    }}
                  />
                }
                handleSaveChanges={form.handleSubmit(onSubmit)}
              >
                <Form {...form}>
                  <form className="w-full grid grid-cols-2 p-4 gap-4">
                    <FormItem>
                      <FormControl>
                        <SelectInput
                          label="Tahun Ajaran"
                          className="w-full"
                          value={selectedYearId}
                          onChange={(e) => setSelectedYearId(e.target.value)}
                          options={yearOptions}
                          placeholder="Pilih Tahun Ajaran"
                          isMandatory
                          disabled={isLoadingYears || isSaving}
                        />
                      </FormControl>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Nama Panitia"
                              placeholder="Masukkan Nama Panitia"
                              type="text"
                              isMandatory
                              disabled={isBusy}
                              error={form.formState.errors.name?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Jabatan"
                              isMandatory
                              placeholder="Masukkan Jabatan"
                              type="text"
                              disabled={isBusy}
                              error={form.formState.errors.position?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nip"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              value={field.value ?? ""}
                              limit={18}
                              onChange={(event) => {
                                const inputValue = event.target.value;
                                field.onChange(
                                  inputValue.trim().length === 0
                                    ? null
                                    : inputValue,
                                );
                              }}
                              label="NIP (Opsional)"
                              placeholder="Masukkan NIP"
                              type="number"
                              disabled={isBusy}
                              error={form.formState.errors.nip?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="place"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Tempat"
                              isMandatory
                              placeholder="Masukkan Tempat"
                              type="text"
                              disabled={isBusy}
                              error={form.formState.errors.place?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="defaultDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DateInput
                              label="Tanggal"
                              name="defaultDate"
                              value={field.value}
                              placeholder="Masukkan Tanggal"
                              max={new Date().toISOString().split("T")[0]}
                              isMandatory
                              onChange={(date) => {
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : "",
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>

                  <div className="px-4 py-2">
                    Upload Tanda Tangan dan Stempel
                  </div>
                  <div className="w-full mb-4 rounded-md px-4 col-span-2 flex flex-row gap-4 py-2">
                    <PhotoUpload
                      previewUrl={signaturePreview}
                      onFileSelect={handleSignatureChange}
                      onFileRemove={() => {
                        setSignatureFile(null);
                        setSignaturePreview("");
                      }}
                      disabled={isBusy}
                      label="Tanda Tangan"
                      textButton="Ganti Tanda Tangan"
                      isMandatory
                      className="w-1/2"
                    />
                    <PhotoUpload
                      previewUrl={stampPreview}
                      onFileSelect={handleStampChange}
                      onFileRemove={() => {
                        setStampFile(null);
                        setStampPreview("");
                      }}
                      disabled={isBusy}
                      label="Cap/Stempel"
                      textButton="Ganti Stempel"
                      isMandatory
                      className="w-1/2"
                    />
                  </div>
                </Form>
              </SectionCard>
            </div>

            {displayPreview && (
              <div className="w-1/2 border border-gray-300 shadow-sm rounded-md bg-white p-2">
                {isGeneratingInlinePreview ? (
                  <div className="h-full border border-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                    Menyiapkan preview PDF...
                  </div>
                ) : inlinePdfPreviewUrl ? (
                  <iframe
                    title="Preview PDF Panitia PPDB"
                    src={`${inlinePdfPreviewUrl}#zoom=page-fit&view=FitH`}
                    className="w-full h-full border border-gray-200 rounded-md"
                  />
                ) : (
                  <div className="h-full border border-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                    Preview belum tersedia
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

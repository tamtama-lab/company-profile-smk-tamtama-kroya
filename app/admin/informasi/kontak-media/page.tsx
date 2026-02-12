/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DragDropFile from "@/components/Upload/DragDropFile";
import { TitleSection } from "@/components/TitleSection/index";
import { SectionCard } from "@/components/Card/SectionCard";
import {
  InputNumber,
  InputText,
  InputTextArea,
} from "@/components/InputForm/TextInput";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import {
  SocialMediaListField,
  SocialMediaSingleField,
} from "@/components/Admin/SocialMediaFields";
import {
  isNonEmpty,
  isValidEmail,
  isValidPhoneNumber,
  isValidWhatsappNumber,
  isValidUrl,
} from "@/lib/stringFormat";
import { TextButton } from "@/components/Buttons/TextButton";
import * as z from "zod";

const parseJsonResponse = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function KontakMediaPage() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingBrochure, setSavingBrochure] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [deletingBrochure, setDeletingBrochure] = useState(false);
  const [contactErrors, setContactErrors] = useState<{
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  }>({});
  const [socialErrors, setSocialErrors] = useState<{
    tiktok?: string;
    youtube?: string;
    facebook?: string;
  }>({});
  const [instagramErrors, setInstagramErrors] = useState<
    Record<number, string>
  >({});
  const [whatsappErrors, setWhatsappErrors] = useState<
    Record<number, { label?: string; number?: string }>
  >({});

  const [original, setOriginal] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const MAX_WHATSAPP = 5;
  const MAX_INSTAGRAM = 5;
  const MAX_BROCHURE_MB = 10;
  const MAX_BROCHURE_BYTES = MAX_BROCHURE_MB * 1024 * 1024;

  const contactSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .min(1, "Nomor telepon wajib diisi")
          .refine(isValidPhoneNumber, "Nomor telepon tidak valid"),
        email: z
          .string()
          .min(1, "Email wajib diisi")
          .refine(isValidEmail, "Format email tidak valid"),
        website: z
          .string()
          .min(1, "Website wajib diisi")
          .refine(isValidUrl, "Format website tidak valid"),
        address: z.string().min(1, "Alamat wajib diisi"),
      }),
    [],
  );

  const whatsappItemSchema = useMemo(
    () =>
      z.object({
        label: z.string().min(1, "Label Whatsapp wajib diisi"),
        number: z
          .string()
          .min(1, "Nomor Whatsapp wajib diisi")
          .refine(
            isValidWhatsappNumber,
            "Nomor Whatsapp harus diawali 08 dan valid",
          ),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    [],
  );

  const instagramItemSchema = useMemo(
    () =>
      z.object({
        url: z
          .string()
          .min(1, "URL Instagram wajib diisi")
          .refine(isValidUrl, "Format URL Instagram tidak valid"),
        isActive: z.boolean().optional(),
      }),
    [],
  );

  const socialSchema = useMemo(
    () =>
      z
        .object({
          tiktok: z.object({
            url: z.string().optional(),
            isActive: z.boolean().optional(),
          }),
          youtube: z.object({
            url: z.string().optional(),
            isActive: z.boolean().optional(),
          }),
          facebook: z.object({
            url: z.string().optional(),
            isActive: z.boolean().optional(),
          }),
          instagram: z.array(instagramItemSchema),
        })
        .superRefine((value, ctx) => {
          const validateSingle = (
            key: "tiktok" | "youtube" | "facebook",
            label: string,
          ) => {
            const url = value[key].url || "";
            const active = !!value[key].isActive;
            if (active || isNonEmpty(url)) {
              if (!isNonEmpty(url)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: [key, "url"],
                  message: `URL ${label} wajib diisi`,
                });
                return;
              }
              if (!isValidUrl(url)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: [key, "url"],
                  message: `Format URL ${label} tidak valid`,
                });
              }
            }
          };

          validateSingle("tiktok", "TikTok");
          validateSingle("youtube", "Youtube");
          validateSingle("facebook", "Facebook");
        }),
    [instagramItemSchema],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/backoffice/school-settings`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setOriginal(data);
      // normalize shape for form
      setForm({
        email: data.email || "",
        phone: data.phone || "",
        website: data.website || "",
        address: data.address || "",
        whatsappNumbers: (data.whatsappNumbers || []).map((w: any) => ({
          ...w,
          isActive: typeof w.isActive === "boolean" ? w.isActive : true,
        })),
        socialMedia: {
          tiktok: {
            ...(data.socialMedia?.tiktok || { url: "", isActive: false }),
          },
          youtube: {
            ...(data.socialMedia?.youtube || { url: "", isActive: false }),
          },
          facebook: {
            ...(data.socialMedia?.facebook || { url: "", isActive: false }),
          },
          instagram: Array.isArray(data.socialMedia?.instagram)
            ? data.socialMedia.instagram.map((i: any) => ({
                ...(i || {}),
                isActive: typeof i.isActive === "boolean" ? i.isActive : true,
              }))
            : [],
        },
        brochureFrontUrl: data.brochureFrontUrl || null,
        brochureBackUrl: data.brochureBackUrl || null,
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: "Gagal memuat data",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Load data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearContactErrors = () => setContactErrors({});
  const clearSocialErrors = () => {
    setSocialErrors({});
    setInstagramErrors({});
    setWhatsappErrors({});
  };

  const resetContact = () => {
    if (!original) return;
    setForm((p: any) => ({
      ...p,
      email: original.email || "",
      phone: original.phone || "",
      website: original.website || "",
      address: original.address || "",
    }));
  };

  const resetSocial = () => {
    if (!original) return;
    setForm((p: any) => ({
      ...p,
      whatsappNumbers: (original.whatsappNumbers || []).map((w: any) => ({
        ...w,
        isActive: typeof w.isActive === "boolean" ? w.isActive : true,
      })),
      socialMedia: {
        tiktok: {
          ...(original.socialMedia?.tiktok || { url: "", isActive: false }),
        },
        youtube: {
          ...(original.socialMedia?.youtube || { url: "", isActive: false }),
        },
        facebook: {
          ...(original.socialMedia?.facebook || { url: "", isActive: false }),
        },
        instagram: Array.isArray(original.socialMedia?.instagram)
          ? original.socialMedia.instagram.map((i: any) => ({
              ...(i || {}),
              isActive: typeof i.isActive === "boolean" ? i.isActive : true,
            }))
          : [],
      },
    }));
  };

  const resetBrochure = () => {
    if (!original) return;
    setForm((p: any) => ({
      ...p,
      brochureFrontUrl: original.brochureFrontUrl || null,
      brochureBackUrl: original.brochureBackUrl || null,
    }));
    setFrontFile(null);
    setBackFile(null);
  };

  // Whatsapp helpers
  const addWhatsapp = () => {
    if (!form) return;
    if ((form.whatsappNumbers || []).length >= MAX_WHATSAPP) {
      showAlert({
        title: "Batas",
        description: `Maksimal ${MAX_WHATSAPP} nomor Whatsapp`,
        variant: "error",
      });
      return;
    }
    setForm((prev: any) => ({
      ...prev,
      whatsappNumbers: [
        ...(prev.whatsappNumbers || []),
        { name: "", label: "", number: "", isActive: true },
      ],
    }));
  };

  const removeWhatsapp = (idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      whatsappNumbers: (prev.whatsappNumbers || []).filter(
        (_: any, i: number) => i !== idx,
      ),
    }));
  };

  // Instagram helpers
  const addInstagram = () => {
    if (!form) return;
    setForm((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        instagram: [
          ...(prev.socialMedia.instagram || []),
          { url: "", isActive: false },
        ],
      },
    }));
  };
  const removeInstagram = (idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        instagram: (prev.socialMedia.instagram || []).filter(
          (_: any, i: number) => i !== idx,
        ),
      },
    }));
  };

  const validateBrochureFile = useCallback(
    (file: File) => {
      if (file.size > MAX_BROCHURE_BYTES) {
        showAlert({
          title: "Ukuran terlalu besar",
          description: `Ukuran file maksimal ${MAX_BROCHURE_MB}MB`,
          variant: "warning",
        });
        return `Ukuran file maksimal ${MAX_BROCHURE_MB}MB`;
      }

      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        showAlert({
          title: "Format tidak didukung",
          description: "Hanya file PDF atau gambar (PNG/JPG) yang diterima",
          variant: "warning",
        });
        return "Format tidak didukung";
      }

      return null;
    },
    [MAX_BROCHURE_BYTES, MAX_BROCHURE_MB, showAlert],
  );

  const handleSaveSocial = async () => {
    if (!form) return;

    clearSocialErrors();

    const whatsappCheck = z
      .array(whatsappItemSchema)
      .max(MAX_WHATSAPP, `Maksimal ${MAX_WHATSAPP} nomor Whatsapp`)
      .safeParse(form.whatsappNumbers || []);
    const socialCheck = socialSchema.safeParse({
      tiktok: form.socialMedia.tiktok,
      youtube: form.socialMedia.youtube,
      facebook: form.socialMedia.facebook,
      instagram: form.socialMedia.instagram || [],
    });

    if (!whatsappCheck.success || !socialCheck.success) {
      const nextWhatsappErrors: Record<
        number,
        { label?: string; number?: string }
      > = {};
      const nextInstagramErrors: Record<number, string> = {};
      const nextSocialErrors: {
        tiktok?: string;
        youtube?: string;
        facebook?: string;
      } = {};

      if (!whatsappCheck.success) {
        for (const issue of whatsappCheck.error.issues) {
          const [idx, field] = issue.path;
          if (typeof idx === "number") {
            nextWhatsappErrors[idx] = {
              ...nextWhatsappErrors[idx],
              [String(field)]: issue.message,
            };
          }
        }
      }

      if (!socialCheck.success) {
        for (const issue of socialCheck.error.issues) {
          const [root, idx] = issue.path;
          if (root === "instagram" && typeof idx === "number") {
            nextInstagramErrors[idx] = issue.message;
          } else if (
            root === "tiktok" ||
            root === "youtube" ||
            root === "facebook"
          ) {
            nextSocialErrors[root] = issue.message;
          }
        }
      }

      setWhatsappErrors(nextWhatsappErrors);
      setInstagramErrors(nextInstagramErrors);
      setSocialErrors(nextSocialErrors);

      showAlert({
        title: "Gagal",
        description: "Periksa input yang bertanda merah",
        variant: "error",
      });
      return;
    }

    setSavingSocial(true);

    try {
      const whatsappPayload = {
        whatsappNumbers: (form.whatsappNumbers || []).map((w: any) => ({
          name: w.name || w.label || "",
          label: w.label || "",
          number: String((w.number || "").replace(/\D/g, "")),
          isActive: !!w.isActive,
        })),
      };

      const socialPayload = {
        facebook: {
          url: form.socialMedia.facebook.url || "",
          isActive: !!form.socialMedia.facebook.isActive,
        },
        instagram: (form.socialMedia.instagram || []).map((i: any) => ({
          url: i.url || "",
          isActive: !!i.isActive,
        })),
        tiktok: {
          url: form.socialMedia.tiktok.url || "",
          isActive: !!form.socialMedia.tiktok.isActive,
        },
        youtube: {
          url: form.socialMedia.youtube.url || "",
          isActive: !!form.socialMedia.youtube.isActive,
        },
      };

      const [whatsappRes, socialRes] = await Promise.all([
        fetch(`/api/backoffice/school-settings/whatsapp`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(whatsappPayload),
        }),
        fetch(`/api/backoffice/school-settings/social-media`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(socialPayload),
        }),
      ]);

      if (!whatsappRes.ok || !socialRes.ok) {
        const err = !whatsappRes.ok
          ? await whatsappRes.json()
          : await socialRes.json();
        throw new Error(err?.message || "Gagal menyimpan media sosial");
      }

      const whatsappData = await whatsappRes.json();
      const socialData = await socialRes.json();

      setForm((p: any) => ({
        ...p,
        whatsappNumbers: whatsappData.whatsappNumbers ?? p.whatsappNumbers,
        socialMedia: socialData.socialMedia ?? p.socialMedia,
      }));
      setOriginal((o: any) => ({
        ...o,
        whatsappNumbers: whatsappData.whatsappNumbers ?? o.whatsappNumbers,
        socialMedia: socialData.socialMedia ?? o.socialMedia,
      }));

      showAlert({
        title: "Berhasil",
        description: "Media sosial berhasil disimpan",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: err?.message || "Gagal menyimpan media sosial",
        variant: "error",
      });
    } finally {
      setSavingSocial(false);
    }
  };

  const handleSaveBrochure = async () => {
    const uploads: Array<{ type: "front" | "back"; file: File }> = [];
    if (frontFile) uploads.push({ type: "front", file: frontFile });
    if (backFile) uploads.push({ type: "back", file: backFile });

    if (!uploads.length) {
      showAlert({
        title: "Info",
        description: "Tidak ada file brosur baru untuk diunggah",
        variant: "warning",
      });
      return;
    }

    setSavingBrochure(true);
    try {
      const responses = await Promise.all(
        uploads.map(async ({ type, file }) => {
          const brochure = new FormData();
          brochure.append("brochure", file);

          const uploadRes = await fetch(
            `${BACKEND_URL}/backoffice/school-settings/brochure/${type}`,
            {
              method: "PUT",
              headers: {
                ...getAuthHeader(),
              },
              body: brochure,
            },
          );

          const data = await parseJsonResponse(uploadRes);
          if (!uploadRes.ok) {
            const backendErrors = Array.isArray(data?.errors)
              ? data.errors
                  .map((err: { message?: string }) => err?.message)
                  .filter(Boolean)
              : [];
            const backendMessage = backendErrors.length
              ? backendErrors.join("\n")
              : data?.message;
            const rawMessage =
              backendMessage || data?.error || "Gagal mengunggah brosur";
            const safeMessage =
              typeof rawMessage === "string" && rawMessage.includes("<html")
                ? "Gagal mengunggah brosur. Coba lagi beberapa saat."
                : rawMessage;
            throw new Error(safeMessage);
          }

          return data ?? {};
        }),
      );

      const merged = responses.reduce(
        (acc: any, item: any) => ({
          ...acc,
          ...(item || {}),
        }),
        {},
      );

      setForm((p: any) => ({
        ...p,
        brochureFrontUrl: merged.brochureFrontUrl ?? p.brochureFrontUrl ?? null,
        brochureBackUrl: merged.brochureBackUrl ?? p.brochureBackUrl ?? null,
      }));
      setOriginal((o: any) => ({
        ...o,
        brochureFrontUrl:
          merged.brochureFrontUrl ?? o?.brochureFrontUrl ?? null,
        brochureBackUrl: merged.brochureBackUrl ?? o?.brochureBackUrl ?? null,
      }));

      // clear local files after successful upload
      if (frontFile) setFrontFile(null);
      if (backFile) setBackFile(null);

      showAlert({
        title: "Berhasil",
        description: "Brosur berhasil diunggah",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: err?.message || "Gagal mengunggah brosur",
        variant: "error",
      });
    } finally {
      setSavingBrochure(false);
      setLoading(false);
    }
  };

  const handleDeleteBrochure = async (field: "front" | "back") => {
    if (!form) return;

    const hasLocalFile = field === "front" ? !!frontFile : !!backFile;
    if (hasLocalFile) {
      if (field === "front") setFrontFile(null);
      if (field === "back") setBackFile(null);
      return;
    }

    const currentUrl =
      field === "front" ? form.brochureFrontUrl : form.brochureBackUrl;
    if (!currentUrl) return;

    setDeletingBrochure(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/backoffice/school-settings/brochure/${field}`,
        {
          method: "DELETE",
          headers: { ...getAuthHeader() },
        },
      );
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || "Gagal menghapus brosur");
      const nextPatch =
        field === "front"
          ? { brochureFrontUrl: null }
          : { brochureBackUrl: null };
      setForm((p: any) => ({ ...p, ...nextPatch }));
      setOriginal((o: any) => ({ ...o, ...nextPatch }));
      showAlert({
        title: "Berhasil",
        description:
          field === "front"
            ? "Brosur depan berhasil dihapus"
            : "Brosur belakang berhasil dihapus",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: err?.message || "Gagal menghapus brosur",
        variant: "error",
      });
    } finally {
      setDeletingBrochure(false);
    }
  };

  // Save only contact info (email, phone, website, address)
  const handleSaveContact = async () => {
    if (!form) return;

    clearContactErrors();

    const contactCheck = contactSchema.safeParse({
      phone: form.phone || "",
      email: form.email || "",
      website: form.website || "",
      address: form.address || "",
    });
    if (!contactCheck.success) {
      const nextErrors: {
        phone?: string;
        email?: string;
        website?: string;
        address?: string;
      } = {};
      for (const issue of contactCheck.error.issues) {
        const [field] = issue.path;
        if (typeof field === "string") {
          nextErrors[field as keyof typeof nextErrors] = issue.message;
        }
      }
      setContactErrors(nextErrors);
      showAlert({
        title: "Gagal",
        description: "Periksa input yang bertanda merah",
        variant: "error",
      });
      return;
    }

    setSavingContact(true);

    try {
      const payload = {
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        address: form.address || null,
      };

      const res = await fetch(`/api/backoffice/school-settings/contact-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Gagal menyimpan kontak");
      }

      const saved = await res.json();

      // update local state
      setForm((p: any) => ({ ...p, ...saved }));
      setOriginal((o: any) => ({ ...o, ...saved }));

      showAlert({
        title: "Berhasil",
        description: "Kontak berhasil disimpan",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: err?.message || "Gagal menyimpan kontak",
        variant: "error",
      });
    } finally {
      setSavingContact(false);
    }
  };

  if (!form) {
    return (
      <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
        <div className="h-full w-full bg-white rounded-md drop-shadow-sm p-6">
          <TitleSection title="Kontak & Media Sosial" subtitle="Memuat Data" />
          <div className="w-full h-[80vh] flex flex-col gap-6 justify-center items-center">
            <div className="w-12 h-12 border-4 border-dashed border-gray-400 rounded-full animate-spin" />
            <div>Memuat Data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full w-full bg-white rounded-md drop-shadow-sm p-6">
        <TitleSection
          title="Kontak & Media Sosial"
          subtitle="Halaman untuk mengedit isian dari kontak & sosial media yang perlu ditambahkan di landing page"
        />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full h-fit">
            {/* Kontak Resmi Sekolah */}
            <SectionCard
              handleSaveChanges={handleSaveContact}
              isLoading={savingContact || !form}
              title="Kontak Resmi Sekolah"
              className="w-full border border-gray-400"
              leftButton={
                <TextButton
                  variant="outline"
                  text="Batal"
                  disabled={savingContact || loading}
                  onClick={resetContact}
                />
              }
            >
              <div className="w-full p-3">
                <div>
                  <InputNumber
                    name="phone"
                    limit={15}
                    label="Telephone"
                    placeholder="Masukkan Nomor Telephone Sekolah"
                    value={form.phone}
                    onChange={(e) => {
                      setForm((p: any) => ({ ...p, phone: e.target.value }));
                      setContactErrors((prev) => ({
                        ...prev,
                        phone: undefined,
                      }));
                    }}
                  />
                  {contactErrors.phone && (
                    <p className="text-xs text-red-500 -mt-1 mb-2">
                      {contactErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <InputText
                    name="email"
                    label="Email"
                    placeholder="Masukkan Email Sekolah"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p: any) => ({ ...p, email: e.target.value }));
                      setContactErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }}
                  />
                  {contactErrors.email && (
                    <p className="text-xs text-red-500 -mt-1 mb-2">
                      {contactErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <InputText
                    name="website"
                    label="Website"
                    placeholder="Masukkan Website Sekolah"
                    value={form.website}
                    onChange={(e) => {
                      setForm((p: any) => ({ ...p, website: e.target.value }));
                      setContactErrors((prev) => ({
                        ...prev,
                        website: undefined,
                      }));
                    }}
                  />
                  {contactErrors.website && (
                    <p className="text-xs text-red-500 -mt-1 mb-2">
                      {contactErrors.website}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <InputTextArea
                    placeholder="Masukkan Alamat Lengkap Sekolah"
                    value={form.address}
                    onChange={(e) => {
                      setForm((p: any) => ({ ...p, address: e.target.value }));
                      setContactErrors((prev) => ({
                        ...prev,
                        address: undefined,
                      }));
                    }}
                    label={"Alamat Lengkap"}
                    name={"address"}
                  />
                  {contactErrors.address && (
                    <p className="text-xs text-red-500 -mt-1 mb-2">
                      {contactErrors.address}
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>
            {/* Unggah Brosur Promosi */}
            <SectionCard
              title="Unggah Brosur Promosi"
              className="mt-6 border border-gray-400"
              handleSaveChanges={handleSaveBrochure}
              isLoading={savingBrochure || !form}
              leftButton={
                <TextButton
                  variant="outline"
                  text="Batal"
                  disabled={savingBrochure || deletingBrochure || loading}
                  onClick={resetBrochure}
                />
              }
            >
              <div className="grid grid-cols-1 gap-6 p-3">
                <div>
                  <label className="font-medium">Brosur Depan</label>
                  <div className="border rounded p-4 mt-2">
                    <DragDropFile
                      accept="image/png,image/jpeg"
                      previewUrl={form.brochureFrontUrl}
                      initialFile={frontFile}
                      onFile={(file) => setFrontFile(file)}
                      onValidate={validateBrochureFile}
                      onRemove={async () => {
                        await handleDeleteBrochure("front");
                      }}
                      label="Brosur Depan"
                      description="PDF / Image"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Maksimum 10MB per file.
                    </p>
                    <div className="mt-3 flex justify-end">
                      <TextButton
                        isLoading={deletingBrochure}
                        variant="outline-danger"
                        text="Hapus Brosur"
                        disabled={!form.brochureFrontUrl && !frontFile}
                        onClick={() => handleDeleteBrochure("front")}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Brosur Belakang</label>
                  <div className="border rounded p-4 mt-2">
                    <DragDropFile
                      accept="image/png,image/jpeg"
                      previewUrl={form.brochureBackUrl}
                      initialFile={backFile}
                      onFile={(file) => setBackFile(file)}
                      onValidate={validateBrochureFile}
                      onRemove={async () => {
                        await handleDeleteBrochure("back");
                      }}
                      label="Brosur Belakang"
                      description="PDF / Image"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Maksimum 10MB per file.
                    </p>
                    <div className="mt-3 flex justify-end">
                      <TextButton
                        variant="outline-danger"
                        isLoading={deletingBrochure}
                        text="Hapus Brosur"
                        disabled={!form.brochureBackUrl && !backFile}
                        onClick={() => handleDeleteBrochure("back")}
                      />
                    </div>
                  </div>
                </div>
              </div>{" "}
            </SectionCard>
          </div>
          <div className="w-full h-fit border rounded-lg border-gray-400">
            {/* Media Sosial Resmi */}
            <SectionCard
              title="Media Sosial Resmi"
              className="mt-0"
              maxRow={14}
              isLoading={savingSocial || loading}
              handleSaveChanges={handleSaveSocial}
              leftButton={
                <TextButton
                  variant="outline"
                  text="Batal"
                  disabled={savingSocial || loading}
                  onClick={resetSocial}
                />
              }
            >
              <div className="grid grid-cols-1 gap-6 p-3">
                <SocialMediaListField
                  label="Instagram"
                  iconSrc="/sosmed/instagram.svg"
                  iconAlt="instagram"
                  maxItems={MAX_INSTAGRAM}
                  items={form.socialMedia.instagram || []}
                  addLabel="+ Tambah Akun"
                  onAdd={addInstagram}
                  onRemove={removeInstagram}
                  onToggle={(idx, val) =>
                    setForm((p: any) => ({
                      ...p,
                      socialMedia: {
                        ...p.socialMedia,
                        instagram: p.socialMedia.instagram.map(
                          (it: any, i: number) =>
                            i === idx ? { ...it, isActive: val } : it,
                        ),
                      },
                    }))
                  }
                  renderInputs={(inst: any, idx: number, disabled) => (
                    <div className="flex-1">
                      <input
                        className="w-full border border-gray-400 rounded p-2"
                        value={inst.url || ""}
                        onChange={(e) => {
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              instagram: p.socialMedia.instagram.map(
                                (it: any, i: number) =>
                                  i === idx
                                    ? { ...it, url: e.target.value }
                                    : it,
                              ),
                            },
                          }));
                          setInstagramErrors((prev) => {
                            const next = { ...prev };
                            delete next[idx];
                            return next;
                          });
                        }}
                        disabled={disabled}
                      />
                      {instagramErrors[idx] && (
                        <p className="text-xs text-red-500 mt-1">
                          {instagramErrors[idx]}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div>
                  <div className="space-y-6 mt-8">
                    <div>
                      <SocialMediaSingleField
                        label="TikTok"
                        iconSrc="/sosmed/tiktok.svg"
                        iconAlt="tiktok"
                        iconSize={24}
                        value={form.socialMedia.tiktok.url || ""}
                        isActive={!!form.socialMedia.tiktok.isActive}
                        onChange={(value) => {
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              tiktok: {
                                ...p.socialMedia.tiktok,
                                url: value,
                              },
                            },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            tiktok: undefined,
                          }));
                        }}
                        onToggle={(val) =>
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              tiktok: {
                                ...p.socialMedia.tiktok,
                                isActive: val,
                              },
                            },
                          }))
                        }
                      />
                      {socialErrors.tiktok && (
                        <p className="text-xs text-red-500 mt-1">
                          {socialErrors.tiktok}
                        </p>
                      )}
                    </div>

                    <div>
                      <SocialMediaSingleField
                        label="Youtube"
                        iconSrc="/sosmed/youtube.svg"
                        iconAlt="youtube"
                        value={form.socialMedia.youtube.url || ""}
                        isActive={!!form.socialMedia.youtube.isActive}
                        onChange={(value) => {
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              youtube: {
                                ...p.socialMedia.youtube,
                                url: value,
                              },
                            },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            youtube: undefined,
                          }));
                        }}
                        onToggle={(val) =>
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              youtube: {
                                ...p.socialMedia.youtube,
                                isActive: val,
                              },
                            },
                          }))
                        }
                      />
                      {socialErrors.youtube && (
                        <p className="text-xs text-red-500 mt-1">
                          {socialErrors.youtube}
                        </p>
                      )}
                    </div>

                    <div>
                      <SocialMediaSingleField
                        label="Facebook"
                        iconSrc="/sosmed/facebook.svg"
                        iconAlt="Facebook"
                        value={form.socialMedia.facebook.url || ""}
                        isActive={!!form.socialMedia.facebook.isActive}
                        onChange={(value) => {
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              facebook: {
                                ...p.socialMedia.facebook,
                                url: value,
                              },
                            },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            facebook: undefined,
                          }));
                        }}
                        onToggle={(val) =>
                          setForm((p: any) => ({
                            ...p,
                            socialMedia: {
                              ...p.socialMedia,
                              facebook: {
                                ...p.socialMedia.facebook,
                                isActive: val,
                              },
                            },
                          }))
                        }
                      />
                      {socialErrors.facebook && (
                        <p className="text-xs text-red-500 mt-1">
                          {socialErrors.facebook}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      <SocialMediaListField
                        label="Whatsapp"
                        iconSrc="/sosmed/whatsapp.svg"
                        iconAlt="Whatsapp"
                        items={form.whatsappNumbers || []}
                        addLabel="+ Tambah Nomor"
                        maxItems={MAX_WHATSAPP}
                        onAdd={addWhatsapp}
                        onRemove={removeWhatsapp}
                        className="flex justify-end items-center"
                        onToggle={(idx, val) =>
                          setForm((p: any) => ({
                            ...p,
                            whatsappNumbers: p.whatsappNumbers.map(
                              (it: any, i: number) =>
                                i === idx ? { ...it, isActive: val } : it,
                            ),
                          }))
                        }
                        renderInputs={(w: any, idx: number, disabled) => (
                          <div className="w-full h-fit justify-start flex flex-row items-end gap-3">
                            <div className="w-40">
                              <InputText
                                placeholder="Nama admin"
                                disabled={disabled}
                                value={w.label || ""}
                                onChange={(e) => {
                                  setForm((p: any) => ({
                                    ...p,
                                    whatsappNumbers: p.whatsappNumbers.map(
                                      (it: any, i: number) =>
                                        i === idx
                                          ? { ...it, label: e.target.value }
                                          : it,
                                    ),
                                  }));
                                  setWhatsappErrors((prev) => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], label: undefined },
                                  }));
                                }}
                                label={""}
                                name={""}
                              />
                              {whatsappErrors[idx]?.label && (
                                <p className="text-xs text-red-500 -mt-1">
                                  {whatsappErrors[idx]?.label}
                                </p>
                              )}
                            </div>
                            <div className="flex-1">
                              <InputNumber
                                limit={15}
                                disabled={disabled}
                                placeholder="Nomor Whatsapp"
                                value={w.number || ""}
                                onChange={(e) => {
                                  setForm((p: any) => ({
                                    ...p,
                                    whatsappNumbers: p.whatsappNumbers.map(
                                      (it: any, i: number) =>
                                        i === idx
                                          ? { ...it, number: e.target.value }
                                          : it,
                                    ),
                                  }));
                                  setWhatsappErrors((prev) => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], number: undefined },
                                  }));
                                }}
                                label={""}
                                name={""}
                              />
                              {whatsappErrors[idx]?.number && (
                                <p className="text-xs text-red-500 -mt-1">
                                  {whatsappErrors[idx]?.number}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

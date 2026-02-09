/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
  isValidUrl,
} from "@/lib/stringFormat";

export default function KontakMediaPage() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingBrochure, setSavingBrochure] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  const [original, setOriginal] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const MAX_WHATSAPP = 5;

  // Load data
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [showAlert]);

  const resetToOriginal = () => {
    if (!original) return;
    setForm({
      email: original.email || "",
      phone: original.phone || "",
      website: original.website || "",
      address: original.address || "",
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
      brochureFrontUrl: original.brochureFrontUrl || null,
      brochureBackUrl: original.brochureBackUrl || null,
    });
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

  const handleSaveSocial = async () => {
    if (!form) return;

    for (const [idx, w] of (form.whatsappNumbers || []).entries()) {
      if (!isNonEmpty(w.label)) {
        showAlert({
          title: "Gagal",
          description: `Label Whatsapp #${idx + 1} wajib diisi`,
          variant: "error",
        });
        return;
      }
      if (!isNonEmpty(w.number)) {
        showAlert({
          title: "Gagal",
          description: `Nomor Whatsapp #${idx + 1} wajib diisi`,
          variant: "error",
        });
        return;
      }
      if (!isValidPhoneNumber(w.number)) {
        showAlert({
          title: "Gagal",
          description: `Nomor Whatsapp #${idx + 1} tidak valid`,
          variant: "error",
        });
        return;
      }
    }

    for (const [idx, inst] of (form.socialMedia.instagram || []).entries()) {
      if (!isNonEmpty(inst.url)) {
        showAlert({
          title: "Gagal",
          description: `URL Instagram #${idx + 1} wajib diisi`,
          variant: "error",
        });
        return;
      }
      if (!isValidUrl(inst.url)) {
        showAlert({
          title: "Gagal",
          description: `Format URL Instagram #${idx + 1} tidak valid`,
          variant: "error",
        });
        return;
      }
    }

    const tiktokUrl = form.socialMedia.tiktok.url || "";
    if (
      (form.socialMedia.tiktok.isActive || isNonEmpty(tiktokUrl)) &&
      !isNonEmpty(tiktokUrl)
    ) {
      showAlert({
        title: "Gagal",
        description: "URL TikTok wajib diisi",
        variant: "error",
      });
      return;
    }
    if (isNonEmpty(tiktokUrl) && !isValidUrl(tiktokUrl)) {
      showAlert({
        title: "Gagal",
        description: "Format URL TikTok tidak valid",
        variant: "error",
      });
      return;
    }

    const youtubeUrl = form.socialMedia.youtube.url || "";
    if (
      (form.socialMedia.youtube.isActive || isNonEmpty(youtubeUrl)) &&
      !isNonEmpty(youtubeUrl)
    ) {
      showAlert({
        title: "Gagal",
        description: "URL Youtube wajib diisi",
        variant: "error",
      });
      return;
    }
    if (isNonEmpty(youtubeUrl) && !isValidUrl(youtubeUrl)) {
      showAlert({
        title: "Gagal",
        description: "Format URL Youtube tidak valid",
        variant: "error",
      });
      return;
    }

    const facebookUrl = form.socialMedia.facebook.url || "";
    if (
      (form.socialMedia.facebook.isActive || isNonEmpty(facebookUrl)) &&
      !isNonEmpty(facebookUrl)
    ) {
      showAlert({
        title: "Gagal",
        description: "URL Facebook wajib diisi",
        variant: "error",
      });
      return;
    }
    if (isNonEmpty(facebookUrl) && !isValidUrl(facebookUrl)) {
      showAlert({
        title: "Gagal",
        description: "Format URL Facebook tidak valid",
        variant: "error",
      });
      return;
    }

    setSavingSocial(true);

    try {
      const whatsappPayload = {
        whatsappNumbers: (form.whatsappNumbers || []).map((w: any) => ({
          name: w.name || "",
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
    setSavingBrochure(true);
    try {
      const fd = new FormData();
      if (frontFile) fd.append("brochureFront", frontFile);
      if (backFile) fd.append("brochureBack", backFile);

      const uploadRes = await fetch(
        `/api/backoffice/school-settings/brochure`,
        {
          method: "POST",
          headers: {
            ...getAuthHeader(),
          },
          body: fd as any,
        },
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err?.message || "Gagal mengunggah brosur");
      }

      const data = await uploadRes.json();

      setForm((p: any) => ({
        ...p,
        brochureFrontUrl: data.brochureFrontUrl ?? p.brochureFrontUrl ?? null,
        brochureBackUrl: data.brochureBackUrl ?? p.brochureBackUrl ?? null,
      }));

      // clear local files after successful upload
      setFrontFile(null);
      setBackFile(null);

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

  // Save only contact info (email, phone, website, address)
  const handleSaveContact = async () => {
    if (!form) return;

    if (!isNonEmpty(form.phone)) {
      showAlert({
        title: "Gagal",
        description: "Nomor telepon wajib diisi",
        variant: "error",
      });
      return;
    }
    if (!isValidPhoneNumber(form.phone)) {
      showAlert({
        title: "Gagal",
        description: "Nomor telepon tidak valid",
        variant: "error",
      });
      return;
    }
    if (!isNonEmpty(form.email)) {
      showAlert({
        title: "Gagal",
        description: "Email wajib diisi",
        variant: "error",
      });
      return;
    }
    if (!isNonEmpty(form.website)) {
      showAlert({
        title: "Gagal",
        description: "Website wajib diisi",
        variant: "error",
      });
      return;
    }
    if (!isNonEmpty(form.address)) {
      showAlert({
        title: "Gagal",
        description: "Alamat wajib diisi",
        variant: "error",
      });
      return;
    }

    // Basic validation
    if (form.email && !isValidEmail(form.email)) {
      showAlert({
        title: "Gagal",
        description: "Format email tidak valid",
        variant: "error",
      });
      return;
    }
    if (form.website && !isValidUrl(form.website)) {
      showAlert({
        title: "Gagal",
        description: "Format website tidak valid",
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
            >
              <div className="w-full p-3">
                <div>
                  <InputText
                    name="phone"
                    label="Telephone"
                    placeholder="Masukkan Nomor Telephone Sekolah"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <InputText
                    name="email"
                    label="Email"
                    placeholder="Masukkan Email Sekolah"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <InputText
                    name="website"
                    label="Website"
                    placeholder="Masukkan Website Sekolah"
                    value={form.website}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, website: e.target.value }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <InputTextArea
                    placeholder="Masukkan Alamat Lengkap Sekolah"
                    value={form.address}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, address: e.target.value }))
                    }
                    label={"Alamat Lengkap"}
                    name={"address"}
                  />
                </div>
              </div>
            </SectionCard>
            {/* Unggah Brosur Promosi */}
            <SectionCard
              title="Unggah Brosur Promosi"
              className="mt-6 border border-gray-400"
              handleSaveChanges={handleSaveBrochure}
              isLoading={savingBrochure || !form}
              leftButton={null}
            >
              <div className="grid grid-cols-1 gap-6 p-3">
                <div>
                  <label className="font-medium">Brosur Depan</label>
                  <div className="border rounded p-4 mt-2">
                    <DragDropFile
                      accept="application/pdf,image/*"
                      previewUrl={form.brochureFrontUrl}
                      initialFile={frontFile}
                      onFile={(file) => setFrontFile(file)}
                      onValidate={(file) => {
                        if (
                          !file.type.startsWith("image/") &&
                          file.type !== "application/pdf"
                        ) {
                          showAlert({
                            title: "Format tidak didukung",
                            description:
                              "Hanya file PDF atau gambar (PNG/JPG) yang diterima",
                            variant: "warning",
                          });
                          return "Format tidak didukung";
                        }

                        return null;
                      }}
                      onRemove={async () => {
                        // If a local file was selected, just clear it
                        if (frontFile) return setFrontFile(null);

                        // Otherwise request delete from server
                        if (form.brochureFrontUrl) {
                          try {
                            const res = await fetch(
                              `/api/backoffice/school-settings/brochure?field=front`,
                              {
                                method: "DELETE",
                                headers: { ...getAuthHeader() },
                              },
                            );
                            if (!res.ok)
                              throw new Error("Gagal menghapus brosur");
                            const data = await res.json();
                            setForm((p: any) => ({
                              ...p,
                              brochureFrontUrl: data.brochureFrontUrl ?? null,
                            }));
                            showAlert({
                              title: "Berhasil",
                              description: "Brosur depan berhasil dihapus",
                              variant: "success",
                            });
                          } catch (err: any) {
                            console.error(err);
                            showAlert({
                              title: "Gagal",
                              description:
                                err?.message || "Gagal menghapus brosur",
                              variant: "error",
                            });
                          }
                        }
                        setLoading(false);
                      }}
                      label="Brosur Depan"
                      description="PDF / Image"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium">Brosur Belakang</label>
                  <div className="border rounded p-4 mt-2">
                    <DragDropFile
                      accept="application/pdf,image/*"
                      previewUrl={form.brochureBackUrl}
                      initialFile={backFile}
                      onFile={(file) => setBackFile(file)}
                      onRemove={async () => {
                        if (backFile) return setBackFile(null);

                        if (form.brochureBackUrl) {
                          try {
                            const res = await fetch(
                              `/api/backoffice/school-settings/brochure?field=back`,
                              {
                                method: "DELETE",
                                headers: { ...getAuthHeader() },
                              },
                            );
                            if (!res.ok)
                              throw new Error("Gagal menghapus brosur");
                            const data = await res.json();
                            setForm((p: any) => ({
                              ...p,
                              brochureBackUrl: data.brochureBackUrl ?? null,
                            }));
                            showAlert({
                              title: "Berhasil",
                              description: "Brosur belakang berhasil dihapus",
                              variant: "success",
                            });
                          } catch (err: any) {
                            console.error(err);
                            showAlert({
                              title: "Gagal",
                              description:
                                err?.message || "Gagal menghapus brosur",
                              variant: "error",
                            });
                          }
                        }
                      }}
                      label="Brosur Belakang"
                      description="PDF / Image"
                    />
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
            >
              <div className="grid grid-cols-1 gap-6 p-3">
                <SocialMediaListField
                  label="Instagram"
                  iconSrc="/sosmed/instagram.svg"
                  iconAlt="instagram"
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
                    <input
                      className="flex-1 border border-gray-400 rounded p-2"
                      value={inst.url || ""}
                      onChange={(e) =>
                        setForm((p: any) => ({
                          ...p,
                          socialMedia: {
                            ...p.socialMedia,
                            instagram: p.socialMedia.instagram.map(
                              (it: any, i: number) =>
                                i === idx ? { ...it, url: e.target.value } : it,
                            ),
                          },
                        }))
                      }
                      disabled={disabled}
                    />
                  )}
                />

                <div>
                  <div className="space-y-6 mt-8">
                    <SocialMediaSingleField
                      label="TikTok"
                      iconSrc="/sosmed/tiktok.svg"
                      iconAlt="tiktok"
                      iconSize={24}
                      value={form.socialMedia.tiktok.url || ""}
                      isActive={!!form.socialMedia.tiktok.isActive}
                      onChange={(value) =>
                        setForm((p: any) => ({
                          ...p,
                          socialMedia: {
                            ...p.socialMedia,
                            tiktok: {
                              ...p.socialMedia.tiktok,
                              url: value,
                            },
                          },
                        }))
                      }
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

                    <SocialMediaSingleField
                      label="Youtube"
                      iconSrc="/sosmed/youtube.svg"
                      iconAlt="youtube"
                      value={form.socialMedia.youtube.url || ""}
                      isActive={!!form.socialMedia.youtube.isActive}
                      onChange={(value) =>
                        setForm((p: any) => ({
                          ...p,
                          socialMedia: {
                            ...p.socialMedia,
                            youtube: {
                              ...p.socialMedia.youtube,
                              url: value,
                            },
                          },
                        }))
                      }
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

                    <SocialMediaSingleField
                      label="Facebook"
                      iconSrc="/sosmed/facebook.svg"
                      iconAlt="Facebook"
                      value={form.socialMedia.facebook.url || ""}
                      isActive={!!form.socialMedia.facebook.isActive}
                      onChange={(value) =>
                        setForm((p: any) => ({
                          ...p,
                          socialMedia: {
                            ...p.socialMedia,
                            facebook: {
                              ...p.socialMedia.facebook,
                              url: value,
                            },
                          },
                        }))
                      }
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
                            <InputText
                              placeholder="Nama admin"
                              disabled={disabled}
                              value={w.label || ""}
                              onChange={(e) =>
                                setForm((p: any) => ({
                                  ...p,
                                  whatsappNumbers: p.whatsappNumbers.map(
                                    (it: any, i: number) =>
                                      i === idx
                                        ? { ...it, label: e.target.value }
                                        : it,
                                  ),
                                }))
                              }
                              label={""}
                              name={""}
                            />
                            <InputNumber
                              limit={15}
                              disabled={disabled}
                              placeholder="Nomor Whatsapp"
                              value={w.number || ""}
                              onChange={(e) =>
                                setForm((p: any) => ({
                                  ...p,
                                  whatsappNumbers: p.whatsappNumbers.map(
                                    (it: any, i: number) =>
                                      i === idx
                                        ? { ...it, number: e.target.value }
                                        : it,
                                  ),
                                }))
                              }
                              label={""}
                              name={""}
                            />
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

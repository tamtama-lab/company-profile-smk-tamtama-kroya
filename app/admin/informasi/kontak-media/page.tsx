/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import DragDropFile from "@/components/Upload/DragDropFile";
import { TitleSection } from "@/components/TitleSection/index";
import { SectionCard } from "@/components/Card/SectionCard";
import { InputText, InputTextArea } from "@/components/InputForm/TextInput";
import Toggle from "@/components/ui/toggle";
import { TextButton } from "@/components/Buttons/TextButton";
import { useAlert } from "@/components/ui/alert";
import { getAuthHeader } from "@/utils/auth";
import {
  SocialMediaListField,
  SocialMediaSingleField,
} from "@/components/Admin/SocialMediaFields";

export default function KontakMediaPage() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingBrochure, setSavingBrochure] = useState(false);

  const [original, setOriginal] = useState<any>(null);
  const [form, setForm] = useState<any>(null);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const MAX_WHATSAPP = 5;
  const MAX_INSTAGRAM = 5;

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

  // Helpers
  const isValidEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
  const isValidUrl = (s: string) => {
    try {
      if (!s) return true; // allow empty
      new URL(s);
      return true;
    } catch {
      return false;
    }
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
    if ((form.socialMedia.instagram || []).length >= MAX_INSTAGRAM) {
      showAlert({
        title: "Batas",
        description: `Maksimal ${MAX_INSTAGRAM} akun Instagram`,
        variant: "error",
      });
      return;
    }
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

  const handleSave = async () => {
    if (!form) return;

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

    setSaving(true);

    try {
      let brochureRes: any = {};

      // If files selected, upload first
      if (frontFile || backFile) {
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
        if (!uploadRes.ok) throw new Error("Gagal mengunggah brosur");
        brochureRes = await uploadRes.json();
      }

      const payload = {
        email: form.email || "",
        phone: form.phone || "",
        website: form.website || "",
        address: form.address || "",
        whatsappNumbers: (form.whatsappNumbers || []).map((w: any) => ({
          name: w.name || "",
          label: w.label || "",
          number: String((w.number || "").replace(/\D/g, "")),
          isActive: !!w.isActive,
        })),
        socialMedia: {
          tiktok: {
            url: form.socialMedia.tiktok.url || "",
            isActive: !!form.socialMedia.tiktok.isActive,
          },
          youtube: {
            url: form.socialMedia.youtube.url || "",
            isActive: !!form.socialMedia.youtube.isActive,
          },
          facebook: {
            url: form.socialMedia.facebook.url || "",
            isActive: !!form.socialMedia.facebook.isActive,
          },
          instagram: (form.socialMedia.instagram || []).map((i: any) => ({
            url: i.url || "",
            isActive: !!i.isActive,
          })),
        },
        brochureFrontUrl:
          brochureRes.brochureFrontUrl ?? form.brochureFrontUrl ?? null,
        brochureBackUrl:
          brochureRes.brochureBackUrl ?? form.brochureBackUrl ?? null,
      };

      const res = await fetch(`/api/backoffice/school-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Gagal menyimpan perubahan");
      }

      const saved = await res.json();
      setOriginal(saved);
      resetToOriginal();
      showAlert({
        title: "Berhasil",
        description: "Perubahan berhasil disimpan",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: "Gagal",
        description: err?.message || "Gagal menyimpan perubahan",
        variant: "error",
      });
    } finally {
      setSaving(false);
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
      setSaving(false);
      setLoading(false);
    }
  };

  // Save only contact info (email, phone, website, address)
  const handleSaveContact = async () => {
    if (!form) return;

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
              isLoading={loading}
            >
              <div className="grid grid-cols-1 gap-6 p-3">
                <SocialMediaListField
                  label="Instagram"
                  iconSrc="/sosmed/instagram.svg"
                  iconAlt="instagram"
                  items={form.socialMedia.instagram || []}
                  addLabel="+ Tambah Akun"
                  maxItems={MAX_INSTAGRAM}
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
                  hideDeleteWhenSingle
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
                          <>
                            <input
                              placeholder="Nama admin"
                              className="w-40 border rounded p-2"
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
                            />
                            <input
                              placeholder="Nomor Whatsapp"
                              className="flex-1 border border-gray-400 rounded p-2"
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
                              disabled={disabled}
                            />
                          </>
                        )}
                        hideDeleteWhenSingle
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

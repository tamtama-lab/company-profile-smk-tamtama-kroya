"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import DetailContentLayout from "@/components/LandingPage/DetailContentLayout";
import RotatedHighlightTitle from "@/components/SectionTitle/RotatedHighlightTitle";
import { resolveSlug } from "@/utils/resolveSlug";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SchoolFacilityDetail } from "../types";

const toSummaryHighlights = (value: string) => {
  const segments = value
    .split(/\r?\n|[.;]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(segments))
    .slice(0, 5)
    .map((item, index) => ({
      id: index + 1,
      name: item,
    }));
};

export default function SchoolFacilityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SchoolFacilityDetail | null>(null);

  const slug = resolveSlug(params?.slug);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!slug) {
        if (!cancelled) {
          setError("Slug fasilitas tidak valid.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/school-facilities/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch school facility detail");
        }

        const result: SchoolFacilityDetail = await response.json();

        if (!cancelled) {
          setDetail(result);
        }
      } catch (fetchError) {
        console.error("Failed fetch school facility detail", fetchError);

        if (!cancelled) {
          setError("Data fasilitas tidak ditemukan.");
          setDetail(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const galleries = useMemo(
    () => [...(detail?.galleries || [])].sort((a, b) => a.order - b.order),
    [detail?.galleries],
  );

  const highlights = useMemo(
    () =>
      toSummaryHighlights(
        detail?.summary?.trim() || detail?.description?.trim() || "",
      ),
    [detail?.summary, detail?.description],
  );

  const descriptionTitle = useMemo(() => {
    const words = (detail?.title || "").trim().split(/\s+/).filter(Boolean);
    const firstWord = words[0] || "Fasilitas";
    const remainingWords = words.slice(1).join(" ");

    return (
      <h2 className="text-2xl max-sm:text-xl font-semibold text-primary flex flex-wrap items-center gap-2">
        <span>Tentang</span>
        <RotatedHighlightTitle
          as="span"
          title={firstWord}
          className="align-middle"
          titleClassName="text-2xl max-sm:text-xl font-semibold text-primary"
          highlightClassName="h-9 max-sm:h-8"
        />
        {remainingWords && <span>{remainingWords}</span>}
      </h2>
    );
  }, [detail?.title]);

  const categoryLabel = detail?.category?.name?.trim() || "-";

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto mt-24 flex w-full max-w-7xl animate-pulse flex-col gap-6">
          <div className="h-8 w-36 rounded bg-gray-200" />
          <div className="h-10 w-2/3 rounded bg-gray-200" />
          <div className="h-96 w-full rounded-lg bg-gray-200" />
          <div className="h-24 w-full rounded bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="h-screen w-full px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg text-gray-700">
            {error || "Data tidak tersedia"}
          </p>
          <TextButton
            variant="outline"
            text="Kembali ke daftar fasilitas"
            onClick={() => router.push("/tentang-sekolah/fasilitas")}
          />
        </div>
      </main>
    );
  }

  return (
    <DetailContentLayout
      backPath="/tentang-sekolah/fasilitas"
      title={detail.title}
      subtitle="SMK Tamtama Kroya"
      heroImageUrl={detail.coverPhotoUrl || "https://placehold.co/1200x800/png"}
      heroImageAlt={detail.title}
      infoTitle="Informasi Fasilitas"
      infoItems={[
        { label: "Kategori", value: categoryLabel },
        {
          label: "Status",
          value: detail.isPublished ? "Dipublikasikan" : "Draft",
        },
        { label: "Jumlah Foto", value: String(galleries.length) },
      ]}
      descriptionTitle={descriptionTitle}
      description={
        detail.description?.trim() ||
        detail.summary?.trim() ||
        "Belum ada deskripsi fasilitas."
      }
      galleryTitle="Galeri Fasilitas"
      galleries={galleries.map((gallery) => ({
        id: gallery.id,
        photoUrl: gallery.photoUrl,
        order: gallery.order,
      }))}
      galleryDescription={detail.galleryDescription}
      galleryEmptyText="Belum ada dokumentasi fasilitas"
      highlightsTitle="Ringkasan Fasilitas"
      highlights={highlights}
      highlightsEmptyText="Belum ada ringkasan fasilitas"
    />
  );
}

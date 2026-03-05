"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import RotatedHighlightTitle from "@/components/SectionTitle/RotatedHighlightTitle";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { ExtracurricularDetail } from "../type";
import { resolveSlug } from "@/utils/resolveSlug";
import { LuArrowLeft } from "react-icons/lu";

export default function ExtracurricularDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExtracurricularDetail | null>(null);

  const slug = resolveSlug(params?.slug);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!slug) {
        if (!cancelled) {
          setError("Slug ekstrakurikuler tidak valid.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/extracurriculars/${encodeURIComponent(slug)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch extracurricular detail");
        }

        const result: ExtracurricularDetail = await response.json();

        if (!cancelled) {
          setDetail(result);
        }
      } catch (fetchError) {
        console.error("Failed fetch extracurricular detail", fetchError);

        if (!cancelled) {
          setError("Data ekstrakurikuler tidak ditemukan.");
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

  const achievements = useMemo(
    () => [...(detail?.achievements || [])].sort((a, b) => a.order - b.order),
    [detail?.achievements],
  );

  const shouldUseMarquee = galleries.length > 4;

  const marqueeGalleries = useMemo(
    () => (shouldUseMarquee ? [...galleries, ...galleries] : galleries),
    [galleries, shouldUseMarquee],
  );

  const marqueeDuration = useMemo(
    () => Math.max(18, galleries.length * 4),
    [galleries.length],
  );

  const marqueeStyle = useMemo(
    () =>
      ({
        "--marquee-duration": `${marqueeDuration}s`,
      }) as CSSProperties,
    [marqueeDuration],
  );

  const [firstNameWord, remainingNameWords] = useMemo(() => {
    const words = (detail?.name || "").trim().split(/\s+/).filter(Boolean);

    return [words[0] || "", words.slice(1).join(" ")];
  }, [detail?.name]);

  const formattedCategories = useMemo(() => {
    const categories = (detail?.categories || [])
      .map((item) => item.trim())
      .filter(Boolean);

    if (categories.length === 0) {
      return "-";
    }

    if (categories.length === 1) {
      return categories[0];
    }

    if (categories.length === 2) {
      return `${categories[0]} & ${categories[1]}`;
    }

    return `${categories.slice(0, -1).join(", ")} & ${categories[categories.length - 1]}`;
  }, [detail?.categories]);

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 mt-24 animate-pulse">
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
      <main className="min-h-screen w-full bg-linear-to-b from-[#fafafa] to-gray-50 px-4 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 mt-32 text-center">
          <p className="text-lg text-gray-700">
            {error || "Data tidak tersedia"}
          </p>
          <TextButton
            variant="outline"
            text="Kembali ke daftar ekstrakurikuler"
            onClick={() => router.push("/tentang-sekolah/ekstrakulikuler")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 py-16 sm:pb-4 max-sm:pt-20 max-sm:px-8">
        <div className="w-fit">
          <TextButton
            variant="shadow"
            icon={<LuArrowLeft className="text-2xl" />}
            className="w-fit!"
            onClick={() => router.push("/tentang-sekolah/ekstrakulikuler")}
          />
        </div>

        <div className="w-full flex flex-col gap-3">
          <h1 className="text-4xl max-sm:text-2xl font-semibold text-primary">
            {detail.name}
          </h1>
          <h2 className="text-xl text-primary">SMK Tamtama Kroya</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full h-full">
          <Image
            src={detail.thumbnailUrl || "https://placehold.co/1200x800/png"}
            alt={detail.name}
            width={1200}
            height={800}
            loading="lazy"
            unoptimized
            className="md:w-6/10 w-full h-auto max-h-92 rounded-md border border-gray-200 object-cover"
          />
          <div className="md:w-4/10 w-full h-full flex flex-col gap-4 p-8 border border-gray-300 shadow rounded-md">
            <h2 className="text-xl text-primary font-semibold">
              Informasi Singkat
            </h2>

            <div className="flex flex-col gap-2 text-gray-800">
              <div className="grid grid-cols-[7rem_1fr] items-start gap-x-2">
                <p className="font-semibold whitespace-nowrap">Pembina</p>
                <p className="font-normal wrap-break-word">
                  : {detail.mentorName}
                </p>
              </div>

              <div className="grid grid-cols-[7rem_1fr] items-start gap-x-2">
                <p className="font-semibold whitespace-nowrap">Kategori</p>
                <p className="font-normal wrap-break-word capitalize">
                  : {formattedCategories}
                </p>
              </div>

              <div className="grid grid-cols-[7rem_1fr] items-start gap-x-2">
                <p className="font-semibold whitespace-nowrap">Lokasi</p>
                <p className="font-normal wrap-break-word">
                  : {detail.location}
                </p>
              </div>

              <div className="grid grid-cols-[7rem_1fr] items-start gap-x-2">
                <p className="font-semibold whitespace-nowrap">Jadwal</p>
                <p className="font-normal wrap-break-word">
                  : {detail.schedule}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-3 mt-10 max-w-7xl">
          <h2 className="text-2xl max-sm:text-xl font-semibold text-primary flex flex-wrap items-center gap-2">
            <span>Tentang</span>
            {firstNameWord && (
              <RotatedHighlightTitle
                as="span"
                title={firstNameWord}
                className="align-middle"
                titleClassName="text-2xl max-sm:text-xl font-semibold text-primary"
                highlightClassName="h-9 max-sm:h-8"
              />
            )}
            {remainingNameWords && <span>{remainingNameWords}</span>}
            <span>SMK Tamtama Kroya</span>
          </h2>
          <p className="text-base text-gray-700 leading-relaxed break-all">
            {detail.description}
          </p>
        </section>

        <section className="flex flex-col gap-3 mt-10">
          <RotatedHighlightTitle title="Foto Kegiatan" />
          {galleries.length > 0 ? (
            shouldUseMarquee ? (
              <div className="group relative mt-6 overflow-hidden">
                {/* <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-white via-white/60 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-white via-white/60 to-transparent" /> */}

                <div
                  className="ekstra-marquee-track flex w-max gap-4"
                  style={marqueeStyle}
                >
                  {marqueeGalleries.map((gallery, index) => (
                    <div
                      key={`${gallery.id}-${index}`}
                      className="w-[78vw] shrink-0 sm:w-[45vw] md:w-[34vw] lg:w-[28vw] xl:w-[22vw]"
                    >
                      <Image
                        src={
                          gallery.photoUrl ||
                          "https://placehold.co/1600x900/png"
                        }
                        alt={`${detail.name} galeri ${gallery.order + 1}`}
                        width={1600}
                        height={900}
                        loading="lazy"
                        unoptimized
                        className="h-52 w-full rounded-lg border border-gray-200 object-cover grayscale transition-[filter,transform] duration-500 ease-out hover:grayscale-0 hover:scale-[1.01]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="gallery-thin-scrollbar mt-6 -mx-2 overflow-x-auto px-2 pb-2">
                <div className="flex w-max gap-4">
                  {galleries.map((gallery) => (
                    <div
                      key={gallery.id}
                      className="w-[78vw] shrink-0 sm:w-[45vw] md:w-[34vw] lg:w-[28vw] xl:w-[22vw]"
                    >
                      <Image
                        src={
                          gallery.photoUrl ||
                          "https://placehold.co/1600x900/png"
                        }
                        alt={`${detail.name} galeri ${gallery.order + 1}`}
                        width={1600}
                        height={900}
                        loading="lazy"
                        unoptimized
                        className="h-52 w-full rounded-lg border border-gray-200 object-cover grayscale transition-[filter,transform] duration-500 ease-out hover:grayscale-0 hover:scale-[1.01]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <p className="mt-6">Belum ada foto kegiatan</p>
          )}
        </section>

        <section className="flex flex-col gap-3 mt-10">
          <RotatedHighlightTitle title="Prestasi Kegiatan" />

          <ol className="flex flex-col gap-2 mt-4 ml-6">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <li key={achievement.id} className="text-gray-700 list-disc">
                  {achievement.name}
                </li>
              ))
            ) : (
              <p>Belum ada data prestasi</p>
            )}
          </ol>
        </section>
      </div>

      <style jsx>{`
        .ekstra-marquee-track {
          animation: marquee-left var(--marquee-duration, 30s) linear infinite;
          will-change: transform;
        }

        .group:hover .ekstra-marquee-track {
          animation-play-state: paused;
        }

        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ekstra-marquee-track {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}

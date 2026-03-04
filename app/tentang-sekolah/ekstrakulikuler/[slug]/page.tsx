"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
          <h1 className="text-4xl max-sm:text-2xl font-bold text-primary">
            {detail.name}
          </h1>
          <h2 className="text-xl text-primary">SMK Tamtama Kroya</h2>
        </div>

        <div className="flex flex-row gap-4 w-full h-full">
          <Image
            src={detail.thumbnailUrl || "https://placehold.co/1200x800/png"}
            alt={detail.name}
            width={1200}
            height={800}
            loading="lazy"
            unoptimized
            className="w-6/10 h-auto max-h-92 rounded-lg border border-gray-200 object-cover"
          />
          <div className="w-4/10 h-full flex flex-col gap-4 p-8 border border-gray-400 rounded-md">
            <h2 className="text-xl text-primary font-bold">
              Informasi Singkat
            </h2>

            <p className="">• Pembina: {detail.mentorName}</p>
            <div className="flex flex-wrap gap-1">
              • Kategori:
              {detail.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 rounded-full bg-primary/10"
                >
                  {category}
                </span>
              ))}
            </div>
            <p className="">• Lokasi: {detail.location}</p>
            <p className="">• Jadwal: {detail.schedule}</p>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl max-sm:text-xl font-bold text-primary">
            Tentang {detail.name} SMK Tamtama Kroya
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            {detail.description}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl max-sm:text-xl font-bold text-primary">
            Foto Kegiatan
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <Image
                key={gallery.id}
                src={gallery.photoUrl || "https://placehold.co/1600x900/png"}
                alt={`${detail.name} galeri ${gallery.order + 1}`}
                width={1600}
                height={900}
                loading="lazy"
                unoptimized
                className="w-full h-52 rounded-lg border border-gray-200 object-cover"
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl max-sm:text-xl font-bold text-primary">
            Prestasi Kegiatan
          </h2>
          <div className="flex flex-col gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700"
              >
                {achievement.name}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

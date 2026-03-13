"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MandatoryLabel } from "../MandatoryLabel";
import SelectInput from "@/components/InputForm/SelectInput";
import { TextButton } from "@/components/Buttons/TextButton";
import Image from "next/image";
import { PilihJurusanForm } from "@/utils/registrationTypes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAlert } from "@/components/ui/alert";

const pilihJurusanSchema = z.object({
  jurusanDipilih: z.string().min(1, "Jurusan harus dipilih"),
});

interface PilihJurusanProps {
  onNext: (data: PilihJurusanForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
  initialData?: PilihJurusanForm;
  isTeacherMode?: boolean;
  onValidationError?: (message: string) => void;
}

interface JurusanItem {
  label: string;
  value: string;
  image: string;
  prospects: string[];
}

interface MajorsApiItem {
  name?: string;
  abbreviation?: string;
  summary?: string;
  photoUrl?: string;
}

interface MajorsApiResponse {
  items?: MajorsApiItem[];
}

const DEFAULT_JURUSAN_DATA_LIST: JurusanItem[] = [
  {
    label: "Teknik Kendaraan Ringan (TKR)",
    value: "TKR",
    image: "/ppdb/TKR.jpg",
    prospects: [
      "Mekanik / Teknisi",
      "Supervisor",
      "Operator Produksi",
      "Service Advisor",
      "Wirausaha (Toko Sparepart, Bengkel Motor dan Mobil)",
      "Modificator Otomotif",
    ],
  },
  {
    label: "Teknik Instalasi Tenaga Listrik (TITL)",
    value: "TITL",
    image: "/ppdb/TITL.jpg",
    prospects: [
      "Wirausaha",
      "Teknisi Kontrol Industri",
      "Teknisi AC Mobil",
      "Teknisi TV dan Elektronik",
      "Teknisi Jaringan Listrik",
    ],
  },
  {
    label: "Teknik Pemesinan (TP)",
    value: "TP",
    image: "/ppdb/TP.jpg",
    prospects: [
      "Programmer CNC, Bubur dan Milling",
      "Wirausaha (Bengkel Las, Bubur, dan CNC)",
      "Operator Produksi",
    ],
  },
  {
    label: "Desain Komunikasi Visual (DKV)",
    value: "DKV",
    image: "/ppdb/DKV.jpg",
    prospects: [
      "Editor",
      "Programmer",
      "Content Creator",
      "Media Audio Visual",
      "Game Developer",
      "Fotografer",
      "Videografer",
    ],
  },
];

const DEFAULT_JURUSAN_MAP = new Map(
  DEFAULT_JURUSAN_DATA_LIST.map((item) => [item.value.toUpperCase(), item]),
);

export const PilihJurusan: React.FC<PilihJurusanProps> = ({
  onNext,
  onPrev,
  onCancel,
  initialData,
  isTeacherMode,
}) => {
  const { showAlert } = useAlert();
  const [jurusanDataList, setJurusanDataList] = useState<JurusanItem[]>(
    DEFAULT_JURUSAN_DATA_LIST,
  );

  useEffect(() => {
    let cancelled = false;

    const fetchMajorsFromBackend = async () => {
      try {
        const response = await fetch("/api/majors?page=1&perPage=50", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch majors options");
        }

        const payload = (await response.json()) as MajorsApiResponse;
        const backendItems = Array.isArray(payload?.items) ? payload.items : [];

        if (backendItems.length === 0) {
          if (!cancelled) {
            setJurusanDataList(DEFAULT_JURUSAN_DATA_LIST);
          }
          return;
        }

        const mappedItems = backendItems
          .map((item) => {
            const abbreviation = String(item.abbreviation || "")
              .trim()
              .toUpperCase();
            const name = String(item.name || "").trim();

            if (!abbreviation || !name) {
              return null;
            }

            const fallback = DEFAULT_JURUSAN_MAP.get(abbreviation);
            const summary = String(item.summary || "").trim();
            const image =
              String(item.photoUrl || "").trim() ||
              fallback?.image ||
              "https://placehold.co/1200x800/png";

            return {
              label: `${name} (${abbreviation})`,
              value: abbreviation,
              image,
              prospects:
                fallback?.prospects ||
                (summary ? [summary] : ["Prospek lulusan sedang diperbarui."]),
            } as JurusanItem;
          })
          .filter((item): item is JurusanItem => Boolean(item));

        const uniqueMappedItems = Array.from(
          new Map(mappedItems.map((item) => [item.value, item])).values(),
        );

        if (!cancelled) {
          setJurusanDataList(
            uniqueMappedItems.length > 0
              ? uniqueMappedItems
              : DEFAULT_JURUSAN_DATA_LIST,
          );
        }
      } catch (error) {
        console.error("Failed fetch majors for registration", error);
        if (!cancelled) {
          setJurusanDataList(DEFAULT_JURUSAN_DATA_LIST);
        }
      }
    };

    fetchMajorsFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  const form = useForm<PilihJurusanForm>({
    resolver: zodResolver(pilihJurusanSchema),
    defaultValues: initialData || {
      jurusanDipilih: "",
    },
  });

  const jurusanDipilih = form.watch("jurusanDipilih");

  const selectedJurusan = jurusanDataList.find(
    (j) => j.value === jurusanDipilih,
  );

  const onSubmit = (data: PilihJurusanForm) => {
    onNext(data);
  };

  const onError = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showAlert({
        title: "Data Tidak Lengkap",
        description: firstError.message,
        variant: "warning",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="w-full">
        <div className="grid grid-cols-1">
          <MandatoryLabel
            notes={
              "Pilih jurusan yang paling sesuai dengan minat dan rencana masa " +
              (isTeacherMode ? "calon murid" : "depanmu 😊")
            }
          />
          <FormField
            control={form.control}
            name="jurusanDipilih"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectInput
                    label="Jurusan yang Diminati"
                    {...field}
                    options={jurusanDataList.map((jurusan) => ({
                      value: jurusan.value,
                      label: jurusan.label,
                    }))}
                    placeholder="Silahkan pilih jurusan"
                    isMandatory
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedJurusan && (
          <div className="mt-8 max-sm:mt-3 w-full">
            <div className="overflow-hidden flex flex-col justify-center items-center  rounded-lg">
              <div className="max-sm:w-full rounded-2xl max-sm:rounded-sm w-full aspect-video bg-gray-300 overflow-hidden">
                <Image
                  width={3000}
                  height={2000}
                  src={selectedJurusan.image}
                  alt={selectedJurusan.label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 max-sm:p-3 bg-white w-full justify-start">
                <h3 className="text-center max-sm:text-left font-semibold text-xl max-sm:text-lg text-primary mb-2">
                  {selectedJurusan.label}
                </h3>
                <h3 className="text-lg max-sm:text-base font-bold text-primary mb-4 underline underline-offset-2">
                  Prospek Lulusan
                </h3>
                <ul className="space-y-3">
                  {selectedJurusan.prospects.map((prospect, index) => (
                    <li
                      key={index}
                      className="flex max-sm:text-xs items-start gap-3 text-gray-700"
                    >
                      {index + 1}. {prospect}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between gap-4 mt-10 max-sm:grid max-sm:grid-cols-1 max-sm:gap-y-3">
          <div className="flex gap-6 max-sm:justify-between">
            <TextButton
              variant="secondary"
              text="Kembali"
              className="px-8 py-2"
              onClick={onPrev}
            />
            {onCancel && (
              <TextButton
                variant="outline"
                text="Batal"
                className="px-8 py-2"
                onClick={onCancel}
              />
            )}
          </div>
          <TextButton
            variant="primary"
            text="Selanjutnya"
            className="px-8 py-2"
            isSubmit
          />
        </div>
      </form>
    </Form>
  );
};

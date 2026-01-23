"use client";

import React, { useState } from "react";
import { MandatoryLabel } from "../MandatoryLabel";
import SelectInput from "@/components/InputForm/SelectInput";
import { TextButton } from "@/components/Buttons/TextButton";

interface PilihJurusanForm {
  jurusanDipilih: string;
}

interface PilihJurusanProps {
  onNext: (data: PilihJurusanForm) => void;
  onPrev: () => void;
  onCancel?: () => void;
}

export const PilihJurusan: React.FC<PilihJurusanProps> = ({
  onNext,
  onPrev,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PilihJurusanForm>({
    jurusanDipilih: "",
  });

  const jurusanData = [
    {
      label: "Teknik Kendaraan Ringan (TKR)",
      value: "tkr",
      image: "/ppdb/tkr.jpg",
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
      value: "titl",
      image: "/ppdb/titl.jpg",
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
      value: "tp",
      image: "/ppdb/tp.jpg",
      prospects: [
        "Programmer CNC, Bubur dan Milling",
        "Wirausaha (Bengkel Las, Bubur, dan CNC)",
        "Operator Produksi",
      ],
    },
    {
      label: "Desain Komunikasi Visual (DKV)",
      value: "dkv",
      image: "/ppdb/dkv.jpg",
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

  const selectedJurusan = jurusanData.find(
    (j) => j.value === formData.jurusanDipilih,
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1">
        <MandatoryLabel notes="Note: Pilih jurusan yang paling sesuai dengan minat dan rencana masa depanmu 😊" />
        <SelectInput
          label="Jurusan yang Diminati"
          name="jurusanDipilih"
          value={formData.jurusanDipilih}
          onChange={handleChange}
          options={jurusanData.map((jurusan) => ({
            value: jurusan.value,
            label: jurusan.label,
          }))}
          placeholder="Silahkan pilih jurusan"
          isMandatory
        />
      </div>

      {/* Career Prospects Section */}
      {selectedJurusan && (
        <div className="mt-8 max-sm:mt-3 w-full">
          <div className="overflow-hidden flex flex-col justify-center items-center  rounded-lg">
            {/* Image */}
            <div className="w-[90%] max-sm:w-full rounded-2xl max-sm:rounded-sm h-64 sm:h-80 lg:h-96 bg-gray-300 overflow-hidden">
              {/* <img
                src={selectedJurusan.image}
                alt={selectedJurusan.label}
                className="w-full h-full object-cover"
              /> */}
            </div>

            {/* Prospects Content */}
            <div className="p-6 max-sm:p-3 bg-white w-full justify-start">
              <h3 className="text-center max-sm:text-left font-semibold text-xl max-sm:text-lg text-primary mb-2">
                {selectedJurusan.label}
              </h3>
              <h3 className="text-lg max-sm:text-base font-bold text-primary mb-4">
                Prospek Lulusan
              </h3>
              <ul className="space-y-3">
                {selectedJurusan.prospects.map((prospect, index) => (
                  <li
                    key={index}
                    className="flex max-sm:text-xs items-start gap-3 text-gray-700"
                  >
                    {/* <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold">
                     
                    </span> */}
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
  );
};

"use client";

import React, { useState } from "react";

interface PilihJurusanForm {
  jurusanPilihan1: string;
  jurusanPilihan2: string;
}

interface PilihJurusanProps {
  onNext: (data: PilihJurusanForm) => void;
  onPrev: () => void;
}

export const PilihJurusan: React.FC<PilihJurusanProps> = ({
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<PilihJurusanForm>({
    jurusanPilihan1: "",
    jurusanPilihan2: "",
  });

  const jurusanOptions = [
    "Teknik Komputer dan Jaringan",
    "Rekayasa Perangkat Lunak",
    "Multimedia",
    "Bisnis dan Pemasaran Digital",
    "Otomatisasi Industri",
  ];

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-gray-700 text-sm">
          📢 Pilih dua jurusan pilihan sesuai dengan minat dan bakat Anda.
          Jurusan pertama adalah pilihan utama Anda.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Jurusan Pilihan 1 (Utama) *
        </label>
        <select
          name="jurusanPilihan1"
          value={formData.jurusanPilihan1}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Pilih Jurusan Utama</option>
          {jurusanOptions.map((jurusan) => (
            <option key={jurusan} value={jurusan}>
              {jurusan}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Jurusan Pilihan 2 (Alternatif) *
        </label>
        <select
          name="jurusanPilihan2"
          value={formData.jurusanPilihan2}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Pilih Jurusan Alternatif</option>
          {jurusanOptions.map((jurusan) => (
            <option key={jurusan} value={jurusan}>
              {jurusan}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-8 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
        >
          Kembali
        </button>
        <button
          type="submit"
          className="px-8 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Lanjutkan
        </button>
      </div>
    </form>
  );
};

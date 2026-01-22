"use client";

import React, { useState } from "react";

interface BiodataWaliForm {
  namaWali: string;
  nikWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;
  alamatWali: string;
  nomorTeleponWali: string;
  hubunganDenganSiswa: string;
}

interface BiodataWaliProps {
  onNext: (data: BiodataWaliForm) => void;
  onPrev: () => void;
}

export const BiodataWali: React.FC<BiodataWaliProps> = ({ onNext, onPrev }) => {
  const [formData, setFormData] = useState<BiodataWaliForm>({
    namaWali: "",
    nikWali: "",
    pekerjaanWali: "",
    penghasilanWali: "",
    alamatWali: "",
    nomorTeleponWali: "",
    hubunganDenganSiswa: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
          📢 Isi data wali jika ada. Jika tidak ada wali, Anda dapat melewati
          bagian ini.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nama Wali *
        </label>
        <input
          type="text"
          name="namaWali"
          value={formData.namaWali}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Masukkan nama wali"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          NIK Wali *
        </label>
        <input
          type="text"
          name="nikWali"
          value={formData.nikWali}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Masukkan NIK wali"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pekerjaan Wali *
        </label>
        <input
          type="text"
          name="pekerjaanWali"
          value={formData.pekerjaanWali}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Masukkan pekerjaan wali"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Penghasilan Wali (per bulan) *
        </label>
        <select
          name="penghasilanWali"
          value={formData.penghasilanWali}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Pilih Penghasilan</option>
          <option value="< 1 juta">Kurang dari 1 juta</option>
          <option value="1 - 2 juta">1 - 2 juta</option>
          <option value="2 - 5 juta">2 - 5 juta</option>
          <option value="5 - 10 juta">5 - 10 juta</option>
          <option value="> 10 juta">Lebih dari 10 juta</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Hubungan dengan Siswa *
        </label>
        <select
          name="hubunganDenganSiswa"
          value={formData.hubunganDenganSiswa}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Pilih Hubungan</option>
          <option value="Kakek">Kakek</option>
          <option value="Nenek">Nenek</option>
          <option value="Paman">Paman</option>
          <option value="Bibi">Bibi</option>
          <option value="Kakak">Kakak</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Alamat Wali *
        </label>
        <textarea
          name="alamatWali"
          value={formData.alamatWali}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, alamatWali: e.target.value }))
          }
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Masukkan alamat wali"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nomor Telepon Wali *
        </label>
        <input
          type="tel"
          name="nomorTeleponWali"
          value={formData.nomorTeleponWali}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Masukkan nomor telepon wali"
        />
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

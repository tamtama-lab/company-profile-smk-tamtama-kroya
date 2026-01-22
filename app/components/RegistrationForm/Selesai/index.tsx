"use client";

import React from "react";

interface SelesaiProps {
  onSubmit: () => void;
  onPrev: () => void;
}

export const Selesai: React.FC<SelesaiProps> = ({ onSubmit, onPrev }) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Pendaftaran Berhasil!
      </h2>
      <p className="text-gray-600 mb-4">
        Terima kasih telah melakukan pendaftaran di SMK Tamtama Kroya.
      </p>
      <p className="text-gray-600 mb-6">
        Data Anda telah kami terima. Tim sekolah akan segera menghubungi Anda
        untuk tahap selanjutnya.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">📧 Email Konfirmasi:</span> Kami akan
          mengirimkan email konfirmasi ke alamat email Anda yang terdaftar.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <span className="font-semibold">📱 WhatsApp:</span> Hubungi kami via
          WhatsApp untuk pertanyaan lebih lanjut.
        </p>
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
          onClick={onSubmit}
          className="px-8 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

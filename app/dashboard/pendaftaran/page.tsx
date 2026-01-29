"use client";

import { useEffect, useState } from "react";
import {
  MdPeople,
  MdCheckCircle,
  MdPending,
  MdTrendingUp,
} from "react-icons/md";

interface Activity {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "warning" | "info" | "error";
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Get user name from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const data = JSON.parse(userData);
        // Schedule state update to avoid synchronous setState in effect
        setTimeout(() => {
          setUserName(data.name || data.firstName || "User");
        }, 0);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Sample data - dapat diganti dengan data dari API
  const stats = [
    {
      title: "Total Siswa",
      value: "1,234",
      icon: <MdPeople className="w-6 h-6" />,
      color: "blue" as const,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Pendaftaran Selesai",
      value: "856",
      icon: <MdCheckCircle className="w-6 h-6" />,
      color: "green" as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Menunggu Verifikasi",
      value: "287",
      icon: <MdPending className="w-6 h-6" />,
      color: "yellow" as const,
      trend: { value: 3, isPositive: false },
    },
    {
      title: "Tingkat Konversi",
      value: "69.4%",
      icon: <MdTrendingUp className="w-6 h-6" />,
      color: "purple" as const,
      trend: { value: 5, isPositive: true },
    },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      title: "Pendaftaran Baru",
      description: "Siswa baru bernama Adi Pratama mendaftar",
      timestamp: "5 menit yang lalu",
      type: "success",
    },
    {
      id: 2,
      title: "Verifikasi Dokumen",
      description: "Dokumen dari Siti Nurhaliza telah diverifikasi",
      timestamp: "15 menit yang lalu",
      type: "success",
    },
    {
      id: 3,
      title: "Dokumen Ditolak",
      description: "Dokumen dari Budi Santoso memerlukan perbaikan",
      timestamp: "1 jam yang lalu",
      type: "warning",
    },
    {
      id: 4,
      title: "Penjadwalan Tes",
      description: "15 siswa telah dijadwalkan untuk tes masuk",
      timestamp: "2 jam yang lalu",
      type: "info",
    },
    {
      id: 5,
      title: "Hasil Tes Diumumkan",
      description: "Hasil tes seleksi batch pertama telah diumumkan",
      timestamp: "3 jam yang lalu",
      type: "success",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"></div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            Grafik Pendaftaran
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Grafik akan ditampilkan di sini</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Ringkasan</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">
                Tingkat Penyelesaian
              </span>
              <span className="text-lg font-bold text-blue-600">94.2%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Rata-rata Usia</span>
              <span className="text-lg font-bold text-blue-600">16.3 th</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Jurusan Populer</span>
              <span className="text-lg font-bold text-blue-600">TKJP</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

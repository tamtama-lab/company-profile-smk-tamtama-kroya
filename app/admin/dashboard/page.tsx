"use client";

import { useAuth } from "@/components/AuthGuard";
import StatsCard from "@/components/Card/StatsCard";
import { getAuthHeader } from "@/utils/auth";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FiUser, FiUsers } from "react-icons/fi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { MdOutlineToday } from "react-icons/md";

export function GreetingCard() {
  const { user } = useAuth();
  const greeting =
    dayjs().hour() < 10
      ? "Selamat Pagi"
      : dayjs().hour() < 15
        ? "Selamat Siang"
        : dayjs().hour() < 18
          ? "Selamat Sore"
          : "Selamat Malam";
  return (
    <div
      id="greeting-card"
      className="w-full rounded-xl p-6 flex flex-col justify-center items-start gap-2"
    >
      <h1 className="text-xl font-semibold text-gray-800">
        {greeting}, {user?.fullName || "User"} 👋🏻
      </h1>
      <h2 className="text-sm text-gray-500">
        Lihat statistik data terbaru pendaftaran calon murid baru
      </h2>
      <h2 className="text-sm text-gray-500">
        SMK Tamtama Kroya tahun ajaran 2025/2026
      </h2>
    </div>
  );
}

interface DashboardStats {
  registration_total_count: number;
  daily_registration_count: number;
  weekly_registration_count: number;
  registrations_by_teacher: number;
  registrations_independent: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Total Pendaftar",
      icon: FiUsers,
      amount: stats?.registration_total_count ?? 0,
      isFirstUnique: true,
    },
    {
      title: "Pendaftar Hari Ini",
      icon: MdOutlineToday,
      amount: stats?.daily_registration_count ?? 0,
    },
    {
      title: "Pendaftar Oleh Guru",
      icon: LiaChalkboardTeacherSolid,
      amount: stats?.registrations_by_teacher ?? 0,
    },
    {
      title: "Pendaftar Mandiri",
      icon: FiUser,
      amount: stats?.registrations_independent ?? 0,
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-4px)] bg-gray-100 p-4">
      <div className="h-full">
        <GreetingCard />
        <StatsCard data={statsData} isLoading={isLoading} />
        <div className="w-full h-100 bg-white rounded-md drop-shadow-sm"></div>
      </div>
    </div>
  );
}

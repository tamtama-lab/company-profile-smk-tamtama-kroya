"use client";
import { AlertProvider } from "@/components/ui/alert";
import { JSX } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <AlertProvider>
      <main className="h-screen w-screen bg-white">
        <div className="w-full h-full grid grid-cols-2 max-sm:grid-cols-1 max-md:grid-cols-1">
          {/* Kolom Kiri - Form */}
          <section className="w-full h-full flex items-center justify-center overflow-auto">
            {children}
          </section>

          {/* Kolom Kanan - Image/Branding */}
          <section className="w-full h-full bg-primary hidden sm:flex items-center justify-center">
            {/* <div className="text-white text-center px-8">
            <h1 className="text-4xl font-bold mb-4">SMK Tamtama Kroya</h1>
            <p className="text-lg opacity-90">
            Sistem Pendaftaran Peserta Didik Baru
            </p>
            </div> */}
          </section>
        </div>
      </main>
    </AlertProvider>
  );
}

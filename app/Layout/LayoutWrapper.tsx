"use client";
import { Footer } from "@/components/Footer";
import RegistrationHeader from "@/components/Headers/RegistrationHeader";
import Header from "@/components/Headers";
import { AlertProvider } from "@/components/ui/alert";
import { usePathname } from "next/navigation";
import { JSX } from "react";
import { BsWhatsapp } from "react-icons/bs";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();

  // Untuk custom path tanpa header (bisa ditambahkan sesuai kebutuhan)
  const noHeader = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/not-found",
  ];

  // Auth pages - sudah memiliki layout tersendiri di app/(auth)/layout.tsx
  // const authRoutes = [
  //   "/login",
  //   "/register",
  //   "/forgot-password",
  //   "/reset-password",
  // ];

  const registrationHeaderRoutes = ["/pendaftaran"];

  // Cek apakah pathname dimulai dengan path tanpa header
  const isNoHeader = noHeader.some((route) => pathname.startsWith(route));
  const isRegistrationPage = registrationHeaderRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isNoHeader) {
    return <>{children}</>;
  }

  const message =
    "Halo! Mohon informasikan pendaftaran murid baru di SMK Tamtama Kroya.";

  const encodedMessage = encodeURIComponent(message);

  return (
    <AlertProvider>
      {isRegistrationPage ? <RegistrationHeader /> : <Header />}
      {children}
      <a
        href={`https://wa.me/6281325767718?text=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 drop-shadow-xl bottom-4 md:right-8 right-2 bg-[#25d366] p-2 md:mr-4 md:mb-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
      >
        <BsWhatsapp size={30} color="white" />
      </a>
      {isRegistrationPage ? <></> : <Footer />}
    </AlertProvider>
  );
}

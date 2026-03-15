"use client";
import { Footer } from "@/components/Footer";
import RegistrationHeader from "@/components/Headers/RegistrationHeader";
import Header from "@/components/Headers";
import { AuthGuard } from "@/components/AuthGuard";
import Breadcrumb from "@/components/Breadcrumb";
import { usePathname } from "next/navigation";
import { JSX, useMemo, useState } from "react";
import { BsWhatsapp } from "react-icons/bs";
import DashboardHeader from "@/components/Headers/DashboardHeader";
import AdminHeader from "@/app/admin/dashboard/AdminHeader";
import Sidebar from "@/app/admin/dashboard/Sidebar";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const BREADCRUMB_LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  guru: "Guru",
  "akun-guru": "Akun Guru",
  "pendaftaran-oleh-guru": "Pendaftaran Oleh Guru",
  informasi: "Informasi",
  "jalur-pendaftaran": "Jalur Pendaftaran",
  "kontak-media": "Kontak Media",
  "statistik-pendaftaran": "Statistik Pendaftaran",
  "syarat-periode-pendaftaran": "Syarat Periode Pendaftaran",
  spmb: "SPMB",
  "bukti-pendaftaran": "Bukti Pendaftaran",
  "data-calon-murid": "Data Calon Murid",
  "panitia-spmb": "Panitia SPMB",
  siswa: "Siswa",
  "data-lulusan": "Data Lulusan",
  ekstrakurikuler: "Ekstrakurikuler",
  fasilitas: "Fasilitas",
  "prestasi-siswa": "Prestasi Siswa",
  "program-keahlian": "Program Keahlian",
  tambah: "Tambah",
  edit: "Edit",
  pendaftaran: "Pendaftaran",
  "tentang-sekolah": "Tentang Sekolah",
  "profil-lulusan": "Profil Lulusan",
  about: "Tentang",
};

const toTitleCase = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toReadableLabel = (segment: string): string => {
  const mappedLabel = BREADCRUMB_LABEL_MAP[segment.toLowerCase()];

  if (mappedLabel) {
    return mappedLabel;
  }

  let decodedSegment = segment;

  try {
    decodedSegment = decodeURIComponent(segment);
  } catch {
    decodedSegment = segment;
  }

  const normalizedSegment = decodedSegment
    .replace(/\+/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedSegment) {
    return "Detail";
  }

  if (/^\d+$/.test(normalizedSegment)) {
    return `#${normalizedSegment}`;
  }

  return toTitleCase(normalizedSegment);
};

const buildBreadcrumbItems = (
  pathname: string,
  options?: { skipFirstSegment?: boolean },
): BreadcrumbItem[] => {
  const allSegments = pathname.split("/").filter(Boolean);
  const shouldSkipFirstSegment = Boolean(options?.skipFirstSegment);
  const segments = shouldSkipFirstSegment ? allSegments.slice(1) : allSegments;

  return segments.map((segment) => ({
    // Only home should be clickable; all path segments are display-only.
    label: toReadableLabel(segment),
  }));
};

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  // Untuk custom path tanpa header (bisa ditambahkan sesuai kebutuhan)
  const noHeader = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/not-found",
  ];

  const registrationHeaderRoutes = ["/pendaftaran"];

  const dashboardRoutes = ["/dashboard"];
  const adminRoutes = ["/admin"];

  // Cek apakah pathname dimulai dengan path tanpa header
  const isNoHeader = noHeader.some((route) => pathname.startsWith(route));

  const isRegistrationPage = registrationHeaderRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isDashboardPage = dashboardRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAdminPage = adminRoutes.some((route) => pathname.startsWith(route));
  const isLandingPage = !isNoHeader && !isDashboardPage && !isAdminPage;

  const adminBreadcrumbItems = useMemo(
    () => buildBreadcrumbItems(pathname, { skipFirstSegment: true }),
    [pathname],
  );

  const landingBreadcrumbItems = useMemo(
    () => buildBreadcrumbItems(pathname),
    [pathname],
  );

  const shouldRenderLandingBreadcrumb =
    isLandingPage && pathname !== "/" && landingBreadcrumbItems.length > 0;

  if (isNoHeader) {
    return <>{children}</>;
  }

  const message =
    "Halo! Mohon informasikan pendaftaran murid baru di SMK Tamtama Kroya.";

  const encodedMessage = encodeURIComponent(message);

  return (
    <>
      {isAdminPage ? (
        <AuthGuard allowedRoles={["admin"]}>
          <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
          <Sidebar collapsed={collapsed} />
        </AuthGuard>
      ) : isRegistrationPage ? (
        <RegistrationHeader />
      ) : isDashboardPage ? (
        <AuthGuard allowedRoles={["teacher", "admin"]}>
          <DashboardHeader />
        </AuthGuard>
      ) : (
        <Header />
      )}
      {isAdminPage ? (
        <AuthGuard allowedRoles={["admin"]}>
          <div
            className={`pt-28 min-h-screen bg-gray-50 transition-all duration-300 ${collapsed ? "pl-16" : "pl-62"}`}
          >
            {adminBreadcrumbItems.length > 0 ? (
              <div className="px-4 pb-2 sm:px-6 lg:px-10">
                <Breadcrumb
                  className="w-fit"
                  homeHref="/admin/dashboard"
                  homeLabel="Admin"
                  items={adminBreadcrumbItems}
                />
              </div>
            ) : null}
            {children}
          </div>
        </AuthGuard>
      ) : (
        <div className="relative">
          {shouldRenderLandingBreadcrumb ? (
            <div className="relative z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm md:pointer-events-none md:absolute md:inset-x-0 md:top-24 md:border-none md:bg-transparent md:backdrop-blur-none">
              <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-10 md:py-0">
                <Breadcrumb
                  className="pointer-events-auto w-fit"
                  items={landingBreadcrumbItems}
                />
              </div>
            </div>
          ) : null}
          {children}
        </div>
      )}
      {!isDashboardPage && !isAdminPage && (
        <a
          href={`https://wa.me/6281325767718?text=${encodedMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed z-50 drop-shadow-xl bottom-4 md:right-8 right-2 bg-[#25d366] p-2 md:mr-4 md:mb-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          <BsWhatsapp size={30} color="white" />
        </a>
      )}
      {isRegistrationPage || isDashboardPage || isAdminPage ? (
        <></>
      ) : (
        <Footer />
      )}
    </>
  );
}

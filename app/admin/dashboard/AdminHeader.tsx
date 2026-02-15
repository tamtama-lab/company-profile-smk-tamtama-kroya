"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuLogOut } from "react-icons/lu";
import Dropdown from "@/components/Dropdown";
import { useAlert } from "@/components/ui/alert";
import { TextButton } from "@/components/Buttons/TextButton";
import { useAuth } from "@/components/AuthGuard";
import { ConfirmationAlert } from "@/components/Modal/ConfirmationAlert";
import { FiColumns, FiSidebar } from "react-icons/fi";
import { getAcademicYear } from "@/lib/getAcademicYear";
import { UserIcon } from "@/components/Icon/UserIcon";

interface AdminHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function AdminHeader({
  collapsed,
  setCollapsed,
}: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = user?.fullName || "Username";
  const displayRole = user?.role === "admin" ? "Admin" : "Role";

  const handleLogout = async () => {
    setIsLoading(true);
    showAlert({
      title: "Logout berhasil",
      description: "Anda diarahkan ke halaman log in",
      variant: "info",
    });
    await logout();
    setTimeout(() => {
      router.push("/login");
    }, 1500);
    setIsLoading(false);
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <header className="fixed bg-white text-black shadow-sm w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 z-100 top-0 ">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[21%] flex  flex-row items-center justify-between">
            <div className="shrink-0 flex flex-row ">
              <Image
                src="/header/logo.png"
                alt="logo-smk-tamtama-kroya"
                width={40}
                className="shrink-0"
                height={40}
              />
              <div className="hidden sm:flex flex-col ml-3">
                <h1 className="text-sm text-primary sm:text-base font-bold">
                  SMK TAMTAMA KROYA
                </h1>
                <p className="text-xs sm:text-sm">PPDB {getAcademicYear()}</p>
              </div>
            </div>
            <button
              className="text-primary ml-6 4xl:ml-2"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <FiSidebar className="w-6 h-6" />
              ) : (
                <FiColumns className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="min-w-fit flex flex-row border-l-2 border-gray-300">
            <Dropdown
              isOpen={modalOpen}
              onOpen={() => setModalOpen(true)}
              onClose={() => setModalOpen(false)}
              label={
                <div className="flex flex-col justify-start items-start">
                  <p className="text-xs" suppressHydrationWarning>
                    {displayName}
                  </p>
                  <p
                    className="text-[10px] text-gray-500"
                    suppressHydrationWarning
                  >
                    {displayRole}
                  </p>
                </div>
              }
              leftIcon={<UserIcon isAdmin />}
              width="max-w-fit"
              color="bg-white"
              textColor="text-gray-900"
              rounded="rounded-sm"
              className="px-3.5 py-2"
            >
              <TextButton
                variant="outline-danger"
                icon={<LuLogOut className="w-6 h-6 items-end" />}
                text="Keluar"
                isLoading={isLoading}
                width="full"
                className="flex justify-start"
                onClick={confirmLogout}
              />
            </Dropdown>
          </div>
        </div>
      </header>
      <ConfirmationAlert
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin logout? Semua sesi akan dihapus."
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
        onCancel={cancelLogout}
        confirmText="Keluar"
        cancelText="Batal"
        variant="warning"
      />
    </>
  );
}

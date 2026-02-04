import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";
import Link from "next/link";
import Dropdown from "../Dropdown";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useAlert } from "../ui/alert";
import { TextButton } from "../Buttons/TextButton";
import { useAuth } from "../AuthGuard";
import { ConfirmationAlert } from "@/components/Modal/ConfirmationAlert";

const currentYear = new Date().getFullYear();

export const NavItems = [
  { label: "DASHBOARD", href: "/dashboard" },
  {
    label: "DAFTARKAN MURID",
    href: "/dashboard/pendaftaran",
  },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // User info with fallback for SSR
  const displayName = user?.fullName || "Username";
  const displayRole =
    user?.role === "teacher"
      ? "Guru"
      : user?.role === "admin"
        ? "Admin"
        : "Role";

  const handleLogout = async () => {
    setIsLoading(true);
    // perform logout
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

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header
        className={`fixed bg-white text-black shadow-sm w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 z-100 top-0 `}
      >
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[24%] pr-4 flex flex-row items-center justify-start border-r-2 border-gray-300">
            <div className="w-fit flex flex-row">
              <Image
                src="/header/logo.png"
                alt="logo-smk-tamtama-kroya"
                // className="shrink-0"
                width={40}
                height={40}
              />
              <div className="hidden sm:flex flex-col ml-3">
                <h1 className="text-sm  text-primary sm:text-base font-bold">
                  SMK TAMTAMA KROYA
                </h1>
                <p className="text-xs sm:text-sm">
                  PPDB {currentYear}/{currentYear + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-primary"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:w-[80%] lg:flex lg:flex-row lg:justify-between sm:items-center sm:justify-end">
            <div className="w-full flex flex-row items-center justify-center space-x-6 lg:space-x-8">
              {NavItems.map((item) => (
                <div
                  key={item.label}
                  className={`text-base ${isActive(item.href) ? "font-bold text-primary" : ""}`}
                >
                  <Link href={item.href}>{item.label}</Link>
                </div>
              ))}
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
                leftIcon={
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex justify-center items-center">
                    <LuUser className="text-2xl" />{" "}
                  </div>
                }
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
                  width="full"
                  className="flex justify-start"
                  onClick={confirmLogout}
                  isLoading={isLoading}
                />
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4  overflow-hidden">
              {NavItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <Link href={item.href}>{item.label}</Link>
                </div>
              ))}
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 flex flex-row justify-end">
              <Dropdown
                isOpen={modalOpen}
                onOpen={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
                width="max-w-fit"
                color="bg-white"
                textColor="text-gray-900"
                rounded="rounded-sm"
                className="px-3.5 py-2"
                position="top"
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
                leftIcon={
                  <Image
                    src="https://github.com/shadcn.png"
                    alt="User Avatar"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                }
              >
                <TextButton
                  hoverEffect={false}
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
};

export default Header;

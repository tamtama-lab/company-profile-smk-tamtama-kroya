import { getAcademicYear } from "@/lib/getAcademicYear";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Header: React.FC = () => {
  const pathname = usePathname();

  const ppdbRoutes = ["/ppdb", "/"];

  const isPPDBRoute = ppdbRoutes.some((route) => pathname.startsWith(route));
  // const isScrolling = document > 0;

  return (
    <header className="fixed bg-white text-black shadow-lg w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 z-100 top-0">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="w-auto sm:w-[36%] flex flex-row items-center justify-start">
          <Link href="/">
            <Image
              src="/header/logo.png"
              alt="logo-smk-tamtama-kroya"
              width={40}
              height={40}
            />
          </Link>
          {isPPDBRoute && (
            <div className="hidden sm:flex flex-col ml-3">
              <h1 className="text-sm sm:text-base font-bold">
                SMK Tamtama Kroya
              </h1>
              <p className="text-xs sm:text-sm">PPDB {getAcademicYear()}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

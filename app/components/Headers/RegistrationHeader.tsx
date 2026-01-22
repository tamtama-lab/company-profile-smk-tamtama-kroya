import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";

const currentYear = new Date().getFullYear();

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ppdbRoutes = ["/ppdb", "/"];

  const isPPDBRoute = ppdbRoutes.some((route) => pathname.startsWith(route));
  // const isScrolling = document > 0;

  return (
    <header className="fixed bg-white text-black shadow-lg w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 z-100 top-0">
      <div className="w-full hidden flex flex-row justify-between items-center">
        <div className="w-auto sm:w-[36%] flex flex-row items-center justify-start">
          <Image
            src="/header/logo.png"
            alt="logo-smk-tamtama-kroya"
            width={40}
            height={40}
          />
          {isPPDBRoute && (
            <div className="hidden sm:flex flex-col ml-3">
              <h1 className="text-sm sm:text-base font-bold">
                SMK Tamtama Kroya
              </h1>
              <p className="text-xs sm:text-sm">
                PPDB {currentYear}/{currentYear + 1}
              </p>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;

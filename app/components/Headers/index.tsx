import { NavItems } from "@/configs/navbarMenu";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { MdOutlineArrowDropDown, MdMenu, MdClose } from "react-icons/md";
import { TextButton } from "../Buttons/TextButton";
import Link from "next/link";

const currentYear = new Date().getFullYear();

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpandItem = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  const ppdbRoutes = ["/ppdb", "/"];
  const routeToRegistration = () => {
    window.location.href = "/pendaftaran";
  };

  const isPPDBRoute = ppdbRoutes.some((route) => pathname.startsWith(route));

  return (
    <header
      className={`fixed bg-white text-black shadow-lg w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 z-100 top-0 `}
    >
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
              <p className="text-xs sm:text-sm">
                PPDB {currentYear}/{currentYear + 1}
              </p>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-primary"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setExpandedItem(null);
          }}
        >
          {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:w-[60%] lg:flex lg:flex-row sm:items-center sm:justify-end">
          <div className="w-full flex flex-row  space-x-6 lg:space-x-8">
            {NavItems.map((item) => (
              <div key={item.label} className="relative group/nav">
                <a
                  href={item.href}
                  className="relative flex flex-row justify-center items-center text-xs sm:text-sm font-medium text-black hover:text-primary transition-colors duration-200 ease-in-out
                  after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#014921] 
                  after:transition-all after:duration-300 after:ease-in-out
                  hover:after:w-full"
                >
                  {item.label}
                  {item.children ? (
                    <MdOutlineArrowDropDown
                      size={18}
                      className="group-hover:-rotate-90 transition-transform duration-200 ease-in-out ml-1"
                    />
                  ) : (
                    ""
                  )}
                </a>
                {item?.children && (
                  <div
                    className="absolute left-0 top-full mt-0 w-fit min-w-48 max-w-92 bg-white shadow-lg drop-shadow-gray-300 border border-gray-200 rounded-md p-3 sm:p-4
                    opacity-0 translate-y-2 pointer-events-none invisible
                    transition-all duration-300 ease-out
                    group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto group-hover/nav:visible
                    group-focus-within/nav:opacity-100 group-focus-within/nav:translate-y-0 group-focus-within/nav:pointer-events-auto group-focus-within/nav:visible"
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="
                        w-fit relative flex flex-row mb-3 last:mb-0 justify-left items-center text-xs sm:text-sm font-medium text-black hover:text-primary transition-colors duration-200 ease-in-out
                        after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#014921] 
                        after:transition-all after:duration-300 after:ease-in-out
                        hover:after:w-full"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <TextButton
            onClick={routeToRegistration}
            variant="primary"
            text="Daftar Sekarang"
            className="min-w-fit w-fit px-3 h-fit py-3 md:text-sm ml-6"
            width="fit"
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 pb-4 border-t border-gray-200">
          <div className="flex flex-col space-y-3 overflow-y-scroll">
            {NavItems.map((item) => (
              <div key={item.label} className="flex flex-col">
                <div
                  className="flex flex-row items-center justify-between text-sm font-medium text-black hover:text-primary transition-colors py-2 cursor-pointer"
                  onClick={() => {
                    if (item?.children) {
                      toggleExpandItem(item.label);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  <a
                    href={!item?.children ? item.href : "#"}
                    className="flex-1 hover:text-primary"
                    onClick={(e) => {
                      if (item?.children) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.label}
                  </a>
                  {item?.children && (
                    <MdOutlineArrowDropDown
                      size={18}
                      className={`transition-transform duration-300 ease-in-out ml-2 shrink-0 ${
                        expandedItem === item.label ? "-rotate-90" : ""
                      }`}
                    />
                  )}
                </div>
                {item?.children && expandedItem === item.label && (
                  <div className="ml-4 flex flex-col space-y-2 mt-2 border-l border-gray-200 pl-3 animate-in fade-in duration-200">
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="text-xs font-medium text-gray-700 hover:text-primary transition-colors py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <TextButton
              onClick={routeToRegistration}
              variant="primary"
              text="Daftar Sekarang"
              className="w-full text-sm"
              width="full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

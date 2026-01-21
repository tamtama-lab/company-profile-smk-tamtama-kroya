import { NavItems } from "@/configs/navbarMenu";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { TextButton } from "../Buttons/TextButton";

const currentYear = new Date().getFullYear();

export const Header: React.FC = () => {
  const pathname = usePathname();

  const ppdbRoutes = ["/ppdb", "/"];

  const isPPDBRoute = ppdbRoutes.some((route) => pathname.startsWith(route));

  return (
    <header className="fixed bg-white text-black shadow-lg w-full px-10 py-4 z-100">
      <div className="w-full flex flex-row justify-between">
        <div className="w-[36%] flex flex-row items-center justify-start">
          <Image
            src="/header/logo.png"
            alt="PPDB Logo"
            width={40}
            height={40}
          />
          {isPPDBRoute && (
            <div className="flex flex-col ml-3">
              <h1 className="text-base font-bold">SMK Tamtama Kroya</h1>
              <p className="text-sm">
                PPDB {currentYear}/{currentYear + 1}
              </p>
            </div>
          )}
        </div>
        <div className="w-[64%] flex flex-row items-center justify-end">
          <div className="w-full flex flex-row space-x-8">
            {NavItems.map((item) => (
              <div key={item.label} className="relative group/nav">
                <a
                  href={item.href}
                  className="relative flex flex-row justify-center items-center text-sm font-medium text-black hover:text-primary transition-colors duration-200 ease-in-out
                  after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#014921] 
                  after:transition-all after:duration-300 after:ease-in-out
                  hover:after:w-full"
                >
                  {item.label}
                  {item.children ? (
                    <MdOutlineArrowDropDown
                      size={20}
                      className="group-hover:-rotate-90 transition-transform duration-200 ease-in-out ml-1"
                    />
                  ) : (
                    ""
                  )}
                </a>
                {item?.children && (
                  <div
                    className="absolute left-0 top-full mt-0 w-fit min-w-54 bg-white shadow-lg drop-shadow-gray-300 border border-gray-200 rounded-md p-4
                    opacity-0 translate-y-2 pointer-events-none invisible
                    transition-all duration-200 ease-out
                    group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto group-hover/nav:visible
                    group-focus-within/nav:opacity-100 group-focus-within/nav:translate-y-0 group-focus-within/nav:pointer-events-auto group-focus-within/nav:visible"
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="
                        w-fit relative flex flex-row mb-4 last:mb-0 justify-left items-center text-sm font-medium text-black hover:text-primary transition-colors duration-200 ease-in-out
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
            type="primary"
            text="Daftar Sekarang"
            className="min-w-fit w-fit px-3 py-2"
            width="fit"
          />
          {/* <button className="min-w-fit px-3 py-2 bg-primary text-white rounded">
            Daftar Sekarang
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;

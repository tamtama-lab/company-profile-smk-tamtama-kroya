import Image from "next/image";
import React from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";

const NavItems = [
  { label: "Beranda", href: "/" },
  {
    label: "Tentang Sekolah",
    href: "/tentang-sekolah",
    children: [
      { label: "Kegiatan Sekolah", href: "/tentang-sekolah/kegiatan" },
      { label: "Fasilitas", href: "/tentang-sekolah/fasilitas" },
      { label: "Prestasi", href: "/tentang-sekolah/prestasi" },
      { label: "Profil Alumni", href: "/tentang-sekolah/alumni" },
    ],
  },
  {
    label: "Program & Kegiatan",
    href: "/program-kegiatan",
    children: [
      { label: "Program Keahlian", href: "/program-kegiatan/kegiatan" },
      { label: "Ekstrakulikuler", href: "/program-kegiatan/ekstrakulikuler" },
    ],
  },
  { label: "PPDB", href: "/ppdb" },
  { label: "Informasi", href: "/informasi" },
];

const currentYear = new Date().getFullYear();

export const Header: React.FC = () => {
  return (
    <header className="fixed bg-white text-[#2D2D2D] shadow-lg w-full px-10 py-4 z-100">
      <div className="w-full flex flex-row border justify-between">
        <div className="w-[40%] flex flex-row items-center justify-start border">
          <Image
            src="/header/logo.png"
            alt="PPDB Logo"
            width={40}
            height={40}
          />
          <div className="flex flex-col ml-3">
            <h1 className="text-base font-bold">SMK Tamtama Kroya</h1>
            <p className="text-sm">
              PPDB {currentYear}/{currentYear + 1}
            </p>
          </div>
        </div>
        <div className="w-[60%] flex flex-row items-center justify-end border">
          <div className="w-full border flex flex-row space-x-8 group-hover:visible">
            {NavItems.map((item) => (
              <div key={item.label} className="relative group">
                <a
                  href={item.href}
                  className="flex flex-row justify-center items-center text-sm font-medium text-[#2D2D2D] hover:text-[#014921]  transition-all duration-300 ease-in-out"
                >
                  {item.label}
                  {item.children ? (
                    <MdOutlineArrowDropDown
                      size={20}
                      className="group-hover:-rotate-90"
                    />
                  ) : (
                    ""
                  )}
                </a>
                {item?.children && (
                  <div
                    className="
                      absolute w-fit min-w-20 mt-2 bg-white shadow-lg rounded-md p-4 border
                      opacity-0 translate-y-2 pointer-events-none
                      transition-all duration-300 ease-out
                      group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                    "
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-[#2D2D2D]
                        hover:bg-[#014921] hover:text-white rounded
                          transition-colors duration-200"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-fit px-3 py-1 bg-[#014921] text-white rounded">
            Daftar Sekarang
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

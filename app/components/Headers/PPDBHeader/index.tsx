import Image from "next/image";
import React from "react";

const NavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Contact", href: "/contact" },
];

export const PPDBHeader: React.FC = () => {
  return (
    <header className="fixed bg-white text-[#2D2D2D] shadow-lg w-full px-10 py-4">
      <div className="w-full flex flex-row border justify-between">
        <div className="w-1/4 flex flex-row items-center justify-start border">
          <Image
            src="/header/logo.png"
            alt="PPDB Logo"
            width={40}
            height={40}
          />
          <div className="flex flex-col ml-3">
            <h1 className="text-base font-bold">SMK Tamtama Kroya</h1>
            <p className="text-sm">PPDB 2026/2027</p>
          </div>
        </div>
        <div className="w-2/4 flex flex-row items-center justify-between border">
          <div className="w-fit space-x-8">
            {NavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className=" text-sm font-medium text-[#2D2D2D] hover:text-[#014921]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <button className="w-fit px-3 py-1 bg-[#014921] text-white rounded">
            Contact Us
          </button>
        </div>
      </div>
    </header>
  );
};

export default PPDBHeader;

"use client";

import { navFooterPage, navFooterSection } from "@/configs/navbarMenu";
import Image from "next/image";
import { BsChevronUp } from "react-icons/bs";
import {
  PiGlobe,
  PiInstagramLogo,
  PiTiktokLogo,
  PiYoutubeLogo,
} from "react-icons/pi";

const currentYear = new Date().getFullYear();

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const Footer: React.FC = () => {
  return (
    <footer className="h-fit bg-primary text-white shadow-lg w-full flex flex-col">
      <div className="h-full w-full grid grid-cols-2 px-36 py-12 gap-x-16 gap-y-5 mb-10">
        <div className="w-full col-span-2 flex flex-row justify-start items-center border border-primary gap-3">
          <Image
            src="/header/logo.png"
            alt="PPDB Logo"
            width={40}
            height={40}
          />
          <h1 className="text-2xl font-semibold text-accent">
            SMK TAMTAMA KROYA
          </h1>
        </div>
        <div className="w-full h-full border border-primary flex flex-col justify-between">
          <h2>Siap Kerja • Siap Mandiri • Siap Bersaing.</h2>
          <p>
            SMK Tamtama Kroya berkomitmen menghadirkan pendidikan vokasional
            berkualitas dengan pembelajaran berbasis praktik dan industri, guna
            mencetak lulusan berkarakter, kompeten, dan siap kerja.
          </p>
          <div className="w-fit grid grid-cols-4 gap-6 justify-start items-center">
            {[
              {
                link: "https://www.instagram.com",
                icon: <PiInstagramLogo size={24} />,
              },
              {
                link: "https://www.tiktok.com",
                icon: <PiTiktokLogo size={24} />,
              },
              {
                link: "https://www.youtube.com",
                icon: <PiYoutubeLogo size={24} />,
              },
              {
                link: "https://www.smktamtamakroya.sch.id",
                icon: <PiGlobe size={24} />,
              },
            ].map((social, index) => (
              <div
                key={index}
                className="w-10 h-10 bg-secondary group rounded-md flex items-center justify-center"
              >
                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group-hover:scale-120"
                >
                  {social.icon}
                </a>
              </div>
            ))}
          </div>
          <button
            onClick={scrollToTop}
            className="w-fit h-fit flex items-center rounded-md group justify-center gap-3 border p-2"
          >
            <BsChevronUp
              size={24}
              className="transition-transform group-hover:transition-transform duration-200 ease-in-out group-hover:-translate-y-1"
            />{" "}
            <p className="group-hover:font-semibold">Back to Top</p>
          </button>
        </div>
        <div className="w-full h-full border border-primary grid grid-cols-2">
          <div>
            <h2 className="mb-6">ShotCut Link</h2>
            <div className="w-full h-fit space-y-2">
              {navFooterSection.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="
                        w-fit relative flex flex-row last:mb-0 justify-left items-center text-sm font-medium text-white transition-colors duration-200 ease-in-out
                        after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-white 
                        after:transition-all after:duration-300 after:ease-in-out
                        hover:after:w-full"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-6">Page</h2>
            <div className="w-full h-fit space-y-2">
              {navFooterPage.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="
                        w-fit relative flex flex-row last:mb-0 justify-left items-center text-sm font-medium text-white transition-colors duration-200 ease-in-out
                        after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-white 
                        after:transition-all after:duration-300 after:ease-in-out
                        hover:after:w-full"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 bottom-0 self-baseline bg-accent text-primary w-full flex flex-row justify-center items-center text-sm font-medium">
        Copyright © {currentYear}, SMK Tamtama Kroya, All Right Reserved
      </div>
    </footer>
  );
};

export default Footer;

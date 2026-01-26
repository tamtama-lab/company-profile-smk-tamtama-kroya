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
import { TextButton } from "../Buttons/TextButton";

const currentYear = new Date().getFullYear();

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const Footer: React.FC = () => {
  const routeToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <footer className="h-fit bg-primary text-white shadow-lg w-full flex flex-col">
      <div className="h-full w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 px-4 sm:px-10 lg:px-20 xl:px-36 py-8 sm:py-10 lg:py-12 gap-x-8 lg:gap-x-16 gap-y-6 lg:gap-y-5 mb-6 sm:mb-8 lg:mb-10">
        <div className="w-full col-span-1 sm:col-span-2 lg:col-span-2 flex flex-row justify-start items-center border border-primary gap-3">
          <Image
            src="/header/logo.png"
            alt="logo-smk-tamtama-kroya"
            width={40}
            height={40}
          />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-accent">
            SMK TAMTAMA KROYA
          </h1>
        </div>
        <div className="w-full h-full border border-primary flex flex-col justify-between max-md:space-y-6">
          <div className="w-full ">
            <h2 className="text-sm sm:text-base mb-4 sm:mb-6">
              Siap Kerja • Siap Mandiri • Siap Bersaing.
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed">
              SMK Tamtama Kroya berkomitmen menghadirkan pendidikan vokasional
              berkualitas dengan pembelajaran berbasis praktik dan industri,
              guna mencetak lulusan berkarakter, kompeten, dan siap kerja.
            </p>
          </div>
          <div className="w-fit grid grid-cols-4 gap-3 sm:gap-4 lg:gap-6 justify-start items-center">
            {[
              {
                link: "https://www.instagram.com/smk_tamtama_kroya",
                icon: <PiInstagramLogo size={20} className="sm:w-6 sm:h-6" />,
              },
              {
                link: "https://www.tiktok.com/@smk.tamtama.kroya.clp",
                icon: <PiTiktokLogo size={20} className="sm:w-6 sm:h-6" />,
              },
              {
                link: "https://www.youtube.com/@smktamtamakroya4678",
                icon: <PiYoutubeLogo size={20} className="sm:w-6 sm:h-6" />,
              },
              {
                link: "https://www.smktamtamakroya.sch.id",
                icon: <PiGlobe size={20} className="sm:w-6 sm:h-6" />,
              },
            ].map((social, index) => (
              <div
                key={index}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary group rounded-md flex items-center justify-center hover:scale-105 transition-transform"
              >
                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  {social.icon}
                </a>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-row justify-start items-center gap-4 sm:gap-6">
            <TextButton
              text="Kembali ke Atas"
              icon={<BsChevronUp size={20} className="sm:w-6 sm:h-6" />}
              variant="ghost"
              onClick={scrollToTop}
            />
            <TextButton
              text="Log In Guru"
              variant="ghost"
              onClick={routeToLogin}
            />
          </div>
        </div>
        <div className="w-full h-full border border-primary grid grid-cols-2 gap-0">
          <div className="border-r border-primary">
            <h4 className="mb-4 sm:mb-6 text-xs sm:text-sm font-semibold">
              ShotCut Link
            </h4>
            <div className="w-full h-fit space-y-2 sm:space-y-3">
              {navFooterSection.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="
                        w-fit relative flex flex-row last:mb-0 justify-left items-center text-xs sm:text-sm font-medium text-white transition-colors duration-200 ease-in-out
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
            <h4 className="mb-4 sm:mb-6 text-xs sm:text-sm font-semibold">
              Page
            </h4>
            <div className="w-full h-fit space-y-2 sm:space-y-3">
              {navFooterPage.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="
                        w-fit relative flex flex-row last:mb-0 justify-left items-center text-xs sm:text-sm font-medium text-white transition-colors duration-200 ease-in-out
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
      <div className="h-10 sm:h-12 bottom-0 self-baseline bg-accent text-primary w-full flex flex-row justify-center items-center text-xs max-sm:text-[10px] font-medium px-4">
        Copyright © {currentYear}, SMK Tamtama Kroya, All Right Reserved
      </div>
    </footer>
  );
};

export default Footer;

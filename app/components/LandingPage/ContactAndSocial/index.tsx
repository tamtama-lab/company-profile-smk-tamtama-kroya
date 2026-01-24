import { SectionTitle } from "@/components/SectionTitle";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import Image from "next/image";
import { TextButton } from "@/components/Buttons/TextButton";
import {
  IoChatboxEllipsesOutline,
  IoChevronDown,
  IoGlobeSharp,
  IoLocationOutline,
} from "react-icons/io5";
import React from "react";

interface contactList {
  name: string;
  contact: string;
  icon: React.ReactNode;
}

interface socialList {
  name: string;
  contact: string;
  icon: string;
  hyperlink?: string;
}

interface adminList {
  number: string;
  label: string;
  adminName: string;
}

export const ContactAndSocial: React.FC<{
  id?: string;
  contactList: contactList[];
  socialList: socialList[];
  adminList: adminList[];
}> = ({ id, contactList, socialList, adminList }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  const closeModal = () => setModalOpen(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const message =
    "Halo! Mohon informasikan pendaftaran murid baru di SMK Tamtama Kroya.";

  const encodedMessage = encodeURIComponent(message);

  return (
    <section
      id={id || "kontak-sosial-media"}
      className="w-full mb-12 py-8 sm:py-10 h-fit space-y-12"
    >
      <SectionTitle
        title="Kontak & Sosial Media"
        subtitle="Butuh informasi lebih lanjut seputar PPDB SMK Tamtama Kroya? <br />
        Hubungi kami melalui kontak di bawah ini atau ikuti media sosial resmi kami."
        align="center"
      />

      <div className="w-full h-full py-16 px-36 border rounded-none overflow-hidden border-gray-300 bg-white grid grid-cols-2 grid-rows-3 max-md:grid-cols-1 max-lg:grid-cols-1 max-md:px-3 max-lg:px-10 max-md:py-8 max-md:space-y-0 gap-6 max-md:gap-0">
        {/* sisi kiri */}
        <div className="w-full h-full flex flex-col row-span-3 max-md:grid max-md:grid-cols-2 max-lg:grid-cols-2 border-r-2 max-md:border-none border-gray-300 max-md:justify-around justify-around max-md:space-y-6 px-4 max-md:px-0">
          {contactList.map((contact, index) => (
            <ScrollAnimationWrapper key={index} direction="up">
              <div className="w-full h-full flex p-4 max-md:p-1 justify-start space-x-5 max-md:space-x-1 flex-row max-sm:flex-col items-start  bg-white border-gray-300">
                <div className="w-12 max-md:w-8 max-md:h-8 h-12 text-4xl max-md:text-2xl flex justify-center items-center text-primary rounded-md text-primary bg-[#E8F5EE] shrink-0 max-sm:mb-3">
                  {contact.icon}
                </div>
                <div>
                  <h4 className="text-lg max-md:text-base font-semibold">
                    {contact.name}
                  </h4>
                  <a
                    className="text-base max-md:text-xs max-md:text-justify"
                    dangerouslySetInnerHTML={{ __html: contact.contact }}
                  ></a>
                </div>
              </div>
            </ScrollAnimationWrapper>
          ))}
        </div>
        {/* sisi kiri */}
        {/* sisi kanan atas */}
        <div className="w-full max-md:mt-6 row-span-2 px-4 max-sm:px-2">
          <div className="w-full">
            <h3 className="text-xl max-sm:text-lg mb-4 text-primary font-semibold">
              Sosial Media Resmi
            </h3>
            <h3 className="text-base max-sm:text-sm">
              Ikuti dan pantau informasi terbaru PPDB kami melalui media sosial
              resmi:
            </h3>
          </div>
          <div className="w-full grid grid-cols-1 max-sm:grid-cols-2 gap-3 border-b-2 border-gray-300 my-4 pb-4 max-md:pb-1 max-sm:pb-6">
            {socialList.map((contact, index) => (
              <ScrollAnimationWrapper key={index} direction="up">
                <div className="max-w-xl max-sm:w-full max-md:w-full grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-2 xl:mb-6 justify-center items-center p-0 rounded-md bg-white border-gray-300 max-sm:mb-3">
                  <div className="w-full flex flex-row justify-start items-center space-x-4">
                    <div className="w-fit h-fit shrink-0 max-md:text-lg text-4xl flex justify-center items-center text-primary">
                      <Image
                        width={10}
                        height={10}
                        src={contact.icon}
                        alt={contact.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="text-lg h-full max-md:text-sm w-fit font-semibold">
                      {contact.name}
                    </div>
                  </div>
                  <div className="w-full">
                    <a
                      href={`${contact.hyperlink || "#"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base max-md:text-sm text-gray-600 hover:underline hover:underline-offset-2"
                    >
                      {contact.contact}
                    </a>{" "}
                  </div>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
        {/* sisi kanan bawah */}
        <div className="w-full grid row-span-1 cols-span-1 p-3 max-sm:p-1">
          <div className="w-full flex flex-row justify-between">
            {/* Whatsapp Button */}
            <div className="h-full relative z-11 w-[60%]">
              <button
                className={`h-full w-full border ${modalOpen ? "border-primary-light" : ""} border-primary flex flex-row px-6 py-2 rounded-sm bg-primary justify-between items-center space-x-4 max-md:px-1 max-md:py-1 max-md:text-sm text-white group 
            transition-transform duration-200 ease-in-out cursor-pointer`}
                onClick={() => setModalOpen((prev) => !prev)}
              >
                <Image
                  src="/sosmed/whatsapp.svg"
                  width={24}
                  height={24}
                  alt="whatsapp"
                />
                <p
                  className={` max-sm:text-xs ${modalOpen ? "font-bold" : ""}`}
                >
                  Hubungi via Whatsapp
                </p>
                <IoChevronDown
                  className={`w-6 h-6 ${modalOpen ? "-rotate-90" : ""} transition-transform duration-300`}
                />
              </button>
              {modalOpen && (
                <div
                  className="absolute mt-0 max-md:-top-32 max-sm:-top-30  w-full z-20 flex items-center justify-center bg-transparent"
                  onClick={closeModal}
                >
                  <div
                    className="w-full rounded-lg bg-transparent shadow-xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="w-full flex justify-start h-2 bg-transparent">
                      {/* <div
                        className="w-0 h-0 
                        border-2
                        border-t-0 border-t-transparent
                        border-l-2 border-l-blue-300
                        border-b-24 border-b-blue-300 
                        border-r-30 border-r-transparent"
                      ></div> */}
                    </div>

                    <div className="w-full border border-gray-400 bg-white flex flex-col p-2 rounded-md space-y-2">
                      {adminList.map((admin, index) => (
                        <div
                          key={index}
                          className="w-full p-1 text-primary flex justify-between items-center font-normal hover:translate-x-2 group hover:underline hover:underline-offset-2 transition-transform duration-200"
                        >
                          <a
                            href={`https://wa.me/${admin.number}?text=${encodedMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-left max-sm:text-xs"
                          >
                            {admin.label} {admin.adminName}
                          </a>
                          <IoChatboxEllipsesOutline className="w-6 h-6 hidden group-hover:block items-end" />
                        </div>
                      ))}
                    </div>
                    {/* <div className="mt-3 flex justify-end">
                      <TextButton
                        className="py-0"
                        variant="outline"
                        text="Tutup"
                        onClick={closeModal}
                      />
                    </div> */}
                  </div>
                </div>
              )}
            </div>
            {/* Whatsapp Button */}
            <TextButton
              className="w-[40%] h-full text-primary bg-primary-light border-primary"
              icon={<IoGlobeSharp className="text-xl" />}
              variant="light"
              width="fit"
              text="Kunjungi Website"
              onClick={() => window.open("https://smktamtama.sch.id", "_blank")}
            />
          </div>
          <div className="w-full py-3 flex flex-col justify-center text-center">
            Kami Tunggu Kedatangan Anda ! 😃
          </div>
          <div className="w-full flex justify-center items-center">
            <TextButton
              className="text-primary border-primary max-md:py-2"
              icon={<IoLocationOutline className="text-xl" />}
              variant={"outline"}
              width="full"
              text="Lihat Lokasi Sekolah"
              onClick={() =>
                window.open(
                  "https://maps.app.goo.gl/K7yiBoFCgicosfzv9",
                  "_blank",
                )
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

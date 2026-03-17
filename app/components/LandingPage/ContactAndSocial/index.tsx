import { SectionTitle } from "@/components/SectionTitle";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import Image from "next/image";
import { TextButton } from "@/components/Buttons/TextButton";
import { IoGlobeSharp, IoLocationOutline } from "react-icons/io5";
import React from "react";
import Dropdown from "@/components/Dropdown";
import { BsWhatsapp } from "react-icons/bs";

type SocialMediaItem = { url?: string; isActive?: boolean };

export type SchoolSettings = {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  whatsappNumbers?: { name: string; label: string; number: string }[];
  socialMedia?: {
    tiktok?: SocialMediaItem | SocialMediaItem[];
    youtube?: SocialMediaItem | SocialMediaItem[];
    facebook?: SocialMediaItem | SocialMediaItem[];
    instagram?: SocialMediaItem | SocialMediaItem[];
  };
  brochureFrontUrl?: string | null;
  brochureBackUrl?: string | null;
};

interface whatsappNumber {
  name: string;
  label: string;
  number: string;
}

export interface schoolSettingData {
  email: string;
  phoneNumber: string;
  website: string;
  address: string;
  whatsappNumber: Array<whatsappNumber>;
}

interface contactList {
  name: string;
  contact: string;
  icon: React.ReactNode;
}

interface socialList {
  name: string;
  contact: string | string[];
  icon: React.ReactNode | string;
  hyperlink?: string | string[];
  extraContacts?: { label: string; href: string }[];
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
  const [openExtraKey, setOpenExtraKey] = React.useState<string | null>(null);

  const closeModal = () => setModalOpen(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        setOpenExtraKey(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!openExtraKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-social-extra-key="${openExtraKey}"]`)) return;
      setOpenExtraKey(null);
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openExtraKey]);

  const message =
    "Halo! Mohon informasikan pendaftaran murid baru di SMK Tamtama Kroya.";

  const encodedMessage = encodeURIComponent(message);
  const extraContactsPopoverClassName =
    "absolute right-0 top-full mt-2 z-10 w-fit min-w-max rounded-md border border-gray-200 bg-white p-2 shadow-lg";

  return (
    <section
      id={id || "kontak-sosial-media"}
      className="w-full mb-12 py-8 sm:py-10 h-fit space-y-12"
    >
      <SectionTitle
        title="Kontak & Sosial Media"
        subtitle="Butuh informasi lebih lanjut seputar SPMB SMK Tamtama Kroya? <br />
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
              Ikuti dan pantau informasi terbaru SPMB kami melalui media sosial
              resmi:
            </h3>
          </div>
          <div className="w-full grid grid-cols-1 max-sm:grid-cols-2 gap-3 border-b-2 border-gray-300 my-4 pb-4 max-md:pb-1 max-sm:pb-6">
            {socialList.map((contact, index) => (
              <ScrollAnimationWrapper key={index} direction="up">
                <div className="max-w-xl max-sm:w-full max-md:w-full grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-y-2 xl:mb-6 justify-center items-center p-0 rounded-md bg-white border-gray-300 max-sm:mb-3">
                  <div className="w-full flex flex-row justify-start items-center space-x-4">
                    <div className="w-fit h-fit shrink-0 max-md:text-lg text-4xl flex justify-center items-center text-primary">
                      {typeof contact.icon === "string" ? (
                        <Image
                          width={10}
                          height={10}
                          src={contact.icon}
                          alt={contact.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        contact.icon
                      )}
                    </div>
                    <div className="text-lg h-full max-md:text-sm w-fit font-semibold">
                      {contact.name}
                    </div>
                  </div>
                  <div className="w-full">
                    {/* Multi akun: tampilkan vertikal dan beri popover untuk akun tambahan */}
                    {Array.isArray(contact.contact) &&
                    Array.isArray(contact.hyperlink) ? (
                      <div className="flex flex-col gap-1">
                        {contact.contact.map((item, idx) => {
                          const link =
                            (contact.hyperlink && contact.hyperlink[idx]) || "";
                          const isLast = idx === contact.contact.length - 1;
                          const hasExtra =
                            (contact.extraContacts?.length || 0) > 0;

                          const showExtraButton = isLast && hasExtra;
                          const extraKey = `${contact.name}-${index}-${idx}`;

                          if (!link) {
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-start gap-2"
                              >
                                <span className="text-base max-md:text-sm text-gray-600">
                                  {item}
                                </span>
                                {showExtraButton ? (
                                  <div
                                    data-social-extra-key={extraKey}
                                    className="relative shrink-0"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenExtraKey((prev) =>
                                          prev === extraKey ? null : extraKey,
                                        )
                                      }
                                      className="text-xs px-2 py-1 rounded-sm border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                      +{contact.extraContacts?.length}
                                    </button>
                                    {openExtraKey === extraKey ? (
                                      <div
                                        className={
                                          extraContactsPopoverClassName
                                        }
                                      >
                                        <div className="flex w-fit flex-col gap-1">
                                          {contact.extraContacts?.map(
                                            (extra, extraIdx) => (
                                              <a
                                                key={extraIdx}
                                                href={extra.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-fit whitespace-nowrap text-xs text-gray-700 hover:underline hover:underline-offset-2"
                                              >
                                                {extra.label}
                                              </a>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-start gap-2"
                            >
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base max-md:text-sm text-gray-600 hover:underline hover:underline-offset-2"
                              >
                                {item}
                              </a>
                              {showExtraButton ? (
                                <div
                                  data-social-extra-key={extraKey}
                                  className="relative shrink-0"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenExtraKey((prev) =>
                                        prev === extraKey ? null : extraKey,
                                      )
                                    }
                                    className="text-xs px-2 py-1 rounded-sm border border-primary text-primary transition-colors"
                                  >
                                    +{contact.extraContacts?.length}
                                  </button>
                                  {openExtraKey === extraKey ? (
                                    <div
                                      className={extraContactsPopoverClassName}
                                    >
                                      <div className="flex w-fit flex-col gap-1">
                                        {contact.extraContacts?.map(
                                          (extra, extraIdx) => (
                                            <a
                                              key={extraIdx}
                                              href={extra.href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="w-fit whitespace-nowrap text-sm text-gray-700 hover:underline hover:underline-offset-2"
                                            >
                                              {extra.label}
                                            </a>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <a
                        href={
                          Array.isArray(contact.hyperlink)
                            ? contact.hyperlink[0]
                            : contact.hyperlink || "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base max-md:text-sm text-gray-600 hover:underline hover:underline-offset-2"
                      >
                        {Array.isArray(contact.contact)
                          ? contact.contact[0]
                          : contact.contact}
                      </a>
                    )}
                  </div>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
        {/* sisi kanan bawah */}
        <div className="w-full grid row-span-1 cols-span-1 p-3 max-sm:p-1">
          <div className="w-full max-h-12 grid grid-cols-7 gap-4">
            <div className="col-span-4">
              <Dropdown
                isOpen={modalOpen}
                onOpen={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
                label="Hubungi via Whatsapp"
                leftIcon={<BsWhatsapp size={20} />}
                color="bg-primary"
                width="w-full"
                className="px-4 max-sm:px-2 h-fit"
                textColor="text-white"
                rounded="rounded-md"
              >
                {adminList.map((admin, index) => (
                  <div
                    key={index}
                    className="w-full p-1 text-primary flex justify-between items-center font-normal group hover:underline hover:underline-offset-2 transition-transform duration-200"
                  >
                    <a
                      href={`https://wa.me/${admin.number}?text=${encodedMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-left max-sm:text-xs"
                    >
                      {admin.label} {admin.adminName}
                    </a>
                    {/* <IoChatboxEllipsesOutline className="w-6 h-6 hidden group-hover:block items-end" /> */}
                  </div>
                ))}
              </Dropdown>
            </div>
            {/* Whatsapp Button */}
            <TextButton
              className="w-full col-span-3 h-full text-primary bg-primary-light border-primary"
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

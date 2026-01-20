"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { ImageZoomModal } from "@/components/Modal/ImageZoomModal";
import Image from "next/image";
import { useState } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";

const brochureList = [
  { image: "/brochure/brosur-depan.png", alt: "Brosur Depan" },
  { image: "/brochure/brosur-belakang.png", alt: "Brosur Belakang" },
];

export const BrochureSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{
    image: string;
    alt: string;
  } | null>(null);

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <section className="w-full mb-12 py-10 h-fit space-y-12">
        <SectionTitle title="Info Brosur" align="center" />

        <div className="w-full h-[80vh] border rounded-2xl overflow-hidden border-gray-300 bg-gray-200 flex flex-row px-20 py-10 gap-5 justify-between">
          {brochureList.map((item, index) => (
            <div key={index} className="h-full w-full flex flex-col">
              <div className="h-9/10 bg-white p-2 rounded-lg">
                <Image
                  className="w-full h-full cursor-zoom-in hover:opacity-80 transition-opacity"
                  src={item?.image}
                  alt={item?.alt}
                  width={500}
                  height={700}
                  onClick={() => setSelectedImage(item)}
                />
              </div>
              <div className="h-1/10  text-center flex justify-center items-center gap-2 text-sm text-gray-600">
                <PiMagnifyingGlassBold size={24} />{" "}
                <p className="text-base">Klik untuk zoom</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ImageZoomModal
        isOpen={selectedImage !== null}
        imageSrc={selectedImage?.image || ""}
        imageAlt={selectedImage?.alt || "Brosur"}
        onClose={handleCloseModal}
      />
    </>
  );
};

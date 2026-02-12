"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { ImageZoomModal } from "@/components/Modal/ImageZoomModal";
import { useState } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";

interface Brochure {
  image: string;
  alt: string;
}

export const BrochureSection: React.FC<{
  id?: string;
  brochureList: Brochure[];
}> = ({ id, brochureList }) => {
  const [selectedImage, setSelectedImage] = useState<Brochure | null>(null);

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <section
        id={id || "info-brosur"}
        className="w-full mb-12 py-8 sm:py-10 px-4 sm:px-8 h-fit space-y-12"
      >
        <SectionTitle
          title="Info Brosur"
          subtitle="Semua informasi penting PPDB kami rangkum dalam satu brosur yang mudah dipahami."
          align="center"
        />

        <div className="w-full h-auto lg:h-[80vh] border rounded-2xl overflow-hidden border-gray-300 bg-gray-200 flex flex-col lg:flex-row px-4 sm:px-8 lg:px-20 py-6 sm:py-10 gap-3 sm:gap-5 justify-between">
          {brochureList.map((item, index) => (
            <ScrollAnimationWrapper
              key={index}
              direction="up"
              delay={index * 0.1}
              className="h-auto lg:h-full w-full flex flex-col"
            >
              <div className="h-64 sm:h-80 lg:h-9/10 bg-white p-2 rounded-lg">
                <img
                  className="w-full h-full cursor-zoom-in hover:opacity-80 transition-opacity object-cover"
                  src={item?.image}
                  alt={item?.alt}
                  width={500}
                  height={700}
                  onClick={() => setSelectedImage(item)}
                />
              </div>
              <div className="h-12 sm:h-14 lg:h-1/10 text-center flex justify-center items-center gap-2 text-xs sm:text-sm text-gray-600">
                <PiMagnifyingGlassBold size={20} className="sm:w-6 sm:h-6" />
                <p className="text-sm sm:text-base">Klik untuk zoom</p>
              </div>
            </ScrollAnimationWrapper>
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

import { FaCheck } from "react-icons/fa6";
import { SectionTitle } from "../../SectionTitle";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import Image from "next/image";

export const WhyChooseUs: React.FC<{ id?: string }> = ({ id }) => {
  const reasons = [
    "Kurikulum Nasional & Penguatan Karakter",
    "Guru Professional & Pengalaman",
    "Fasilitas modern: Lab, perpustakaan, ruang multimedia, Wi-Fi",
    "Pembinaan prestasi akademik & non-akademik",
  ];

  return (
    <section
      id={id || "mengapa-pilih-tamtama"}
      className="w-full mb-12 px-4 sm:px-8 lg:px-12 xl:px-36 py-8 sm:py-10 h-fit space-y-12"
    >
      <SectionTitle
        title="Mengapa Harus SMK Tamtama Kroya?"
        subtitle="Pilihan tepat untuk membangun masa depan melalui pendidikan vokasi berkualitas"
        align="center"
      />

      <div className="w-full h-auto lg:h-[70vh] border border-gray-100 flex flex-col lg:flex-row lg:px-8 xl:px-16 gap-6 lg:gap-0">
        <ScrollAnimationWrapper className="w-full aspect-h-3 aspect-w-4 bg-gray-300 rounded-2xl max-sm:rounded-lg overflow-hidden">
          <Image
            src="/ppdb/smk-tamtama.jpeg"
            alt="why-choose-us-smk-tamtama-kroya"
            width={400}
            height={200}
            className="w-full h-full aspect-video object-cover rounded-xl max-sm:rounded-lg"
          />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper
          direction="up"
          className="w-full lg:w-6/10 h-auto lg:h-full py-6 max-sm:py-0 lg:py-20 max-sm:px-0 px-4 sm:px-6 lg:px-10 flex justify-center items-center"
        >
          <div className="w-full h-full flex justify-center items-center">
            <ol className="w-full space-y-6 lg:space-y-12">
              {reasons.map((item, index) => (
                <li
                  key={index}
                  className="w-full flex flex-row items-start gap-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 min-w-8 sm:min-w-10 rounded-full bg-[#AADAC045] flex justify-center items-center shrink-0 flex-shrink-0">
                    <FaCheck size={18} className="max-sm:w-6 max-sm:h-6" />
                  </div>
                  <p className="text-sm max-sm:text-sm lg:text-lg text-justify leading-relaxed">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

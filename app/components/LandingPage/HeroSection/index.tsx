import { TextButton } from "@/components/Buttons/TextButton";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { getAcademicYear } from "@/lib/getAcademicYear";
import Image from "next/image";
import { GiGraduateCap } from "react-icons/gi";

export const HeroSection: React.FC = () => {
  const handleRegistrationRoute = () => {
    window.location.href = "/pendaftaran";
  };

  const handleDepartmentRoute = () => {
    window.location.href = "/jurusan";
  };

  return (
    <section className="w-full h-fit min-h-[80vh] bg-background text-primary flex flex-row items-center justify-center px-48 max-sm:px-8 max-md:px-16 max-lg:px-12 max-xl:px-40 py-10">
      <div className="w-full h-full flex flex-row max-sm:flex-col justify-between items-center">
        {/* Text Section */}
        <div className=" h-full w-[56%] max-sm:w-full flex flex-col items-center justify-center">
          <div className="w-full h-full flex-col space-y-4">
            <ScrollAnimationWrapper className="relative max-sm:ml-10">
              <h2 className="text-xl max-sm:text-lg">Selamat Datang di</h2>
              <ScrollAnimationWrapper className="absolute -left-12 -top-1">
                <GiGraduateCap size={40} color="#014921" />
              </ScrollAnimationWrapper>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper>
              <h1 className="text-3xl max-sm:text-2xl text-left text-text font-semibold">
                Portal Penerimaan Peserta Didik Baru (PPDB) SMK Tamtama Kroya{" "}
                {getAcademicYear()}
              </h1>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper>
              <h2 className="text-xl max-sm:text-lg text-primary">
                🏅SMK Pusat Keunggulan (PK)
              </h2>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper className="w-[90%] max-sm:w-full flex items-start justify-start">
              <h3 className="text-justify max-sm:text-sm text-gray-600">
                Bergabunglah bersama kami untuk memulai perjalanan pendidikan
                yang membekali keterampilan, karakter, dan kesiapan menghadapi
                dunia kerja dan masa depan.
              </h3>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper className="w-full space-x-6 flex flex-row">
              <TextButton
                variant="primary"
                text="Daftar Sekarang"
                width="full"
                onClick={handleRegistrationRoute}
              />
              <TextButton
                variant="outline"
                text="Lihat Jurusan"
                width="full"
                onClick={handleDepartmentRoute}
              />
            </ScrollAnimationWrapper>
          </div>
        </div>
        {/* Image Section */}
        <ScrollAnimationWrapper className="w-[36%] max-sm:mt-6 max-sm:w-full h-fit flex items-center justify-center">
          <Image
            src="/ppdb/hero-image.png"
            alt="Hero Image"
            width={500}
            height={600}
            priority
            className="w-fit h-fit rounded-lg"
          />
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

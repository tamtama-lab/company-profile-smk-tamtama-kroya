import { TextButton } from "@/components/Buttons/TextButton";
import { GiGraduateCap } from "react-icons/gi";
const currentYear = new Date().getFullYear();

export const HeroSection: React.FC = () => {
  return (
    <section className="w-full h-fit min-h-[80vh] bg-[#F5F5F5] text-primary flex flex-row items-center justify-center px-48 pt-20">
      <div className="w-full h-[90%] flex flex-row justify-between">
        {/* Text Section */}
        <div className="relative h-full w-[60%] flex flex-col items-center justify-center py-10">
          <div className="w-full h-full flex-col space-y-4">
            <h2 className="text-xl">Selamat Datang di</h2>
            <h1 className="text-3xl text-[#2D2D2D] font-semibold">
              Portal Penerimaan Peserta Didik Baru
            </h1>
            <h1 className="text-3xl text-[#2D2D2D] font-semibold">
              (PPDB) SMK Tamtama Kroya {currentYear} / {currentYear + 1}
            </h1>
            <h2 className="text-xl text-[#014921]">
              🏅SMK Pusat Keunggulan (PK)
            </h2>
            <h3>
              Bergabunglah bersama kami untuk memulai perjalanan pendidikan yang
              membekali keterampilan, karakter, dan kesiapan menghadapi dunia
              kerja dan masa depan.
            </h3>
            <div className="w-full space-x-6 flex flex-row">
              <TextButton type="primary" text="Daftar Sekarang" width="full" />
              <TextButton type="secondary" text="Lihat Jurusan" width="full" />
            </div>
          </div>
          <div className="absolute -left-16 top-9">
            <GiGraduateCap size={40} color="#014921" />
          </div>
        </div>
        {/* Text Section */}
        <div className="w-[34%] flex items-center justify-center">
          <div className="w-full h-full bg-gray-300 rounded-2xl"></div>
        </div>
      </div>
    </section>
  );
};

import { SectionTitle } from "@/components/SectionTitle";
import { FaCheck } from "react-icons/fa6";

export const RegistrationPath: React.FC = () => {
  return (
    <section className="w-full border border-red-500 mb-12 px-24 py-10 h-fit space-y-12">
      <SectionTitle
        title="Jalur Pendaftaran"
        subtitle="Tersedia beberapa jalur pendaftaran yang dapat disesuaikan dengan prestasi dan kemampuan calon peserta didik."
        align="center"
      />

      <div className="w-full h-[70vh] border border-gray-100 flex flex-row px-32">
        <div className="w-4/10 h-full border  border-purple-500">
          <div className="w-full h-full bg-gray-700 rounded-2xl"></div>
        </div>
        <div className="w-6/10 h-full border border-purple-500 py-20 px-12">
          <div className="w-full h-full flex justify-center items-center border">
            <ol className="w-full space-y-12 border">
              {[
                "Kurikulum Nasional & Penguatan Karakter",
                "Guru Professional & Pengalaman",
                "Fasilitas modern: Lab, perpustakaan, ruang multimedia, Wi-Fi",
                "Pembinaan prestasi akademik & non-akademik",
              ].map((item, index) => (
                <li
                  key={index}
                  className="w-full flex flex-row items-center space-x-6"
                >
                  <div className="w-10 h-10 rounded-full bg-[#AADAC045] flex justify-center items-center">
                    <FaCheck size={24} />
                  </div>
                  <p className="text-lg">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

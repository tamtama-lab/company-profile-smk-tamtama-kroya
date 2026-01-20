import { FaCheck } from "react-icons/fa6";
import { SectionTitle } from "../../SectionTitle";

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="w-full mb-12 px-24 py-10 h-fit space-y-12">
      <SectionTitle
        title="Mengapa Harus SMK Tamtama Kroya?"
        subtitle="Pilihan tepat untuk membangun masa depan melalui pendidikan vokasi berkualitas"
        align="center"
      />

      <div className="w-full h-[70vh] border border-gray-100 flex flex-row px-32">
        <div className="w-4/10 h-full ">
          <div className="w-full h-full bg-gray-300 rounded-2xl"></div>
        </div>
        <div className="w-6/10 h-full py-20 px-10">
          <div className="w-full h-full flex justify-center items-center">
            <ol className="w-full space-y-12">
              {[
                "Kurikulum Nasional & Penguatan Karakter",
                "Guru Professional & Pengalaman",
                "Fasilitas modern: Lab, perpustakaan, ruang multimedia, Wi-Fi",
                "Pembinaan prestasi akademik & non-akademik",
              ].map((item, index) => (
                <li key={index} className="w-full flex flex-row items-center">
                  <div className="w-10 h-10 min-w-10 rounded-full bg-[#AADAC045] flex justify-center items-center shrink-0">
                    <FaCheck size={24} />
                  </div>
                  <p className="text-lg ml-6 text-justify">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

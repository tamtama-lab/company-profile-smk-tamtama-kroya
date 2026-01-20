import { BsFire, BsLightningCharge } from "react-icons/bs";
import { FaGears } from "react-icons/fa6";
import { LiaCarSideSolid } from "react-icons/lia";
import { MdOutlineColorLens } from "react-icons/md";
import { SectionTitle } from "@/components/SectionTitle";
import VacationCard from "@/components/Card/VacationCard";

export const VacationTotal: React.FC = () => {
  const vacationList = [
    {
      name: "TKR",
      description: "Teknik Kendaraan Ringan",
      color: "#FF8E8E",
      total: 125,
      precentage: 83.33,
      isPopular: true,
      icon: <LiaCarSideSolid color="#FF8E8E" size={40} />,
    },
    {
      name: "DKV",
      description: "Desain Komunikasi Visual",
      color: "#2369D1",
      total: 100,
      precentage: 66.67,
      icon: <MdOutlineColorLens color="#2369D1" size={40} />,
    },
    {
      name: "MESIN",
      description: "Teknik Permesinan",
      color: "#5DB1F6",
      total: 125,
      precentage: 73.33,
      icon: <FaGears color="#5DB1F6" size={40} />,
    },
    {
      name: "TITL",
      description: "Teknik Instalasi Tenaga Listrik",
      color: "#4D4FA4",
      total: 125,
      precentage: 83.33,
      icon: <BsLightningCharge color="#4D4FA4" size={40} />,
    },
  ];
  return (
    <section className="w-full mb-12 px-24 py-10 h-fit space-y-12">
      <SectionTitle
        title="Jumlah Pendaftar per Jurusan"
        subtitle="Daftar pendaftar diperbarui secara berkala selama masa PPDB  berlangsung"
        align="center"
      />
      {/* <div className="w-full h-full flex justify-center items-center py-6 border border-[#014921] rounded-lg">
        <h1 className="text-2xl font-semibold text-[#014921]">
          Pendaftar Tervalidasi:
        </h1>
        <span className="bg-[#56B680] px-2 py-0.5 rounded ml-2">
          <h1 className="text-2xl text-white">150</h1>
        </span>
      </div> */}
      <div className="w-full border border-gray-100 grid grid-cols-2 gap-10 px-32">
        {vacationList.map((item, index) => (
          <VacationCard key={index} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};

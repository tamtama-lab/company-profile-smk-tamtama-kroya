import { BsFire, BsLightningCharge } from "react-icons/bs";
import { FaGears } from "react-icons/fa6";
import { LiaCarSideSolid } from "react-icons/lia";
import { MdOutlineColorLens } from "react-icons/md";
import { SectionTitle } from "@/components/SectionTitle";

export const VacationTotal: React.FC = () => {
  return (
    <section className="w-full border border-red-500 mb-12 px-24 py-10 h-fit space-y-12">
      <SectionTitle
        title="Jumlah Pendaftar per Jurusan"
        subtitle="Daftar pendaftar diperbarui secara berkala selama masa PPDB  berlangsung"
        align="left"
      />
      <div className="w-full h-full flex justify-center items-center py-6 border border-[#014921] rounded-lg">
        <h1 className="text-2xl font-semibold text-[#014921]">
          Pendaftar Tervalidasi:
        </h1>
        <span className="bg-[#56B680] px-2 py-0.5 rounded ml-2">
          <h1 className="text-2xl text-white">150</h1>
        </span>
      </div>
      <div className="w-full border border-gray-100 grid grid-cols-2 gap-10 px-32">
        {[
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
        ].map((item, index) => (
          <div
            key={index}
            className={`relative w-full border border-gray-400 shadow-sm border-l-12 h-60 rounded-xl p-10 flex flex-col justify-between`}
            style={{ borderLeftColor: item.color }}
          >
            {item.isPopular && (
              <div className="absolute right-6 top-4 bg-red-200 rounded flex flex-row space-x-2 py-0.5 px-1 items-center">
                <BsFire color="red" />
                <p className="text-xs">Ramai Peminat</p>
              </div>
            )}
            <div className="flex flex-row justify-start items-center space-x-6">
              <div className="w-20 h-20 border-2 border-gray-400 rounded-md flex justify-center items-center">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h3
                  className={`font-semibold text-2xl`}
                  style={{ color: item.color }}
                >
                  {item.name}
                </h3>
                <p className="text-lg">{item.description}</p>
              </div>
            </div>
            <div className="w-full mt-4 space-y-3 border-t-2 border-gray-300">
              <div className="flex flex-row space-x-3 justify-start items-center mt-1">
                <h3
                  className="font-bold text-xl rounded-sm"
                  style={{ color: item.color }}
                >
                  {item.total}
                </h3>
                <h3>Total Pendaftar</h3>
              </div>
              <div className="relative w-full h-6 bg-gray-200 rounded-sm overflow-hidden">
                <div
                  className="absolute inset-0 rounded-sm"
                  style={{
                    backgroundColor: item.color,
                    opacity: 0.2,
                  }}
                />
                <div
                  className="relative h-full rounded-sm transition-all duration-300 flex items-center justify-center"
                  style={{
                    backgroundColor: item.color,
                    width: `${item.precentage}%`,
                  }}
                >
                  <span className="text-xs font-semibold text-white z-10">
                    {item.precentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

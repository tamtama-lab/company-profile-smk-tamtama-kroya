import { BsLightningCharge } from "react-icons/bs";
import { FaGears } from "react-icons/fa6";
import { LiaCarSideSolid } from "react-icons/lia";
import { MdOutlineColorLens } from "react-icons/md";
import { SectionTitle } from "@/components/SectionTitle";
import VacationCard from "@/components/Card/VacationCard";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";

export type MajorData = {
  name: string; // full name
  abbreviation: string;
  capacity: number;
  registrationCount: number;
};

export const VacationTotal: React.FC<{
  id?: string;
  data?: MajorData[];
  loading?: boolean;
}> = ({ id, data = [], loading = false }) => {
  const wrapperClass = loading ? "opacity-60" : "";
  // icon / color mapping by abbreviation
  const metaMap: Record<
    string,
    { color: string; icon: React.ReactNode; displayName?: string }
  > = {
    TKR: {
      color: "#FF8E8E",
      icon: <LiaCarSideSolid color="#FF8E8E" size={40} />,
    },
    DKV: {
      color: "#2369D1",
      icon: <MdOutlineColorLens color="#2369D1" size={40} />,
    },
    MESIN: { color: "#5DB1F6", icon: <FaGears color="#5DB1F6" size={40} /> },
    TP: { color: "#5DB1F6", icon: <FaGears color="#5DB1F6" size={40} /> },
    TITL: {
      color: "#4D4FA4",
      icon: <BsLightningCharge color="#4D4FA4" size={40} />,
    },
  };

  // Determine the maximum registration count to identify the most popular major(s)
  const maxRegistration = (data || []).length
    ? Math.max(...(data || []).map((x) => x.registrationCount ?? 0))
    : 0;

  const vacationList = (data || []).map((d) => {
    const abbr = d.abbreviation || d.name;
    const registration = d.registrationCount ?? 0;
    const capacity = d.capacity ?? 0;
    const percentage =
      capacity > 0
        ? Math.round((registration / capacity) * 100 * 100) / 100
        : 0;
    const meta = metaMap[abbr] || {
      color: "#888",
      icon: <LiaCarSideSolid color="#888" size={40} />,
    };

    return {
      name: abbr,
      description: d.name,
      color: meta.color,
      total: registration,
      quota: capacity,
      precentage: percentage,
      isPopular: registration > 0 && registration === maxRegistration,
      icon: meta.icon,
    };
  });

  // If no data provided, show defaults (keeps previous behaviour)
  const listToRender = vacationList.length
    ? vacationList
    : [
        {
          name: "TKR",
          description: "Teknik Kendaraan Ringan",
          color: "#FF8E8E",
          total: 0,
          quota: 0,
          precentage: 0,
          icon: <LiaCarSideSolid color="#FF8E8E" size={40} />,
        },
        {
          name: "DKV",
          description: "Desain Komunikasi Visual",
          color: "#2369D1",
          total: 0,
          quota: 0,
          precentage: 0,
          icon: <MdOutlineColorLens color="#2369D1" size={40} />,
        },
        {
          name: "MESIN",
          description: "Teknik Permesinan",
          color: "#5DB1F6",
          total: 0,
          quota: 0,
          precentage: 0,
          icon: <FaGears color="#5DB1F6" size={40} />,
        },
        {
          name: "TITL",
          description: "Teknik Instalasi Tenaga Listrik",
          color: "#4D4FA4",
          total: 0,
          quota: 0,
          precentage: 0,
          icon: <BsLightningCharge color="#4D4FA4" size={40} />,
        },
      ];
  return (
    <section
      id={id || "jumlah-peminat"}
      className={`w-full mb-12 px-4 md:px-12 sm:px-6 lg:px-24 xl:px-56 py-8 sm:py-10 h-fit space-y-12 ${wrapperClass}`}
    >
      <SectionTitle
        title="Statistik Pendaftar per Jurusan"
        subtitle="Daftar pendaftar diperbarui secara berkala selama masa PPDB  berlangsung"
        align="center"
      />
      <div className="w-full grid grid-cols-1 max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 xl:gap-x-12">
        {listToRender.map((item, index) => (
          <ScrollAnimationWrapper
            key={index}
            direction="up"
            delay={index * 0.1}
            className="w-full"
          >
            <VacationCard item={item} index={index} />
          </ScrollAnimationWrapper>
        ))}
      </div>
    </section>
  );
};
